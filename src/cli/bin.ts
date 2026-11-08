import { main } from "./index.js";

main().then(
  (code) => process.exit(code),
  (err) => {
    process.stderr.write(`scavio: ${(err as Error)?.message ?? String(err)}\n`);
    process.exit(1);
  }
);
