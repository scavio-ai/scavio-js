// Local state for `scavio login`: the saved key and the in-progress login.
// Both files hold secrets, so they are written owner-only (0600 in a 0700 dir).

import { chmodSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export type Env = Record<string, string | undefined>;

export function configDir(env: Env = process.env, platform: string = process.platform, home: string = homedir()): string {
  if (platform === "win32") return join(env.APPDATA || join(home, "AppData", "Roaming"), "scavio");
  return join(env.XDG_CONFIG_HOME || join(home, ".config"), "scavio");
}

export type Credentials = { api_key: string; key_name: string; saved_at: string };

export type PendingLogin = {
  device_code: string;
  user_code: string;
  verification_uri_complete: string;
  interval: number;
  expires_at: number;
  base_url: string;
};

function writeSecret(path: string, dir: string, data: unknown): void {
  mkdirSync(dir, { recursive: true, mode: 0o700 });
  try {
    // mkdir's mode does not apply to a directory that already exists.
    chmodSync(dir, 0o700);
  } catch {
    // Windows: permissions come from the user profile folder.
  }
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n", { mode: 0o600 });
  try {
    chmodSync(path, 0o600);
  } catch {
    // Windows: permissions come from the user profile folder.
  }
}

function readJson<T>(path: string): T | null {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf8")) as T;
  } catch {
    return null;
  }
}

export const credentialsPath = (dir: string) => join(dir, "credentials.json");
export const pendingPath = (dir: string) => join(dir, "pending-login.json");

export function saveCredentials(dir: string, c: Credentials): string {
  const p = credentialsPath(dir);
  writeSecret(p, dir, c);
  return p;
}

export function readCredentials(dir: string): Credentials | null {
  const c = readJson<Credentials>(credentialsPath(dir));
  return c && typeof c.api_key === "string" ? c : null;
}

export function savePending(dir: string, p: PendingLogin): void {
  writeSecret(pendingPath(dir), dir, p);
}

export function readPending(dir: string): PendingLogin | null {
  const p = readJson<PendingLogin>(pendingPath(dir));
  return p && typeof p.device_code === "string" ? p : null;
}

export function clearPending(dir: string): void {
  rmSync(pendingPath(dir), { force: true });
}

export function clearCredentials(dir: string): boolean {
  const p = credentialsPath(dir);
  const had = existsSync(p);
  rmSync(p, { force: true });
  return had;
}
