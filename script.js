const data = window.PORTFOLIO_DATA;
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function visualMarkup(type) {
  const visuals = {
    habit: '<div class="card-visual visual-habit"><span class="phone"></span></div>',
    tape: '<div class="card-visual visual-tape"><span class="tape-roll"></span><span class="tape-roll"></span></div>',
    card: '<div class="card-visual visual-card"><span class="postcard"></span></div>',
  };
  return visuals[type] || '<div class="card-visual"></div>';
}

function renderVibeCards() {
  const container = document.querySelector("#vibe-grid");
  if (!container || !data) return;

  container.innerHTML = data.vibeCoding
    .map(
      (item, index) => `
        <a class="vibe-card reveal" href="project.html?slug=${encodeURIComponent(item.slug)}" aria-label="View ${item.title}, ${item.status}">
          ${visualMarkup(item.visual)}
          <div class="card-meta">
            <span class="card-number">0${index + 1}</span>
            <h3>${item.title}</h3>
            <span class="card-status">${item.status}</span>
          </div>
        </a>`,
    )
    .join("");
}

function renderProjectRows() {
  const container = document.querySelector("#project-list");
  if (!container || !data) return;

  container.innerHTML = data.projects
    .map(
      (item) => `
        <a class="project-card reveal" href="project.html?slug=${encodeURIComponent(item.slug)}" aria-label="View ${item.title}">
          <img class="project-card-image" src="${item.image}" alt="${item.title} project preview" loading="lazy" />
          <div class="project-card-meta">
            <h2>${item.title}</h2>
            <span class="project-card-tag">${item.type}</span>
          </div>
        </a>`,
    )
    .join("");
}

function initMenu() {
  const button = document.querySelector(".menu-button");
  const nav = document.querySelector(".site-nav");
  if (!button || !nav) return;

  const close = () => {
    button.setAttribute("aria-expanded", "false");
    nav.classList.remove("is-open");
  };

  button.addEventListener("click", () => {
    const isOpen = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!isOpen));
    nav.classList.toggle("is-open", !isOpen);
  });
  nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", close));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
  });
}

