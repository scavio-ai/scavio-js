// `npx scavio <command>`: sign this machine in to Scavio without copying a key.
//
//   scavio login          start a login: prints a link + code (and opens the browser)
//                         In a terminal it then waits for approval. When stdout is
//                         not a terminal (an AI agent running it) it exits at once
//                         so the agent can show the link, then run --wait.
//   scavio login --wait   wait up to 60s for approval; exit 2 = still pending, run again
//   scavio status         does the saved / exported key work?
//   scavio logout         remove the saved key and the shell-profile line
//
// The key is never printed. It goes to ~/.config/scavio/credentials.json and,
// unless --no-profile, to the shell startup file as SCAVIO_API_KEY.
//
// Exit codes: 0 ok, 1 error or expired, 2 still pending, 3 denied.

import { spawn } from "node:child_process";
import { homedir } from "node:os";
import { BASE_URL, SDK_VERSION } from "../http.js";
import { clearCredentials, clearPending, configDir, readCredentials, readPending, saveCredentials, savePending } from "./files.js";
import { checkKey, machineName, startLogin, waitForApproval, type WaitResult } from "./login.js";
import { profileTargets, removeFromProfiles, setWindowsUserEnv, writeProfiles } from "./profile.js";

const KEYS_URL = "https://dashboard.scavio.dev/api-keys";
const UA = `scavio-cli/${SDK_VERSION}`;
const AGENT_WAIT_MS = 60_000;

export const EXIT = { ok: 0, error: 1, pending: 2, denied: 3 } as const;

type Out = { log: (s: string) => void; err: (s: string) => void };
const stdio: Out = { log: (s) => process.stdout.write(s + "\n"), err: (s) => process.stderr.write(s + "\n") };

const HELP = `scavio ${SDK_VERSION} - sign this machine in to the Scavio API

Usage:
  npx -y scavio@latest login            Open a sign-in link; saves an API key for this machine
  npx -y scavio@latest login --wait     Finish a login started by an agent (exit 2 = still waiting)
  npx -y scavio@latest status           Check that the saved key works
  npx -y scavio@latest logout           Remove the saved key from this machine

Options:
  --force        Log in even if SCAVIO_API_KEY already works
  --no-profile   Do not add SCAVIO_API_KEY to your shell startup file
  --no-browser   Print the link without opening a browser
  --timeout <s>  How long --wait waits (default 60)

The key is never printed. Manage or revoke keys at ${KEYS_URL}`;

function tildify(p: string): string {
  const h = homedir();
  return p.startsWith(h) ? "~" + p.slice(h.length) : p;
}

function openBrowser(url: string): void {
  if (process.env.SSH_CONNECTION || process.env.CI) return;
  if (process.platform === "linux" && !process.env.DISPLAY && !process.env.WAYLAND_DISPLAY) return;
  const [cmd, args] =
    process.platform === "darwin"
      ? ["open", [url]]
      : process.platform === "win32"
        ? ["cmd", ["/c", "start", "", url]]
        : ["xdg-open", [url]];
  try {
    const child = spawn(cmd, args as string[], { stdio: "ignore", detached: true });
    child.on("error", () => {});
    child.unref();
  } catch {
    // No browser available: the printed link is enough.
  }
}

function flag(args: string[], name: string): boolean {
  return args.includes(name);
}

function option(args: string[], name: string): string | undefined {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
}

async function finish(result: WaitResult, dir: string, args: string[], baseUrl: string, out: Out): Promise<number> {
  switch (result.kind) {
    case "pending": {
      const p = readPending(dir);
      out.log("pending: not approved yet.");
      if (p) out.log(`Open ${p.verification_uri_complete} and approve code ${p.user_code}.`);
      out.log("Then run again: npx -y scavio@latest login --wait");
      return EXIT.pending;
    }
    case "denied":
      clearPending(dir);
      out.err("The login was denied on the approval page. Nothing was saved.");
      return EXIT.denied;
    case "expired":
      clearPending(dir);
      out.err("The login code expired. Run: npx -y scavio@latest login");
      return EXIT.error;
    case "error":
      clearPending(dir);
      out.err(result.message);
      return EXIT.error;
    case "approved":
      break;
  }

  clearPending(dir);
  let credPath: string;
  try {
    credPath = saveCredentials(dir, { api_key: result.apiKey, key_name: result.keyName, saved_at: new Date().toISOString() });
  } catch (e) {
    out.err(`Approved, but the key could not be saved (${(e as Error).message}).`);
    out.err(`Copy the key "${result.keyName}" from ${KEYS_URL} instead.`);
    return EXIT.error;
  }

  const places: string[] = [];
  if (!flag(args, "--no-profile")) {
    try {
      if (process.platform === "win32") {
        if (setWindowsUserEnv(result.apiKey)) places.push("your Windows user environment");
      } else {
        places.push(...writeProfiles(result.apiKey, profileTargets()));
      }
    } catch (e) {
      out.err(`Could not update the shell startup file (${(e as Error).message}).`);
    }
  }

  out.log(`Logged in. API key "${result.keyName}" saved (it is not shown).`);
  out.log(`  Saved to: ${tildify(credPath)}`);
  if (places.length) out.log(`  SCAVIO_API_KEY added to: ${places.join(", ")}`);
  const check = await checkKey(baseUrl, result.apiKey, UA);
  if (check.ok) {
    out.log(`  Key works${check.plan ? `: ${check.plan} plan` : ""}${typeof check.credits === "number" ? `, ${check.credits} credits` : ""}.`);
  }
  if (places.length) {
    out.log("Open a new terminal, or restart your AI agent, so it picks up SCAVIO_API_KEY.");
  } else {
    out.log("SCAVIO_API_KEY was not exported; read the key from the saved file or set it yourself.");
  }
  return EXIT.ok;
}

