# Google Sheets-driven portfolio starter

A zero-recurring-cost, static portfolio starter built with vanilla HTML/CSS/JavaScript. Google Sheets is the content editor; GitHub Actions exports each tab to validated JSON; Cloudflare Pages hosts the static site.

## Architecture

Google Sheets (published CSV tabs) → GitHub Actions (Node.js fetch + Zod validation) → committed `data/*.json` → Cloudflare Pages static hosting.

Visitors never call Google Sheets. The browser only fetches the generated JSON from the same static site.

## 1. Create your Google Sheets workbook

Create one spreadsheet with these six tabs. Keep the first row as the exact headers below. Do not rename headers unless you also update the scripts.

### Profile (exactly one data row)

| Header | Required? | Example |
|---|---|---|
| name | yes | Jahid Hasan |
| headline | yes | Senior Software Engineer |
| location | no | Dhaka, Bangladesh |
| summary | yes | Full-stack engineer building reliable products. |
| email | yes | hello@example.com |
| linkedin_url | no | https://linkedin.com/in/your-handle |
| github_url | no | https://github.com/your-handle |
| website_url | no | https://your-site.example |
| resume_url | no | https://example.com/resume.pdf |
| availability | no | OPEN TO INTERESTING OPPORTUNITIES |

### Experience

`company, role, location, start_date, end_date, summary, highlights`

Use `Present` in `end_date` for a current role. Separate multiple highlights with a vertical bar (`|`).

### Projects

`title, description, technologies, project_url, source_url, featured`

Separate technologies with `|`. Use TRUE or FALSE for `featured`.

### Skills

`category, name, level`

One skill per row. `level` is optional and currently informational; it is not displayed.

### Education

`institution, degree, field, start_date, end_date, details`

### Certifications

`name, issuer, issue_date, credential_url`

For optional values, leave the cell blank. Keep URLs blank if not applicable. Use full `https://` URLs.

### Publish the tabs

In Google Sheets, use **File → Share → Publish to web**. Publish each tab as CSV (or publish the whole document and select each tab separately if the UI offers that choice). The workbook must be publicly readable for the unauthenticated GitHub runner to download it.

Copy the spreadsheet ID from its URL:
`https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`

Copy each tab's `gid` from its URL, for example `.../edit#gid=123456789`.

> Published tabs are public. Do not put private contact details, secrets, private client information or confidential work in this workbook. Consider using a dedicated public portfolio workbook.

## 2. Configure GitHub

1. Create a **public** GitHub repository and upload this project.
2. In the repository, open **Settings → Secrets and variables → Actions → Variables**.
3. Add these repository variables (not secrets, because the published spreadsheet is public):
   - `GOOGLE_SHEET_ID`
   - `SHEET_GID_PROFILE`
   - `SHEET_GID_EXPERIENCE`
   - `SHEET_GID_PROJECTS`
   - `SHEET_GID_SKILLS`
   - `SHEET_GID_EDUCATION`
   - `SHEET_GID_CERTIFICATIONS`
4. In **Settings → Actions → General → Workflow permissions**, allow read and write permissions if your organization/repository requires this setting.
5. In **Actions**, run **Sync portfolio from Google Sheets** manually once.

The workflow runs hourly at minute 17 UTC. GitHub scheduled workflows can be delayed during busy periods, and schedules run from the default branch. The workflow also runs when its scripts/workflow change on `main`.

The workflow only commits when JSON changes. If a fetch or validation fails, it exits before replacing any JSON, preserving the previous valid data.

## 3. Test locally (optional)

Requires Node.js 20 or newer.

```bash
npm install
Copy `.env.example` to `.env` and fill in the spreadsheet ID and tab GIDs.
```

Fill `.env` with your real spreadsheet ID and GIDs, then load the variables into your shell or use a local dotenv tool. The project deliberately does not include dotenv as a dependency. For a quick test on PowerShell:

```powershell
Get-Content .env | ForEach-Object {
  if ($_ -match '^([^#][^=]*)=(.*)$') {
    [System.Environment]::SetEnvironmentVariable($matches[1], $matches[2], 'Process')
  }
}
npm run sync
npm run validate
```

Preview the static site with any local static server, for example:

```bash
npx serve .
```

Then open the local URL printed by the server. Do not open `index.html` directly as a `file://` URL; browsers block fetches of local JSON files in that mode.

## 4. Deploy to Cloudflare Pages

1. Sign in to Cloudflare and open **Workers & Pages → Create → Pages → Connect to Git**.
2. Select your GitHub repository and production branch `main`.
3. Framework preset: **None**.
4. Build command: leave blank.
5. Build output directory: `.` (repository root).
6. Save and deploy.

This is a plain static site; no build step is required. Cloudflare Pages will deploy when GitHub receives the JSON commit from the sync workflow. The initial deployment publishes the starter JSON; run the sync workflow to replace it with your spreadsheet content.

Use the `*.pages.dev` address at no cost. A custom domain is optional and usually requires buying/renewing the domain.

## 5. Updating your portfolio

1. Edit the relevant Google Sheets tab.
2. Wait for the next hourly workflow, or manually run it from GitHub Actions.
3. When validated JSON changes are committed, Cloudflare Pages deploys the update.
4. Check the Actions run and Cloudflare deployment if changes do not appear.

## Data and security notes

- This is a public, read-only content pipeline. Do not put secrets in Sheets or JSON.
- `data/*.json` is public because it is served by the website.
- The generator validates all tabs before writing any output. It uses Zod and fails closed on malformed data.
- The frontend inserts sheet values with `textContent` and DOM APIs rather than interpreting them as HTML.
- Use only links you trust. The frontend permits HTTP(S) links and `mailto:` links.
- The sample content is illustrative; replace all example details and links before launch.
- GitHub Actions and Cloudflare Pages free-plan quotas and terms can change. Check the providers' current plan pages before relying on a particular limit.

## Customization checklist

- [ ] Replace the sample profile, experience, projects, skills, education and certifications.
- [ ] Add your real social links and résumé URL.
- [ ] Publish the Google Sheets tabs.
- [ ] Set the seven GitHub Actions repository variables.
- [ ] Run the workflow and inspect the generated JSON.
- [ ] Connect the repository to Cloudflare Pages.
- [ ] Test the site on mobile and desktop.
- [ ] Add a custom domain only if you want one.
