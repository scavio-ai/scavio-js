import { readFileSync } from "node:fs";
import { defineConfig } from "vitest/config";

const pkg = JSON.parse(readFileSync("./package.json", "utf8")) as {
  version: string;
};

export default defineConfig({
  define: {
    __SCAVIO_JS_VERSION__: JSON.stringify(pkg.version),
  },
  test: {
    globals: true,
  },
});
