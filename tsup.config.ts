import { readFileSync } from "node:fs";
import { defineConfig } from "tsup";

const pkg = JSON.parse(readFileSync("./package.json", "utf8")) as {
  version: string;
};

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  define: {
    __SCAVIO_JS_VERSION__: JSON.stringify(pkg.version),
  },
});
