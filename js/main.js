const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const header = document.querySelector(".site-header");
const toggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav");
const progress = document.querySelector(".scroll-progress");
const toTop = document.querySelector(".to-top");
const navLinks = [...document.querySelectorAll(".nav a[href^='#']")];
const dropBtn = document.querySelector(".nav-drop-btn");
const drop = document.querySelector(".nav-drop");

/* ---------- Mobile menu ---------- */

const closeMenu = () => {
  nav?.classList.remove("is-open");
  toggle?.setAttribute("aria-expanded", "false");
};

toggle?.addEventListener("click", () => {
  const open = nav.classList.toggle("is-open");
  toggle.setAttribute("aria-expanded", String(open));
});

nav?.querySelectorAll("a").forEach((link) =>
  link.addEventListener("click", () => {
    closeMenu();
    drop?.classList.remove("is-open");
    dropBtn?.setAttribute("aria-expanded", "false");
  })
);

dropBtn?.addEventListener("click", (event) => {
  event.stopPropagation();
  const open = drop.classList.toggle("is-open");
  dropBtn.setAttribute("aria-expanded", String(open));
});

document.addEventListener("click", () => {
  drop?.classList.remove("is-open");
  dropBtn?.setAttribute("aria-expanded", "false");
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});

/* ---------- Scroll driven header, progress, parallax ---------- */

let ticking = false;

const onScroll = () => {
  const y = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;

  header?.classList.toggle("is-stuck", y > 40 || document.body.classList.contains("page-inner"));
  toTop?.classList.toggle("is-visible", y > window.innerHeight * 0.7);

  if (progress) {
    progress.style.setProperty("--progress", max > 0 ? String(Math.min(y / max, 1)) : "0");
  }

  ticking = false;
};

const requestScroll = () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(onScroll);
};

window.addEventListener("scroll", requestScroll, { passive: true });
window.addEventListener("resize", requestScroll);
onScroll();

/* ---------- Reveal on scroll ---------- */

const revealTargets = document.querySelectorAll("[data-reveal]");

if (reduceMotion || !("IntersectionObserver" in window)) {
  revealTargets.forEach((el) => el.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.15 }
  );

  revealTargets.forEach((el) => revealObserver.observe(el));
}

/* ---------- Counters ---------- */

const counters = document.querySelectorAll("[data-count]");

const runCounter = (el) => {
  const target = Number(el.dataset.count);
  if (reduceMotion || Number.isNaN(target)) {
    el.textContent = String(target || 0);
    return;
  }

  const duration = 1100;
  const start = performance.now();

  const step = (now) => {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = String(Math.round(target * eased));
    if (t < 1) requestAnimationFrame(step);
  };

  requestAnimationFrame(step);
};

if ("IntersectionObserver" in window) {
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        runCounter(entry.target);
        counterObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.6 }
  );

  counters.forEach((el) => counterObserver.observe(el));
} else {
  counters.forEach(runCounter);
}

/* ---------- Active section in nav ---------- */

const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

if ("IntersectionObserver" in window && sections.length) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) =>
          link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`)
        );
        const aboutIds = ["hakkimizda", "sertifikalar", "ekip"];
        dropBtn?.classList.toggle("is-active", aboutIds.includes(entry.target.id));
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );

  sections.forEach((section) => sectionObserver.observe(section));
}

/* ---------- Back to top ---------- */

toTop?.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
});

/* ---------- Theme ---------- */

const themeBtn = document.querySelector(".theme-toggle");

const applyTheme = (night) => {
  document.documentElement.dataset.theme = night ? "night" : "";
  if (!night) document.documentElement.removeAttribute("data-theme");
  themeBtn?.setAttribute("aria-pressed", String(night));
  try {
    localStorage.setItem("magnum-theme", night ? "night" : "day");
  } catch (err) {}
};

applyTheme(
  (() => {
    try {
      return localStorage.getItem("magnum-theme") === "night";
    } catch (err) {
      return false;
    }
  })()
);

themeBtn?.addEventListener("click", () => {
  applyTheme(document.documentElement.dataset.theme !== "night");
});

const form = document.querySelector(".form");

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const name = String(data.get("name") || "").trim();
  const phone = String(data.get("phone") || "").trim();
  const message = String(data.get("message") || "").trim();
  const body = encodeURIComponent(`Ad: ${name}\nTelefon: ${phone}\n\n${message}`);
  window.location.href = `mailto:magnum.egemen@gmail.com?subject=${encodeURIComponent(
    "Teklif talebi"
  )}&body=${body}`;
});
