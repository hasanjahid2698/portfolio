const $ = (selector) => document.querySelector(selector);

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined && text !== null) node.textContent = text;
  return node;
}

function safeExternalLink(url, label) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (!["http:", "https:", "mailto:"].includes(parsed.protocol)) return null;
    const link = element("a", "", label);
    link.href = parsed.href;
    if (parsed.protocol !== "mailto:") {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    }
    return link;
  } catch {
    return null;
  }
}

function renderProfile(profile) {
  document.title = `${profile.name} | ${profile.headline}`;
  $('meta[name="description"]').content = profile.summary;
  $("#brand-name").textContent = profile.name;
  $("#footer-name").textContent = profile.name;
  $("#hero-name").replaceChildren(document.createTextNode(profile.name), element("span", "accent", "."));
  $("#hero-headline").textContent = profile.headline;
  $("#hero-summary").textContent = profile.summary;
  $("#about-summary").textContent = profile.summary;
  $("#availability").textContent = profile.availability || "OPEN TO OPPORTUNITIES";
  $("#location-line").textContent = profile.location ? `⌖ ${profile.location}` : "";

  const socials = $("#social-links");
  for (const [url, label] of [[profile.linkedin_url, "LinkedIn ↗"], [profile.github_url, "GitHub ↗"], [profile.website_url, "Website ↗"]]) {
    const link = safeExternalLink(url, label);
    if (link) socials.append(link);
  }

  if (profile.resume_url) {
    const resume = safeExternalLink(profile.resume_url, "Download résumé ↓");
    if (resume) {
      resume.id = "resume-link";
      resume.className = "button button-secondary";
      $("#resume-link").replaceWith(resume);
      resume.setAttribute("download", "");
    }
  }

  const contact = $("#contact-link");
  contact.href = `mailto:${profile.email}`;
}

function renderExperience(items) {
  const root = $("#experience-list");
  items.forEach((item) => {
    const card = element("article", "timeline-item");
    const dates = `${item.start_date} — ${item.end_date || "Present"}`;
    card.append(element("div", "item-meta", `${dates}${item.location ? ` · ${item.location}` : ""}`));
    card.append(element("h3", "", `${item.role} · ${item.company}`));
    card.append(element("p", "", item.summary));
    if (item.highlights.length) {
      const list = element("ul");
      item.highlights.forEach((highlight) => list.append(element("li", "", highlight)));
      card.append(list);
    }
    root.append(card);
  });
}

function renderProjects(items) {
  const root = $("#project-list");
  items.forEach((item) => {
    const card = element("article", "project-card");
    card.append(element("div", "project-top", item.featured ? "FEATURED PROJECT" : "PROJECT"));
    card.append(element("h3", "", item.title));
    card.append(element("p", "", item.description));
    const tags = element("div", "tag-list");
    item.technologies.forEach((technology) => tags.append(element("span", "tag", technology)));
    card.append(tags);
    const links = element("div", "project-links");
    const live = safeExternalLink(item.project_url, "View project ↗");
    const source = safeExternalLink(item.source_url, "Source code ↗");
    if (live) links.append(live);
    if (source) links.append(source);
    if (links.childElementCount) card.append(links);
    root.append(card);
  });
}

function renderSkills(items) {
  const grouped = new Map();
  items.forEach((skill) => {
    if (!grouped.has(skill.category)) grouped.set(skill.category, []);
    grouped.get(skill.category).push(skill);
  });
  const root = $("#skill-list");
  for (const [category, skills] of grouped) {
    const group = element("section", "skill-group");
    group.append(element("h3", "", category));
    const tags = element("div", "tag-list");
    skills.forEach((skill) => tags.append(element("span", "tag", skill.name)));
    group.append(tags);
    root.append(group);
  }
}

function renderEducation(items) {
  const root = $("#education-list");
  items.forEach((item) => {
    const block = element("article", "background-item");
    block.append(element("strong", "", item.degree));
    block.append(element("p", "", `${item.institution}${item.field ? ` · ${item.field}` : ""}`));
    const dates = [item.start_date, item.end_date].filter(Boolean).join(" — ");
    if (dates) block.append(element("p", "", dates));
    if (item.details) block.append(element("p", "", item.details));
    root.append(block);
  });
}

function renderCertifications(items) {
  const root = $("#certification-list");
  items.forEach((item) => {
    const block = element("article", "background-item");
    block.append(element("strong", "", item.name));
    block.append(element("p", "", `${item.issuer}${item.issue_date ? ` · ${item.issue_date}` : ""}`));
    const link = safeExternalLink(item.credential_url, "View credential ↗");
    if (link) block.append(link);
    root.append(block);
  });
}

async function loadPortfolio() {
  const sections = ["profile", "experience", "projects", "skills", "education", "certifications"];
  const responses = await Promise.all(sections.map((name) =>
    fetch(`/data/${name}.json`, { cache: "no-cache" }).then((response) => {
      if (!response.ok) throw new Error(`Could not load ${name}.json`);
      return response.json();
    })
  ));
  const [profileRows, experience, projects, skills, education, certifications] = responses;
  if (!Array.isArray(profileRows) || profileRows.length !== 1) {
    throw new Error("profile.json must contain exactly one profile.");
  }

  renderProfile(profileRows[0]);
  renderExperience(experience);
  renderProjects(projects);
  renderSkills(skills);
  renderEducation(education);
  renderCertifications(certifications);
}

$("#year").textContent = new Date().getFullYear();
$("#menu-toggle").addEventListener("click", () => {
  const nav = $("#navigation");
  const open = nav.classList.toggle("open");
  $("#menu-toggle").setAttribute("aria-expanded", String(open));
});
$("#navigation").addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    $("#navigation").classList.remove("open");
    $("#menu-toggle").setAttribute("aria-expanded", "false");
  }
});

loadPortfolio().catch((error) => {
  console.error(error);
  $("#load-error").hidden = false;
});