async function login(args: string[], out: Out): Promise<number> {
  const dir = configDir();
  const baseUrl = (process.env.SCAVIO_BASE_URL || BASE_URL).replace(/\/+$/, "");
  const budget = Math.max(5, Number(option(args, "--timeout")) || AGENT_WAIT_MS / 1000) * 1000;

  if (flag(args, "--wait")) {
    const p = readPending(dir);
    if (!p) {
      out.err("No login in progress. Run: npx -y scavio@latest login");
      return EXIT.error;
    }
    const r = await waitForApproval({
      baseUrl: p.base_url,
      deviceCode: p.device_code,
      intervalSec: p.interval,
      expiresAt: p.expires_at,
      budgetMs: budget,
      userAgent: UA,
    });
    return finish(r, dir, args, p.base_url, out);
  }

  if (!flag(args, "--force") && process.env.SCAVIO_API_KEY) {
    const check = await checkKey(baseUrl, process.env.SCAVIO_API_KEY, UA);
    if (check.ok) {
      out.log("SCAVIO_API_KEY is already set and works. Nothing to do (use --force to log in again).");
      return EXIT.ok;
    }
  }

  let code;
  try {
    code = await startLogin(baseUrl, { hostname: machineName(), os: process.platform, userAgent: UA });
  } catch (e) {
    out.err((e as Error).message);
    return EXIT.error;
  }
  const expiresAt = Date.now() + code.expires_in * 1000;
  savePending(dir, {
    device_code: code.device_code,
    user_code: code.user_code,
    verification_uri_complete: code.verification_uri_complete,
    interval: code.interval,
    expires_at: expiresAt,
    base_url: baseUrl,
  });

  const minutes = Math.round(code.expires_in / 60);
  out.log("To connect this machine to Scavio, open:");
  out.log("");
  out.log(`  ${code.verification_uri_complete}`);
  out.log("");
  out.log(`and check that the page shows this code: ${code.user_code}`);
  out.log(`Sign in or create a free account there. The link works for ${minutes} minutes.`);
  if (!flag(args, "--no-browser")) openBrowser(code.verification_uri_complete);

  const interactive = Boolean(process.stdout.isTTY && process.stdin.isTTY);
  if (!interactive) {
    out.log("");
    out.log("After approving, run: npx -y scavio@latest login --wait");
    return EXIT.ok;
  }

  out.log("");
  out.log("Waiting for approval...");
  const r = await waitForApproval({
    baseUrl,
    deviceCode: code.device_code,
    intervalSec: code.interval,
    expiresAt,
    budgetMs: code.expires_in * 1000,
    userAgent: UA,
  });
  return finish(r, dir, args, baseUrl, out);
}

async function status(out: Out): Promise<number> {
  const baseUrl = (process.env.SCAVIO_BASE_URL || BASE_URL).replace(/\/+$/, "");
  const saved = readCredentials(configDir());
  const fromEnv = process.env.SCAVIO_API_KEY;
  const key = fromEnv || saved?.api_key;
  if (!key) {
    out.log("Not logged in: SCAVIO_API_KEY is not set and no saved key was found. Run: npx -y scavio@latest login");
    return EXIT.error;
  }
  const source = fromEnv ? "SCAVIO_API_KEY" : `saved key "${saved?.key_name}"`;
  const check = await checkKey(baseUrl, key, UA);
  if (!check.ok) {
    out.log(`The key from ${source} does not work (HTTP ${check.status || "network error"}). Run: npx -y scavio@latest login --force`);
    return EXIT.error;
  }
  out.log(`Logged in via ${source}${check.plan ? `: ${check.plan} plan` : ""}${typeof check.credits === "number" ? `, ${check.credits} credits` : ""}.`);
  if (!fromEnv) out.log("SCAVIO_API_KEY is not set in this shell yet: open a new terminal or restart your agent.");
  return EXIT.ok;
}

function logout(out: Out): number {
  const dir = configDir();
  const hadFile = clearCredentials(dir);
  clearPending(dir);
  const changed = process.platform === "win32" ? (setWindowsUserEnv(null) ? ["Windows user environment"] : []) : removeFromProfiles(profileTargets());
  if (!hadFile && changed.length === 0) {
    out.log("Nothing to remove: no key saved by scavio login on this machine.");
    return EXIT.ok;
  }
  out.log("Removed the saved key from this machine" + (changed.length ? ` and from ${changed.join(", ")}.` : "."));
  out.log(`The key still exists on your account; revoke it at ${KEYS_URL} if you no longer need it.`);
  return EXIT.ok;
}

export async function main(argv: string[] = process.argv.slice(2), out: Out = stdio): Promise<number> {
  const [cmd, ...args] = argv;
  if (cmd === "--version" || cmd === "-v") {
    out.log(SDK_VERSION);
    return EXIT.ok;
  }
  if (cmd === "login") return login(args, out);
  if (cmd === "status" || cmd === "whoami") return status(out);
  if (cmd === "logout") return logout(out);
  out.log(HELP);
  return cmd && cmd !== "help" && cmd !== "--help" && cmd !== "-h" ? EXIT.error : EXIT.ok;
}
