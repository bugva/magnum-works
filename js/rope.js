(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const SEG = 16;
  const ITERATIONS = 4;
  const GRAVITY = 0.42;
  const DAMPING = 0.984;
  const WIND = 0.085;
  const RETURN_K = 0.00075;
  const EDGE_BOUNCE = 0.4;
  const SLACK_SEG = 10;
  const TWIST = 21;
  const TWIST_AMP = 2.4;
  const KNOT_IDS = ["referanslar", "hizmetler", "surec", "isler", "sss", "hakkimizda", "iletisim"];

  const canvas = document.createElement("canvas");
  canvas.className = "rope-canvas";
  canvas.setAttribute("aria-hidden", "true");
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  const mouse = { x: 0, y: 0, active: false };
  let tug = { y: 0, active: false };
  let dpr = 1;
  let lastScroll = window.scrollY;
  let scrollForce = 0;
  let time = 0;
  let points = [];
  let activeId = "";

  const isDay = () => document.documentElement.dataset.theme === "day";
  const anchorX = () => (window.innerWidth < 760 ? 18 : 34);
  const pageHeight = () => Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
  const makePoint = (x, y) => ({ x, y, ox: x, oy: y });

  const rebuild = () => {
    const height = pageHeight();
    // Payı olan ip: fazladan segment ipin hafifçe sarkmasına ve
    // kıvrılmasına izin verir, gergin tel gibi durmaz.
    const count = Math.max(24, Math.ceil(height / SEG) + SLACK_SEG);
    const x = anchorX();
    if (!points.length) {
      for (let i = 0; i < count; i += 1) points.push(makePoint(x, 8 + i * SEG));
      return;
    }
    while (points.length < count) {
      const last = points[points.length - 1];
      points.push(makePoint(last.x, last.y + SEG));
    }
    if (points.length > count) points.length = count;
  };

  const sizeCanvas = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    rebuild();
  };

  const constrain = () => {
    const rest = SEG;
    for (let n = 0; n < ITERATIONS; n += 1) {
      for (let i = 0; i < points.length - 1; i += 1) {
        const a = points[i];
        const b = points[i + 1];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.hypot(dx, dy) || 0.0001;
        const diff = (dist - rest) / dist;
        const ox = dx * diff * 0.5;
        const oy = dy * diff * 0.5;
        if (i === 0) {
          b.x -= ox * 2;
          b.y -= oy * 2;
        } else {
          a.x += ox;
          a.y += oy;
          b.x -= ox;
          b.y -= oy;
        }
      }
      points[0].x = anchorX();
      points[0].y = 6;
      points[0].ox = points[0].x;
      points[0].oy = points[0].y;
    }
  };

  const step = () => {
    time += 1;
    const wind = Math.sin(time * 0.012) * WIND + Math.sin(time * 0.037) * WIND * 0.45;
    scrollForce *= 0.9;

    const rest = anchorX();

    for (let i = 1; i < points.length; i += 1) {
      const p = points[i];
      const vx = (p.x - p.ox) * DAMPING;
      const vy = (p.y - p.oy) * DAMPING;
      p.ox = p.x;
      p.oy = p.y;
      p.x += vx + wind + scrollForce;
      p.y += vy + GRAVITY;

      // Çapa kolonuna doğru çok yumuşak bir yay: yakında etkisi rüzgârın
      // altında kalır (salınım bozulmaz), uzakta ip sağda asılı kalmadan
      // kendi ağırlığıyla savrularak geri döner.
      p.x += (rest - p.x) * RETURN_K;

      if (!reduceMotion && tug.active) {
        const near = 1 - Math.min(Math.abs(p.y - tug.y) / 160, 1);
        if (near > 0) p.x -= near * 0.35;
      }

      if (mouse.active) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 16000) {
          const f = (1 - d2 / 16000) * 0.08;
          p.x += dx * f;
          p.y += dy * f;
        }
      }
    }

    constrain();
    clampToScreen();
  };

  // İp hiçbir zaman ekran dışına taşmasın: sol/sağ kenarda yumuşak sınır.
  // Kenara çarpan nokta hızının bir kısmını içeri doğru geri alır; böylece
  // duvara yapışıp kalmaz.
  const clampToScreen = () => {
    const minX = 3;
    const maxX = window.innerWidth - 3;
    for (let i = 1; i < points.length; i += 1) {
      const p = points[i];
      if (p.x < minX) {
        const v = p.x - p.ox;
        p.x = minX;
        p.ox = minX + (v < 0 ? v * EDGE_BOUNCE : 0);
      } else if (p.x > maxX) {
        const v = p.x - p.ox;
        p.x = maxX;
        p.ox = maxX + (v > 0 ? v * EDGE_BOUNCE : 0);
      }
    }
  };

  const pointAtY = (y) => {
    if (!points.length) return { x: anchorX(), y };
    if (y <= points[0].y) return points[0];
    const last = points[points.length - 1];
    if (y >= last.y) return last;
    for (let i = 0; i < points.length - 1; i += 1) {
      const a = points[i];
      const b = points[i + 1];
      if (y >= a.y && y <= b.y) {
        const t = (y - a.y) / (b.y - a.y || 1);
        return { x: a.x + (b.x - a.x) * t, y };
      }
    }
    return last;
  };

  const updateActive = () => {
    const mid = window.scrollY + window.innerHeight * 0.42;
    let current = KNOT_IDS[0];
    KNOT_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el && el.offsetTop <= mid) current = id;
    });
    activeId = current;
  };

  // Gövde eğrisi: kaba çokgen yerine yumuşak kavis.
  const traceCore = () => {
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length - 1; i += 1) {
      const c = points[i];
      const n = points[i + 1];
      ctx.quadraticCurveTo(c.x, c.y, (c.x + n.x) * 0.5, (c.y + n.y) * 0.5);
    }
    ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
  };

  // Bükümlü tel: ip boyunca normal eksende sinüs salınımı yaparak
  // sarmal görünümü verir.
  const traceStrand = (phase) => {
    ctx.beginPath();
    let s = 0;
    let started = false;
    const top = window.scrollY - 40;
    const bottom = window.scrollY + window.innerHeight + 40;

    for (let i = 0; i < points.length; i += 1) {
      const p = points[i];
      const prev = points[i > 0 ? i - 1 : 0];
      const next = points[i < points.length - 1 ? i + 1 : i];
      if (i > 0) s += Math.hypot(p.x - prev.x, p.y - prev.y);

      if (p.y < top || p.y > bottom) {
        started = false;
        continue;
      }

      const tx = next.x - prev.x;
      const ty = next.y - prev.y;
      const len = Math.hypot(tx, ty) || 1;
      const off = Math.sin((s / TWIST) * Math.PI * 2 + phase) * TWIST_AMP;
      const x = p.x - (ty / len) * off;
      const y = p.y + (tx / len) * off;

      if (!started) {
        ctx.moveTo(x, y);
        started = true;
      } else {
        ctx.lineTo(x, y);
      }
    }
  };

  const drawRope = (day) => {
    if (points.length < 2) return;

    // Gölge / kılıf
    traceCore();
    ctx.strokeStyle = day ? "rgba(10, 12, 14, 0.16)" : "rgba(0, 0, 0, 0.55)";
    ctx.lineWidth = 8;
    ctx.stroke();

    // Çekirdek
    traceCore();
    ctx.strokeStyle = day ? "#8a2f0d" : "#5c2410";
    ctx.lineWidth = 5.4;
    ctx.stroke();

    // Büküm telleri
    traceStrand(0);
    ctx.strokeStyle = "#ff5a1f";
    ctx.lineWidth = 2.8;
    ctx.stroke();

    traceStrand(Math.PI);
    ctx.strokeStyle = day ? "#c2410c" : "#f59e5b";
    ctx.lineWidth = 2.4;
    ctx.stroke();

    // İnce parlama
    traceStrand(Math.PI * 0.5);
    ctx.strokeStyle = day ? "rgba(255, 255, 255, 0.5)" : "rgba(255, 226, 190, 0.55)";
    ctx.lineWidth = 1;
    ctx.stroke();
  };

  // Tepede karabina: ipin bir yere asılı olduğunu belli eder.
  const drawAnchor = (day) => {
    const p = points[0];
    const metal = day ? "#3f4247" : "#c9ccd1";
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = metal;

    ctx.beginPath();
    ctx.ellipse(p.x, p.y + 12, 6.5, 11, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(p.x - 6.5, p.y + 7);
    ctx.lineTo(p.x + 6.5, p.y + 16);
    ctx.lineWidth = 1.4;
    ctx.stroke();
  };

  const drawKnots = (day) => {
    KNOT_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const y = el.getBoundingClientRect().top + window.scrollY + 18;
      if (y < window.scrollY - 40 || y > window.scrollY + window.innerHeight + 40) return;

      const p = pointAtY(y);
      const on = id === activeId;
      const r = on ? 7 : 5;

      // Düğüm sargısı
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, r * 0.78, r, 0, 0, Math.PI * 2);
      ctx.fillStyle = day ? "#8a2f0d" : "#5c2410";
      ctx.fill();
      ctx.lineWidth = 1.6;
      ctx.strokeStyle = on ? "#ff5a1f" : day ? "#c2410c" : "#f59e5b";
      ctx.stroke();

      // Sargı çizgileri
      ctx.beginPath();
      ctx.moveTo(p.x - r * 0.7, p.y - r * 0.35);
      ctx.lineTo(p.x + r * 0.7, p.y - r * 0.35);
      ctx.moveTo(p.x - r * 0.7, p.y + r * 0.35);
      ctx.lineTo(p.x + r * 0.7, p.y + r * 0.35);
      ctx.lineWidth = 1;
      ctx.strokeStyle = on ? "#ffd7c2" : day ? "rgba(255,255,255,0.45)" : "rgba(255, 226, 190, 0.4)";
      ctx.stroke();

      if (on) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, r + 5, 0, Math.PI * 2);
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = "rgba(255, 90, 31, 0.5)";
        ctx.stroke();
      }
    });
  };

  const draw = () => {
    const day = isDay();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    ctx.save();
    ctx.translate(0, -window.scrollY);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    drawRope(day);
    drawAnchor(day);
    drawKnots(day);
    ctx.restore();
  };

  const tick = () => {
    updateActive();
    if (!reduceMotion) step();
    else {
      const x = anchorX();
      points.forEach((p, i) => {
        p.x = x;
        p.y = 6 + i * SEG;
        p.ox = p.x;
        p.oy = p.y;
      });
    }
    draw();
    requestAnimationFrame(tick);
  };

  const bindTug = (el) => {
    el.addEventListener("mouseenter", () => {
      const box = el.getBoundingClientRect();
      tug = { y: box.top + window.scrollY + box.height * 0.45, active: true };
    });
    el.addEventListener("mouseleave", () => {
      tug.active = false;
    });
  };

  document.querySelectorAll(".svc-row, .work-row").forEach(bindTug);
  document.querySelectorAll(".nav a, .nav-drop-btn").forEach(bindTug);

  window.addEventListener(
    "scroll",
    () => {
      const y = window.scrollY;
      scrollForce += Math.max(-0.22, Math.min(0.22, (y - lastScroll) * 0.008));
      scrollForce = Math.max(-0.28, Math.min(0.28, scrollForce));
      lastScroll = y;
    },
    { passive: true }
  );

  window.addEventListener("mousemove", (event) => {
    mouse.active = true;
    mouse.x = event.clientX;
    mouse.y = event.clientY + window.scrollY;
  });
  window.addEventListener("mouseleave", () => {
    mouse.active = false;
  });
  window.addEventListener("resize", sizeCanvas);
  new ResizeObserver(() => rebuild()).observe(document.body);

  sizeCanvas();
  requestAnimationFrame(tick);
})();
