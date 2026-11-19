import { z } from "zod";

const text = z.string().trim();
const optionalText = z.string().trim().optional().default("");
const url = z.string().trim().url().or(z.literal("")).optional().default("");

const profileSchema = z.object({
  name: text.min(1),
  headline: text.min(1),
  location: optionalText,
  summary: text.min(1),
  email: z.string().trim().email(),
  linkedin_url: url,
  github_url: url,
  website_url: url,
  resume_url: url,
  availability: optionalText
});

const experienceSchema = z.object({
  company: text.min(1),
  role: text.min(1),
  location: optionalText,
  start_date: text.min(1),
  end_date: optionalText,
  summary: text.min(1),
  highlights: z.array(text).default([])
});

const projectSchema = z.object({
  title: text.min(1),
  description: text.min(1),
  technologies: z.array(text).default([]),
  project_url: url,
  source_url: url,
  featured: z.boolean().default(false)
});

const skillSchema = z.object({
  category: text.min(1),
  name: text.min(1),
  level: optionalText
});

const educationSchema = z.object({
  institution: text.min(1),
  degree: text.min(1),
  field: optionalText,
  start_date: optionalText,
  end_date: optionalText,
  details: optionalText
});

const certificationSchema = z.object({
  name: text.min(1),
  issuer: text.min(1),
  issue_date: optionalText,
  credential_url: url
});

export const schemas = {
  profile: z.array(profileSchema).length(1),
  experience: z.array(experienceSchema),
  projects: z.array(projectSchema),
  skills: z.array(skillSchema),
  education: z.array(educationSchema),
  certifications: z.array(certificationSchema)
};

export function splitList(value = "") {
  return String(value)
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function parseBoolean(value = "") {
  const normalized = String(value).trim().toLowerCase();
  if (["true", "yes", "1"].includes(normalized)) return true;
  if (["false", "no", "0", ""].includes(normalized)) return false;
  throw new Error(`Invalid boolean value "${value}". Use TRUE or FALSE.`);
}

export function normalizeRows(rows, kind) {
  switch (kind) {
    case "experience":
      return rows.map((row) => ({ ...row, highlights: splitList(row.highlights) }));
    case "projects":
      return rows.map((row) => ({
        ...row,
        technologies: splitList(row.technologies),
        featured: parseBoolean(row.featured)
      }));
    default:
      return rows;
  }
}
