const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(pointer: fine)").matches;

const header = document.querySelector(".hdr");
const burger = document.querySelector(".burger");
const nav = document.querySelector(".nav");
const progress = document.querySelector(".progress");
const toTop = document.querySelector(".to-top");
const dropBtn = document.querySelector(".nav-drop-btn");
const drop = document.querySelector(".nav-drop");
const navLinks = [...document.querySelectorAll(".nav a[href^='#']")];

/* ---------- Mobil menü ---------- */

const closeMenu = () => {
  nav?.classList.remove("is-open");
  burger?.setAttribute("aria-expanded", "false");
};

burger?.addEventListener("click", () => {
  const open = nav.classList.toggle("is-open");
  burger.setAttribute("aria-expanded", String(open));
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

/* ---------- Tehlike şeridi içeriği ---------- */

const tape = document.querySelector("[data-tape]");

if (tape) {
  const words = [
    "Endüstriyel dağcılık",
    "İple erişim",
    "Cephe temizliği",
    "Rüzgar türbini",
    "Yaşam hattı",
    "Sahne rigging",
    "Kaya bariyeri",
    "Arama kurtarma",
    "Restorasyon",
    "Yüksekte çalışma eğitimi",
  ];
  const run = [...words, ...words];
  tape.replaceChildren(
    ...run.map((word) => {
      const span = document.createElement("span");
      span.textContent = word;
      return span;
    })
  );
}

/* ---------- Kaydırmaya bağlı: başlık, ilerleme, parallax, iniş rayı ---------- */

const heroMedia = document.querySelector(".hero-media img");
const depthOut = document.querySelector("[data-depth]");
const railList = document.querySelector("[data-rail]");

const railSections = [
  ["nedir", "Nedir"],
  ["hizmetler", "Hizmetler"],
  ["surec", "Süreç"],
  ["isler", "İşler"],
  ["referanslar", "Referanslar"],
  ["hakkimizda", "Hakkımızda"],
  ["sss", "SSS"],
  ["iletisim", "İletişim"],
].filter(([id]) => document.getElementById(id));

if (railList) {
  railList.replaceChildren(
    ...railSections.map(([id, label]) => {
      const li = document.createElement("li");
      li.dataset.for = id;
      li.title = label;
      return li;
    })
  );
}

const railMarks = railList ? [...railList.children] : [];

let ticking = false;

const onScroll = () => {
  const y = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = max > 0 ? Math.min(y / max, 1) : 0;

  header?.classList.toggle("is-stuck", y > 30 || document.body.classList.contains("page-inner"));
  toTop?.classList.toggle("is-visible", y > window.innerHeight * 0.7);
  progress?.style.setProperty("--progress", String(ratio));

  if (depthOut) depthOut.textContent = String(Math.round(ratio * 100));

  if (!reduceMotion && heroMedia && y <= window.innerHeight * 1.2) {
    heroMedia.style.transform = `translate3d(0, ${(y * 0.22).toFixed(1)}px, 0) scale(1.08)`;
  }

  if (railMarks.length) {
    const mid = y + window.innerHeight * 0.42;
    let activeIndex = -1;
    railSections.forEach(([id], i) => {
      const el = document.getElementById(id);
      if (el && el.offsetTop <= mid) activeIndex = i;
    });
    railMarks.forEach((mark, i) => mark.classList.toggle("is-on", i === activeIndex));
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

/* ---------- Kaydırdıkça ortaya çıkma ---------- */

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
    { rootMargin: "0px 0px -10% 0px", threshold: 0.12 }
  );

  revealTargets.forEach((el) => revealObserver.observe(el));
}

/* ---------- Sayaçlar ---------- */

const counters = document.querySelectorAll("[data-count]");

const runCounter = (el) => {
  const target = Number(el.dataset.count);
  if (reduceMotion || Number.isNaN(target)) {
    el.textContent = String(target || 0);
    return;
  }

  const duration = 1300;
  const start = performance.now();

  const tick = (now) => {
    const t = Math.min((now - start) / duration, 1);
    el.textContent = String(Math.round(target * (1 - Math.pow(1 - t, 3))));
    if (t < 1) requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
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
    { threshold: 0.5 }
  );

  counters.forEach((el) => counterObserver.observe(el));
} else {
  counters.forEach(runCounter);
}

/* ---------- Rakam ikonlarının çizgi çizim animasyonu ---------- */

const statCards = [...document.querySelectorAll(".stat")];

if (statCards.length) {
  const shapesOf = (card) => [...card.querySelectorAll(".stat-ico path, .stat-ico circle, .stat-ico rect")];

  statCards.forEach((card) => {
    if (reduceMotion) return;
    shapesOf(card).forEach((shape, i) => {
      shape.setAttribute("pathLength", "1");
      shape.style.strokeDasharray = "1";
      shape.style.strokeDashoffset = "1";
      shape.style.transition = `stroke-dashoffset 1s cubic-bezier(0.22, 1, 0.36, 1) ${(i * 0.11).toFixed(2)}s`;
    });
  });

  const draw = (card) => shapesOf(card).forEach((shape) => (shape.style.strokeDashoffset = "0"));

  if (reduceMotion || !("IntersectionObserver" in window)) {
    statCards.forEach(draw);
  } else {
    const drawObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          draw(entry.target);
          drawObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.45 }
    );
    statCards.forEach((card) => drawObserver.observe(card));
  }
}