function initReveal() {
  const items = document.querySelectorAll(".reveal");
  if (reducedMotion.matches || !("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 },
  );
  items.forEach((item) => observer.observe(item));
}

function initScrollEffects() {
  const header = document.querySelector("[data-header]");
  const characterSection = document.querySelector("#characters");
  const characterTrack = document.querySelector("[data-character-track]");
  let ticking = false;

  const update = () => {
    const y = window.scrollY;
    header?.classList.toggle("is-scrolled", y > 24);

    if (!reducedMotion.matches && window.innerWidth > 820) {
      if (characterSection && characterTrack) {
        const rect = characterSection.getBoundingClientRect();
        const available = Math.max(0, characterTrack.scrollWidth - window.innerWidth + 80);
        const progress = Math.max(0, Math.min(1, (window.innerHeight - rect.top) / (window.innerHeight + rect.height)));
        characterTrack.style.setProperty("--character-shift", `${-available * progress}px`);
      }
    } else if (characterTrack) {
      characterTrack.style.removeProperty("--character-shift");
    }
    ticking = false;
  };

  const requestUpdate = () => {
    if (!ticking) requestAnimationFrame(update);
    ticking = true;
  };
  update();
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
}

function initAuroraCanvas() {
  const hero = document.querySelector(".hero");
  const canvas = document.querySelector("[data-aurora-canvas]");
  const context = canvas?.getContext("2d", { alpha: true });
  if (!hero || !canvas || !context) return;

  const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
  let width = 0;
  let height = 0;
  let animationFrame = 0;
  let lastFrame = 0;
  let visible = true;

  const resize = () => {
    const rect = hero.getBoundingClientRect();
    const renderScale = Math.min(window.devicePixelRatio || 1, 1.35) * 0.72;
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    canvas.width = Math.round(width * renderScale);
    canvas.height = Math.round(height * renderScale);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(renderScale, 0, 0, renderScale, 0, 0);
  };

  // One Figma blue is used for every layer. Normal compositing keeps
  // overlapping light from washing into the white/cyan seen previously.
  const lightColor = "56, 84, 239";

  const drawBeam = (
    { sourceX, landingX, sourceWidth, landingWidth, landingY, alpha, blur, phase, speed },
    time,
  ) => {
    const sourceY = -height * 0.12;
    const sourceDrift = Math.sin(time * speed + phase) * width * 0.009;
    const landingDrift = Math.sin(time * speed * 0.73 + phase * 1.41) * width * 0.018;
    const topX = sourceX + sourceDrift + pointer.x;
    const bottomX = landingX + landingDrift + pointer.x * 0.55;
    const bottomY = landingY + pointer.y;
    const gradient = context.createLinearGradient(topX, sourceY, bottomX, bottomY);
    gradient.addColorStop(0, `rgba(${lightColor}, ${alpha * 0.3})`);
    gradient.addColorStop(0.12, `rgba(${lightColor}, ${alpha})`);
    gradient.addColorStop(0.42, `rgba(${lightColor}, ${alpha * 0.72})`);
    gradient.addColorStop(0.76, `rgba(${lightColor}, ${alpha * 0.24})`);
    gradient.addColorStop(1, `rgba(${lightColor}, 0)`);

    context.save();
    context.filter = `blur(${blur}px)`;
    context.fillStyle = gradient;
    context.beginPath();
    context.moveTo(topX - sourceWidth, sourceY);
    context.bezierCurveTo(
      topX - sourceWidth * 1.4,
      height * 0.12,
      bottomX - landingWidth * 0.72,
      bottomY * 0.54,
      bottomX - landingWidth,
      bottomY,
    );
    context.lineTo(bottomX + landingWidth, bottomY);
    context.bezierCurveTo(
      bottomX + landingWidth * 0.72,
      bottomY * 0.54,
      topX + sourceWidth * 1.4,
      height * 0.12,
      topX + sourceWidth,
      sourceY,
    );
    context.closePath();
    context.fill();
    context.restore();
  };

  const draw = (timestamp = 0) => {
    const time = timestamp / 1000;
    context.clearRect(0, 0, width, height);
    context.globalCompositeOperation = "source-over";
    context.save();
    context.translate(width * 0.14, -height * 0.12);

    const wash = context.createRadialGradient(
      width * 0.82 + pointer.x,
      -height * 0.08 + pointer.y,
      0,
      width * 0.82 + pointer.x,
      -height * 0.08 + pointer.y,
      width * 0.42,
    );
    wash.addColorStop(0, `rgba(${lightColor}, 0.18)`);
    wash.addColorStop(0.3, `rgba(${lightColor}, 0.09)`);
    wash.addColorStop(0.72, `rgba(${lightColor}, 0.018)`);
    wash.addColorStop(1, `rgba(${lightColor}, 0)`);
    context.fillStyle = wash;
    context.fillRect(0, 0, width, height);

    pointer.x += (pointer.targetX - pointer.x) * 0.035;
    pointer.y += (pointer.targetY - pointer.y) * 0.035;
    context.globalCompositeOperation = "source-over";

    // A wide low-contrast cone establishes the direction of the spill.
    drawBeam({ sourceX: width * 0.84, landingX: width * 0.58, sourceWidth: width * 0.09, landingWidth: width * 0.25, landingY: height * 0.7, alpha: 0.085, blur: 34, phase: 0.2, speed: 0.72 }, time);
    // Narrower rays make the light read as falling through space rather than
    // as a flat translucent curtain.
    drawBeam({ sourceX: width * 0.82, landingX: width * 0.59, sourceWidth: width * 0.022, landingWidth: width * 0.105, landingY: height * 0.66, alpha: 0.19, blur: 13, phase: 1.1, speed: 1.05 }, time);
    drawBeam({ sourceX: width * 0.76, landingX: width * 0.49, sourceWidth: width * 0.012, landingWidth: width * 0.055, landingY: height * 0.62, alpha: 0.15, blur: 8, phase: 3.4, speed: -0.94 }, time);
    drawBeam({ sourceX: width * 0.88, landingX: width * 0.7, sourceWidth: width * 0.01, landingWidth: width * 0.048, landingY: height * 0.59, alpha: 0.14, blur: 7, phase: 5.2, speed: 1.18 }, time);
    drawBeam({ sourceX: width * 0.8, landingX: width * 0.61, sourceWidth: width * 0.005, landingWidth: width * 0.025, landingY: height * 0.55, alpha: 0.18, blur: 4, phase: 2.5, speed: -1.24 }, time);
    context.restore();

    const falloff = context.createLinearGradient(0, 0, 0, height * 0.78);
    falloff.addColorStop(0, "rgba(0, 0, 0, 1)");
    falloff.addColorStop(0.46, "rgba(0, 0, 0, 0.76)");
    falloff.addColorStop(0.78, "rgba(0, 0, 0, 0.2)");
    falloff.addColorStop(1, "rgba(0, 0, 0, 0)");
    context.globalCompositeOperation = "destination-in";
    context.fillStyle = falloff;
    context.fillRect(0, 0, width, height);

    context.globalCompositeOperation = "source-over";
    if (!reducedMotion.matches && visible) animationFrame = requestAnimationFrame(frame);
  };

  const frame = (timestamp) => {
    if (timestamp - lastFrame < 1000 / 30) {
      animationFrame = requestAnimationFrame(frame);
      return;
    }
    lastFrame = timestamp;
    draw(timestamp);
  };

  const restart = () => {
    cancelAnimationFrame(animationFrame);
    if (!reducedMotion.matches && visible) animationFrame = requestAnimationFrame(frame);
  };

  if (window.matchMedia("(pointer: fine)").matches && !reducedMotion.matches) {
    hero.addEventListener("pointermove", (event) => {
      const rect = hero.getBoundingClientRect();
      pointer.targetX = ((event.clientX - rect.left) / rect.width - 0.5) * 18;
      pointer.targetY = ((event.clientY - rect.top) / rect.height - 0.5) * 12;
    });
    hero.addEventListener("pointerleave", () => {
      pointer.targetX = 0;
      pointer.targetY = 0;
    });
  }

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      restart();
    }, { threshold: 0.02 });
    observer.observe(hero);
  }

  resize();
  draw(0);
  restart();
  window.addEventListener("resize", () => {
    resize();
    draw(performance.now());
  });
}

