import { parse } from "csv-parse/sync";

const requiredEnv = [
  "GOOGLE_SHEET_ID",
  "SHEET_GID_PROFILE",
  "SHEET_GID_EXPERIENCE",
  "SHEET_GID_PROJECTS",
  "SHEET_GID_SKILLS",
  "SHEET_GID_EDUCATION",
  "SHEET_GID_CERTIFICATIONS"
];

export function checkEnvironment() {
  const missing = requiredEnv.filter((key) => !process.env[key]?.trim());
  if (missing.length) {
    throw new Error(`Missing environment variables: ${missing.join(", ")}`);
  }
}

export async function fetchSheet(tabName, gid) {
  const url = new URL(
    `https://docs.google.com/spreadsheets/d/${encodeURIComponent(process.env.GOOGLE_SHEET_ID)}/export`
  );
  url.searchParams.set("format", "csv");
  url.searchParams.set("gid", gid);

  const response = await fetch(url, {
    headers: { "user-agent": "portfolio-sheet-sync/1.0" },
    signal: AbortSignal.timeout(30000)
  });

  if (!response.ok) {
    throw new Error(`${tabName}: Google Sheets returned HTTP ${response.status}`);
  }

  const csv = await response.text();
  if (!csv.trim() || /<html[\s>]/i.test(csv.slice(0, 500))) {
    throw new Error(
      `${tabName}: no CSV returned. Check that this tab is published to the web and that its GID is correct.`
    );
  }

  const rows = parse(csv, {
    bom: true,
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: false
  });

  if (!rows.length) throw new Error(`${tabName}: the sheet contains headers but no data rows.`);
  return rows;
}
