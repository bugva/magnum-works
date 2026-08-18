(() => {
  const render = () => {
    const services = window.MAGNUM_SERVICES || [];
    const slug = (location.hash || "").replace(/^#/, "") || services[0]?.slug;
    const service = services.find((item) => item.slug === slug) || services[0];
    if (!service) return;

    document.title = `${service.title} | MagnumWorks`;

    const setText = (selector, value) => {
      const el = document.querySelector(selector);
      if (el) el.textContent = value;
    };

    setText("[data-n]", service.n);
    setText("[data-title]", service.title);
    setText("[data-dek]", service.dek);

    const body = document.querySelector("[data-body]");
    if (body) {
      body.innerHTML = service.body.map((p) => `<p>${p}</p>`).join("");
    }

    const items = document.querySelector("[data-items]");
    if (items) {
      items.innerHTML = service.items.map((item) => `<li>${item}</li>`).join("");
    }

    const gallerySection = document.querySelector(".gallery");
    const gallery = document.querySelector("[data-gallery]");
    const photos = Array.isArray(service.photos) ? service.photos.filter((p) => p && p.src) : [];

    if (!gallerySection || !gallery) return;

    if (photos.length) {
      gallerySection.hidden = false;
      gallery.innerHTML = photos
        .map(
          (photo) =>
            `<figure><img src="${photo.src}" alt="${photo.alt || service.title}" /></figure>`
        )
        .join("");
    } else {
      gallerySection.hidden = true;
      gallery.innerHTML = "";
    }
  };

  render();
  window.addEventListener("hashchange", render);
})();