/* ---------- Aktif bölüm ---------- */

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

/* ---------- Başa dön ---------- */

toTop?.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
});

/* ---------- Tema: koyu varsayılan, gündüz seçenekli ---------- */

const themeBtn = document.querySelector(".theme-toggle");
const themeLabel = document.querySelector("[data-theme-label]");

const applyTheme = (day) => {
  if (day) document.documentElement.dataset.theme = "day";
  else document.documentElement.removeAttribute("data-theme");

  themeBtn?.setAttribute("aria-pressed", String(day));
  if (themeLabel) themeLabel.textContent = day ? "Gece görünümü" : "Gündüz görünümü";

  try {
    localStorage.setItem("magnum-theme", day ? "day" : "dark");
  } catch (err) {}
};

applyTheme(
  (() => {
    try {
      return localStorage.getItem("magnum-theme") === "day";
    } catch (err) {
      return false;
    }
  })()
);

themeBtn?.addEventListener("click", () => {
  applyTheme(document.documentElement.dataset.theme !== "day");
});

/* ---------- Form ---------- */

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

/* ---------- Manyetik düğmeler ---------- */

if (!reduceMotion && finePointer) {
  document.querySelectorAll(".btn").forEach((el) => {
    el.addEventListener("pointermove", (event) => {
      const rect = el.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      el.style.transform = `translate(${(dx * 0.16).toFixed(1)}px, ${(dy * 0.2).toFixed(1)}px)`;
    });
    el.addEventListener("pointerleave", () => {
      el.style.transform = "";
    });
  });
}

/* ---------- İmleç halkası ---------- */

const ring = document.querySelector(".cursor-ring");

if (ring && !reduceMotion && finePointer) {
  let rx = -100;
  let ry = -100;
  let tx = -100;
  let ty = -100;

  window.addEventListener("pointermove", (event) => {
    tx = event.clientX;
    ty = event.clientY;
    ring.classList.add("is-on");
  });

  document.addEventListener("pointerleave", () => ring.classList.remove("is-on"));

  const follow = () => {
    rx += (tx - rx) * 0.18;
    ry += (ty - ry) * 0.18;
    ring.style.transform = `translate3d(${rx.toFixed(1)}px, ${ry.toFixed(1)}px, 0)`;
    requestAnimationFrame(follow);
  };
  requestAnimationFrame(follow);

  const grow = "a, button, summary, .svc-row, input, textarea";
  document.querySelectorAll(grow).forEach((el) => {
    el.addEventListener("pointerenter", () => ring.classList.add("is-big"));
    el.addEventListener("pointerleave", () => ring.classList.remove("is-big"));
  });
}

/* ---------- İletişim bölümünde imleç ışıması ---------- */

const contact = document.querySelector(".contact");

if (contact && !reduceMotion && finePointer) {
  contact.addEventListener("pointermove", (event) => {
    const rect = contact.getBoundingClientRect();
    contact.style.setProperty("--spot-x", `${(event.clientX - rect.left).toFixed(0)}px`);
    contact.style.setProperty("--spot-y", `${(event.clientY - rect.top).toFixed(0)}px`);
    contact.style.setProperty("--spot-o", "1");
  });
  contact.addEventListener("pointerleave", () => contact.style.setProperty("--spot-o", "0"));
}
