import { readFileSync } from "node:fs";
import { defineConfig } from "tsup";

const pkg = JSON.parse(readFileSync("./package.json", "utf8")) as {
  version: string;
};

const define = { __SCAVIO_JS_VERSION__: JSON.stringify(pkg.version) };

export default defineConfig([
  {
    entry: ["src/index.ts"],
    format: ["cjs", "esm"],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: false,
    define,
  },
  {
    // `npx scavio login`: ESM-only executable, no types, never imported.
    entry: { cli: "src/cli/bin.ts" },
    format: ["esm"],
    dts: false,
    splitting: false,
    sourcemap: false,
    clean: false,
    platform: "node",
    target: "node18",
    banner: { js: "#!/usr/bin/env node" },
    define,
  },
]);
