const allProjects = [
  ...(window.PORTFOLIO_DATA?.vibeCoding || []),
  ...(window.PORTFOLIO_DATA?.projects || []),
];
const slug = new URLSearchParams(window.location.search).get("slug");
const project = allProjects.find((item) => item.slug === slug) || allProjects[0];

function visualMarkup(type) {
  const visuals = {
    habit: '<div class="card-visual visual-habit"><span class="phone"></span></div>',
    tape: '<div class="card-visual visual-tape"><span class="tape-roll"></span><span class="tape-roll"></span></div>',
    card: '<div class="card-visual visual-card"><span class="postcard"></span></div>',
  };
  return visuals[type] || '<div class="card-visual"></div>';
}

if (project) {
  document.querySelector(".detail-back").href = (window.PORTFOLIO_DATA?.projects || []).includes(project)
    ? "index.html#projects"
    : "index.html#vibe-coding";
  document.title = `${project.title} — Ying`;
  document.querySelector('meta[name="description"]').content = project.summary;
  document.querySelector("#detail-eyebrow").textContent = `${project.type} / ${project.status}`;
  document.querySelector("#detail-title").textContent = project.title;
  document.querySelector("#detail-summary").textContent = project.summary;
  document.querySelector("#detail-visual").innerHTML = project.image
    ? `<img class="detail-project-image" src="${project.image}" alt="${project.title} project preview" />`
    : visualMarkup(project.visual);
  document.querySelector("#detail-known").textContent = project.known;
  document.querySelector("#detail-notice").textContent = `Current status: ${project.status}. This page is a transparent V1 placeholder, not a finished case study.`;
  document.querySelector("#detail-facts").innerHTML = `
    <div><dt>Status</dt><dd>${project.status}</dd></div>
    <div><dt>Practice</dt><dd>${project.type}</dd></div>
    <div><dt>Role</dt><dd>${project.role}</dd></div>
    <div><dt>AI contribution</dt><dd>${project.ai}</dd></div>
  `;
}

document.querySelector("#year").textContent = new Date().getFullYear();
