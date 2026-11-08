import { mkdir, writeFile } from "node:fs/promises";
import { checkEnvironment, fetchSheet } from "./sheets.js";
import { normalizeRows, schemas } from "./schema.js";

const tabs = {
  profile: "SHEET_GID_PROFILE",
  experience: "SHEET_GID_EXPERIENCE",
  projects: "SHEET_GID_PROJECTS",
  skills: "SHEET_GID_SKILLS",
  education: "SHEET_GID_EDUCATION",
  certifications: "SHEET_GID_CERTIFICATIONS"
};

function validate(kind, rows) {
  const normalized = normalizeRows(rows, kind);
  const result = schemas[kind].safeParse(normalized);
  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${kind}[${issue.path.join(".")}]: ${issue.message}`)
      .join("\n");
    throw new Error(`Validation failed:\n${details}`);
  }
  return result.data;
}

async function main() {
  checkEnvironment();

  // Fetch and validate every tab before writing anything. A bad tab never
  // replaces the last known-good JSON files.
  const output = {};
  for (const [kind, envName] of Object.entries(tabs)) {
    const gid = process.env[envName];
    const rows = await fetchSheet(kind, gid);
    output[kind] = validate(kind, rows);
    console.log(`✓ ${kind}: ${output[kind].length} record(s) validated`);
  }

  await mkdir("data", { recursive: true });
  for (const [kind, records] of Object.entries(output)) {
    await writeFile(`data/${kind}.json`, `${JSON.stringify(records, null, 2)}\n`, "utf8");
  }
  await writeFile(
    "data/metadata.json",
    `${JSON.stringify({ generated_at: new Date().toISOString() }, null, 2)}\n`,
    "utf8"
  );
  console.log("Portfolio JSON generated successfully.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
