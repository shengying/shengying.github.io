const professionalProjects = window.PORTFOLIO_DATA?.projects || [];
const slug = new URLSearchParams(window.location.search).get("slug");
const project = professionalProjects.find((item) => item.slug === slug);
if (!project) window.location.replace("index.html#top");
const caseStudies = {
  hmi: { height: 15199, parts: 10 },
  goods: { height: 17317, parts: 11 },
  mloan: { height: 29381, parts: 19, width: 1920, folder: "mloan-20260928" },
  "cubicost-ptj": { height: 16637, parts: 11 },
};

if (project) {
  document.title = `${project.title} — Shiny`;
  document.querySelector('meta[name="description"]').content = project.summary;
  const study = caseStudies[project.slug];

  if (study) {
    document.querySelector("#case-study").hidden = false;
    document.querySelector("#case-study-title").textContent = project.title;
    const currentIndex = professionalProjects.indexOf(project);

    const imageContainer = document.querySelector("#case-study-images");
    for (let index = 0; index < study.parts; index += 1) {
      const image = document.createElement("img");
      const imageVersion = project.slug === "hmi" ? "?v=20260928-hmi-2"
        : project.slug === "mloan" ? "?v=20260928-centered" : "";
      image.src = `assets/case-studies/${study.folder || project.slug}/${String(index + 1).padStart(2, "0")}.png${imageVersion}`;
      image.alt = `${project.title} project presentation, part ${index + 1} of ${study.parts}`;
      image.width = study.width || 1920;
      image.height = Math.min(1600, study.height - index * 1600);
      image.loading = index === 0 ? "eager" : "lazy";
      image.decoding = "async";
      if (index === 0) image.fetchPriority = "high";
      imageContainer.append(image);
    }

    const previous = professionalProjects[(currentIndex - 1 + professionalProjects.length) % professionalProjects.length];
    const next = professionalProjects[(currentIndex + 1) % professionalProjects.length];
    const previousLink = document.querySelector("#case-study-previous");
    const nextLink = document.querySelector("#case-study-next");
    previousLink.href = `project.html?slug=${previous.slug}`;
    previousLink.textContent = `← ${previous.title}`;
    nextLink.href = `project.html?slug=${next.slug}`;
    nextLink.textContent = `${next.title} →`;
  }
}

document.querySelector("#year").textContent = new Date().getFullYear();