function initSectionNav() {
  const nav = document.querySelector(".site-nav");
  const indicator = document.querySelector(".nav-indicator");
  const links = [...document.querySelectorAll('.site-nav a[href^="#"]')];
  const sections = links.map((link) => document.querySelector(link.hash)).filter(Boolean);
  const orderedSections = [...sections].sort((a, b) => a.offsetTop - b.offsetTop);
  let activeLink = links.find((link) => link.classList.contains("active")) || links[0];
  let navigationLockUntil = 0;
  let navigationUnlockTimer = 0;
  let scrollTicking = false;
  let indicatorAnimation = null;

  if (!nav || !indicator || !links.length) return;

  const moveIndicator = (nextLink, withMomentum = false) => {
    if (window.innerWidth <= 820) return;
    const navRect = nav.getBoundingClientRect();
    const linkRect = nextLink.getBoundingClientRect();
    const currentRect = indicator.getBoundingClientRect();
    const currentX = currentRect.left - navRect.left;
    const currentWidth = currentRect.width;
    const targetX = linkRect.left - navRect.left;
    const targetWidth = linkRect.width;

    if (indicatorAnimation) {
      indicatorAnimation.cancel();
      indicatorAnimation = null;
    }

    indicator.style.transform = `translateX(${targetX}px)`;
    indicator.style.width = `${targetWidth}px`;

    if (!withMomentum || reducedMotion.matches || currentWidth < 1) return;

    const direction = Math.sign(targetX - currentX) || 1;
    const distance = Math.abs(targetX - currentX);
    const overshoot = Math.min(9, Math.max(5, distance * 0.045));
    const overshootX = targetX + direction * overshoot;

    indicator.classList.add("is-animating");
    indicatorAnimation = indicator.animate(
      [
        {
          transform: `translateX(${currentX}px)`,
          offset: 0,
          easing: "cubic-bezier(0.12, 0.78, 0.18, 1)",
        },
        {
          transform: `translateX(${overshootX}px)`,
          offset: 0.62,
          easing: "cubic-bezier(0.22, 0.72, 0.3, 1)",
        },
        {
          transform: `translateX(${targetX}px)`,
          offset: 1,
        },
      ],
      { duration: 620, fill: "none" },
    );

    const runningAnimation = indicatorAnimation;
    runningAnimation.finished
      .catch(() => {})
      .finally(() => {
        if (indicatorAnimation !== runningAnimation) return;
        runningAnimation.cancel();
        indicatorAnimation = null;
        indicator.classList.remove("is-animating");
        requestAnimationFrame(() => moveIndicator(activeLink));
      });
  };

  const setActive = (nextLink, withMomentum = false) => {
    if (!nextLink) return;
    if (!withMomentum && nextLink === activeLink && indicatorAnimation) return;
    activeLink = nextLink;
    links.forEach((link) => link.classList.toggle("active", link === nextLink));
    moveIndicator(nextLink, withMomentum);
    if (!withMomentum) requestAnimationFrame(() => moveIndicator(nextLink));
  };

  const setFromHash = () => {
    const matchingLink = links.find((link) => link.hash === window.location.hash);
    setActive(matchingLink || links[0]);
  };

  const syncActiveFromScroll = () => {
    scrollTicking = false;
    if (performance.now() < navigationLockUntil) return;

    const anchor = window.innerHeight * 0.42;
    const currentSection = orderedSections.find((section) => {
      const rect = section.getBoundingClientRect();
      return rect.top <= anchor && rect.bottom > anchor;
    });

    if (currentSection) {
      setActive(links.find((link) => link.hash === `#${currentSection.id}`));
      return;
    }

    const firstSection = orderedSections[0];
    const lastSection = orderedSections[orderedSections.length - 1];
    if (firstSection?.getBoundingClientRect().top > anchor) setActive(links[0]);
    else if (lastSection?.getBoundingClientRect().bottom <= anchor) {
      setActive(links.find((link) => link.hash === `#${lastSection.id}`));
    }
  };

  const requestScrollSync = () => {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(syncActiveFromScroll);
  };

  const releaseNavigationLock = () => {
    navigationLockUntil = 0;
    window.clearTimeout(navigationUnlockTimer);
    requestScrollSync();
  };

  links.forEach((link) => {
    link.addEventListener("click", () => {
      navigationLockUntil = performance.now() + 1200;
      window.clearTimeout(navigationUnlockTimer);
      navigationUnlockTimer = window.setTimeout(releaseNavigationLock, 1220);
      setActive(link, true);
    });

  });
  window.addEventListener("hashchange", setFromHash);
  window.addEventListener("scroll", requestScrollSync, { passive: true });
  window.addEventListener("wheel", releaseNavigationLock, { passive: true });
  window.addEventListener("touchstart", releaseNavigationLock, { passive: true });
  window.addEventListener("resize", requestScrollSync);
  if ("onscrollend" in window) window.addEventListener("scrollend", releaseNavigationLock);
  if (document.fonts) document.fonts.ready.then(requestScrollSync);
  setFromHash();
  requestAnimationFrame(syncActiveFromScroll);
}

renderVibeCards();
renderProjectRows();
document.querySelector("#year").textContent = new Date().getFullYear();
initMenu();
initReveal();
initScrollEffects();
initAuroraCanvas();
initSectionNav();
