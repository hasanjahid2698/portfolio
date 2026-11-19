import { readFile } from "node:fs/promises";
import { schemas } from "./schema.js";

async function main() {
  for (const kind of Object.keys(schemas)) {
    const raw = await readFile(`data/${kind}.json`, "utf8");
    const parsed = JSON.parse(raw);
    const result = schemas[kind].safeParse(parsed);
    if (!result.success) {
      console.error(`${kind}.json is invalid:`, result.error.format());
      process.exitCode = 1;
    } else {
      console.log(`✓ data/${kind}.json`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
