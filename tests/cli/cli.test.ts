import { describe, it, expect } from "vitest";
import { mkdtempSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { configDir, readPending, savePending, saveCredentials, readCredentials } from "../../src/cli/files.js";
import {
  MARKER,
  assertSafeKey,
  lineFor,
  profileTargets,
  removeFromProfiles,
  upsertLine,
  writeProfiles,
} from "../../src/cli/profile.js";
import { machineName, waitForApproval } from "../../src/cli/login.js";

const KEY = "sk_" + "a".repeat(64);
const KEY2 = "sk_" + "b".repeat(64);

function tmp(): string {
  return mkdtempSync(join(tmpdir(), "scavio-cli-"));
}

describe("profileTargets", () => {
  it("picks the startup file for the user's shell", () => {
    expect(profileTargets({ SHELL: "/bin/zsh" }, "darwin", "/h").map((t) => t.display)).toEqual(["~/.zshrc"]);
    expect(profileTargets({ SHELL: "/bin/bash" }, "linux", "/h").map((t) => t.display)).toEqual(["~/.bashrc"]);
    expect(profileTargets({ SHELL: "/bin/bash" }, "darwin", "/h").map((t) => t.display)).toEqual([
      "~/.bashrc",
      "~/.bash_profile",
    ]);
    expect(profileTargets({ SHELL: "/usr/bin/fish" }, "linux", "/h")[0]).toMatchObject({
      kind: "fish",
      display: "~/.config/fish/conf.d/scavio.fish",
    });
    expect(profileTargets({}, "linux", "/h").map((t) => t.display)).toEqual(["~/.profile"]);
    expect(profileTargets({ SHELL: "/bin/zsh", ZDOTDIR: "/h/.config/zsh" }, "linux", "/h")[0]).toMatchObject({
      path: "/h/.config/zsh/.zshrc",
      display: "~/.config/zsh/.zshrc",
    });
    expect(profileTargets({ SHELL: "/bin/zsh", ZDOTDIR: "/h" }, "darwin", "/h").map((t) => t.display)).toEqual(["~/.zshrc"]);
    expect(profileTargets({ SHELL: "/bin/zsh" }, "win32", "/h")).toEqual([]);
  });
});

describe("profile lines", () => {
  it("replaces our line instead of adding a second one, and keeps the user's lines", () => {
    const user = 'export PATH="$HOME/bin:$PATH"\nexport SCAVIO_API_KEY="sk_manual"\n';
    const once = upsertLine(user, lineFor("posix", KEY));
    const twice = upsertLine(once, lineFor("posix", KEY2));
    expect(twice.split("\n").filter((l) => l.includes(MARKER))).toEqual([`export SCAVIO_API_KEY="${KEY2}" ${MARKER}`]);
    expect(twice).toContain('export SCAVIO_API_KEY="sk_manual"');
    expect(twice).toContain('export PATH="$HOME/bin:$PATH"');
    // Ours comes last, so it is the one the shell ends up with.
    expect(twice.trimEnd().split("\n").pop()).toContain(KEY2);
  });

  it("fish uses set -gx", () => {
    expect(lineFor("fish", KEY)).toBe(`set -gx SCAVIO_API_KEY "${KEY}" ${MARKER}`);
  });

  it("refuses anything that is not a Scavio key, so nothing odd reaches a shell file", () => {
    expect(() => assertSafeKey('sk_abc"; rm -rf ~; "')).toThrow();
    expect(() => assertSafeKey("not-a-key")).toThrow();
    expect(() => assertSafeKey(KEY)).not.toThrow();
  });

  it("writes and removes the line on disk", () => {
    const home = tmp();
    writeFileSync(join(home, ".zshrc"), "alias ll='ls -l'\n");
    const targets = profileTargets({ SHELL: "/bin/zsh" }, "darwin", home);
    expect(writeProfiles(KEY, targets)).toEqual(["~/.zshrc"]);
    writeProfiles(KEY, targets);
    const content = readFileSync(join(home, ".zshrc"), "utf8");
    expect(content.match(/SCAVIO_API_KEY/g)).toHaveLength(1);
    expect(removeFromProfiles(targets)).toEqual(["~/.zshrc"]);
    expect(readFileSync(join(home, ".zshrc"), "utf8")).not.toContain("SCAVIO_API_KEY");
    expect(readFileSync(join(home, ".zshrc"), "utf8")).toContain("alias ll");
  });
});

describe("files", () => {
  it("honours XDG_CONFIG_HOME and APPDATA", () => {
    expect(configDir({ XDG_CONFIG_HOME: "/x" }, "linux", "/h")).toBe("/x/scavio");
    expect(configDir({}, "darwin", "/h")).toBe("/h/.config/scavio");
    expect(configDir({ APPDATA: "C:\\U\\AppData\\Roaming" }, "win32", "C:\\U")).toContain("scavio");
  });

  it("saves credentials and the pending login owner-only", () => {
    const dir = join(tmp(), "scavio");
    const p = saveCredentials(dir, { api_key: KEY, key_name: "CLI - box", saved_at: "now" });
    expect(readCredentials(dir)?.api_key).toBe(KEY);
    if (process.platform !== "win32") expect(statSync(p).mode & 0o777).toBe(0o600);
    savePending(dir, {
      device_code: "dc_x",
      user_code: "BCDF-GHJK",
      verification_uri_complete: "u",
      interval: 5,
      expires_at: 1,
      base_url: "b",
    });
    expect(readPending(dir)?.user_code).toBe("BCDF-GHJK");
  });
});

describe("machineName", () => {
  it("keeps the first DNS label and caps length", () => {
    expect(machineName("Studio-MacBook-Pro.local")).toBe("Studio-MacBook-Pro");
    expect(machineName("mini-m4.tail763e7b.ts.net")).toBe("mini-m4");
    expect(machineName("x".repeat(80))).toHaveLength(64);
    expect(machineName("")).toBe("unknown");
  });
});

function fakeServer(replies: Array<{ status: number; body: unknown } | "neterr">) {
  const calls: unknown[] = [];
  let i = 0;
  const f = (async (_url: string, init?: RequestInit) => {
    calls.push(JSON.parse(String(init?.body)));
    const r = replies[Math.min(i++, replies.length - 1)];
    if (r === "neterr") throw new TypeError("fetch failed");
    return new Response(JSON.stringify(r.body), { status: r.status });
  }) as unknown as typeof fetch;
  return { f, calls };
}

function clock() {
  let t = 1_000_000;
  return { now: () => t, sleep: async (ms: number) => void (t += ms) };
}

const base = (over: Partial<Parameters<typeof waitForApproval>[0]>) => {
  const c = clock();
  return {
    baseUrl: "https://api.test",
    deviceCode: "dc_abc",
    intervalSec: 5,
    expiresAt: c.now() + 600_000,
    budgetMs: 60_000,
    userAgent: "t",
    now: c.now,
    sleep: c.sleep,
    ...over,
  };
};

describe("waitForApproval", () => {
  it("polls through pending and returns the key on approval", async () => {
    const s = fakeServer([
      { status: 400, body: { error: "authorization_pending" } },
      { status: 400, body: { error: "authorization_pending" } },
      { status: 200, body: { access_token: KEY, token_type: "Bearer", key_name: "CLI - box" } },
    ]);
    const r = await waitForApproval(base({ fetch: s.f }));
    expect(r).toEqual({ kind: "approved", apiKey: KEY, keyName: "CLI - box" });
    expect(s.calls).toHaveLength(3);
    expect(s.calls[0]).toEqual({ device_code: "dc_abc" });
  });

  it("returns pending when its time budget runs out, so an agent can run it again", async () => {
    const s = fakeServer([{ status: 400, body: { error: "authorization_pending" } }]);
    const r = await waitForApproval(base({ fetch: s.f, budgetMs: 20_000 }));
    expect(r).toEqual({ kind: "pending" });
    expect(s.calls.length).toBeLessThanOrEqual(4);
  });

  it("maps denied, expired and used codes", async () => {
    expect(await waitForApproval(base({ fetch: fakeServer([{ status: 400, body: { error: "access_denied" } }]).f }))).toEqual({
      kind: "denied",
    });
    expect(await waitForApproval(base({ fetch: fakeServer([{ status: 400, body: { error: "expired_token" } }]).f }))).toEqual({
      kind: "expired",
    });
    const used = await waitForApproval(base({ fetch: fakeServer([{ status: 400, body: { error: "invalid_grant" } }]).f }));
    expect(used.kind).toBe("error");
  });

  it("backs off on slow_down and retries network errors", async () => {
    const s = fakeServer([
      "neterr",
      { status: 400, body: { error: "slow_down" } },
      { status: 200, body: { access_token: KEY, key_name: "CLI - box" } },
    ]);
    const r = await waitForApproval(base({ fetch: s.f }));
    expect(r.kind).toBe("approved");
  });

  it("reports expired once the code's own life is over, even inside the budget", async () => {
    const c = clock();
    const s = fakeServer([{ status: 400, body: { error: "authorization_pending" } }]);
    const r = await waitForApproval({ ...base({ fetch: s.f }), now: c.now, sleep: c.sleep, expiresAt: c.now() + 12_000 });
    expect(r).toEqual({ kind: "expired" });
  });
});
