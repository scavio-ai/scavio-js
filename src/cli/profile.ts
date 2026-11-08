// Puts SCAVIO_API_KEY into the user's shell startup file, which is where every
// Scavio agent skill reads it from. Same files the manual setup uses
// (scavio.dev/agent-setup), so logging in never puts the key somewhere the
// manual path would not.
//
// Our line carries a marker and is replaced, never duplicated, on the next
// login. Lines the user wrote themselves are never edited: ours is appended
// after them, and the later definition wins.

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { basename, dirname, join } from "node:path";
import type { Env } from "./files.js";

export const MARKER = "# added by scavio login";

export type ProfileTarget = { kind: "posix" | "fish"; path: string; display: string };

export function profileTargets(env: Env = process.env, platform: string = process.platform, home: string = homedir()): ProfileTarget[] {
  if (platform === "win32") return [];
  const shell = basename(env.SHELL || "");
  const t = (kind: ProfileTarget["kind"], rel: string): ProfileTarget => ({ kind, path: join(home, rel), display: `~/${rel}` });
  if (shell === "fish") return [t("fish", ".config/fish/conf.d/scavio.fish")];
  if (shell === "zsh") return [t("posix", ".zshrc")];
  if (shell === "bash") {
    // macOS terminals start login shells, which read ~/.bash_profile, not ~/.bashrc.
    return platform === "darwin" ? [t("posix", ".bashrc"), t("posix", ".bash_profile")] : [t("posix", ".bashrc")];
  }
  return [t("posix", ".profile")];
}

/** Keys are sk_ + hex; refuse anything else so a quote can never reach a shell file. */
export function assertSafeKey(key: string): void {
  if (!/^sk_[A-Za-z0-9_-]{16,128}$/.test(key)) throw new Error("Unexpected API key format; nothing was written.");
}

export function lineFor(kind: ProfileTarget["kind"], key: string): string {
  return kind === "fish" ? `set -gx SCAVIO_API_KEY "${key}" ${MARKER}` : `export SCAVIO_API_KEY="${key}" ${MARKER}`;
}

/** Content with our line replaced, or appended when absent. */
export function upsertLine(content: string, line: string): string {
  const lines = content.split("\n");
  const kept = lines.filter((l) => !l.includes(MARKER));
  while (kept.length && kept[kept.length - 1] === "") kept.pop();
  return (kept.length ? kept.join("\n") + "\n" : "") + line + "\n";
}

export function removeLine(content: string): string {
  return content
    .split("\n")
    .filter((l) => !l.includes(MARKER))
    .join("\n");
}

export function writeProfiles(key: string, targets: ProfileTarget[]): string[] {
  assertSafeKey(key);
  const written: string[] = [];
  for (const t of targets) {
    mkdirSync(dirname(t.path), { recursive: true });
    const before = existsSync(t.path) ? readFileSync(t.path, "utf8") : "";
    writeFileSync(t.path, upsertLine(before, lineFor(t.kind, key)));
    written.push(t.display);
  }
  return written;
}

export function removeFromProfiles(targets: ProfileTarget[]): string[] {
  const changed: string[] = [];
  for (const t of targets) {
    if (!existsSync(t.path)) continue;
    const before = readFileSync(t.path, "utf8");
    if (!before.includes(MARKER)) continue;
    writeFileSync(t.path, removeLine(before));
    changed.push(t.display);
  }
  return changed;
}

/** Windows: user environment variable, read by every new terminal and app. */
export function setWindowsUserEnv(key: string | null): boolean {
  if (key !== null) assertSafeKey(key);
  const r =
    key === null
      ? spawnSync("reg", ["delete", "HKCU\\Environment", "/v", "SCAVIO_API_KEY", "/f"], { stdio: "ignore" })
      : spawnSync("setx", ["SCAVIO_API_KEY", key], { stdio: "ignore" });
  return r.status === 0;
}
