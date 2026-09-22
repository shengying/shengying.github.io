const year = document.querySelector("#year");
const nav = document.querySelector(".nav");
const navIndicator = document.querySelector(".nav-indicator");
const navLinks = Array.from(document.querySelectorAll(".nav-link"));

if (year) {
  year.textContent = new Date().getFullYear();
}

function moveNavIndicator(activeLink) {
  if (!nav || !navIndicator || !activeLink) {
    return;
  }

  const navRect = nav.getBoundingClientRect();
  const linkRect = activeLink.getBoundingClientRect();

  navIndicator.style.transform = `translateX(${linkRect.left - navRect.left}px)`;
  navIndicator.style.width = `${linkRect.width}px`;
}

function setActiveNavLink() {
  const currentHash = window.location.hash || "#work";
  const activeLink =
    navLinks.find((link) => link.getAttribute("href") === currentHash) ??
    navLinks[0];

  navLinks.forEach((link) => {
    link.classList.toggle("active", link === activeLink);
  });

  moveNavIndicator(activeLink);
  requestAnimationFrame(() => {
    moveNavIndicator(activeLink);
  });
}

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.forEach((item) => {
      item.classList.toggle("active", item === link);
    });

    moveNavIndicator(link);
    requestAnimationFrame(() => {
      moveNavIndicator(link);
    });
  });
});

window.addEventListener("hashchange", setActiveNavLink);
window.addEventListener("resize", setActiveNavLink);
setActiveNavLink();

if (document.fonts) {
  document.fonts.ready.then(setActiveNavLink);
}
