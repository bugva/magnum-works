window.MAGNUM_REFS = [
  { name: "Cumhurbaşkanlığı" },
  { name: "Jandarma ve Sahil Güvenlik Akademisi" },
  { name: "Türk Hava Kuvvetleri" },
  { name: "STM" },
  { name: "Türkmenistan Kara Kuvvetleri" },
  { name: "Danıştay" },
  { name: "AFAD" },
  { name: "EPDK" },
  { name: "Akkuyu Nükleer" },
  { name: "Çayeli Bakır İşletmeleri" },
  { name: "DSİ Isparta" },
  { name: "Eti Soda" },
  { name: "TEİAŞ" },
  { name: "Petlas Holding" },
  { name: "Ankara Arena" },
  { name: "Ülker Arena" },
  { name: "ODTÜ Teknokent" },
  { name: "Hacettepe Teknokent" },
  { name: "Çanakkale 18 Mart Üniversitesi" },
  { name: "Ankara Üniversitesi" },
  { name: "Nevşehir Hacı Bektaş Veli Üniversitesi" },
  { name: "Diyarbakır Yeni Stadyumu" },
  { name: "Mahal Ankara" },
  { name: "Liv Hospital" },
  { name: "Next Level AVM" },
  { name: "Kızılay AVM" },
  { name: "Anteres AVM" },
  { name: "Anatolium AVM" },
  { name: "Troypark AVM" },
  { name: "Kentpark AVM" },
  { name: "ATG" },
  { name: "Yıldız Kule" },
  { name: "Selçuk Ecza Deposu" },
  { name: "Wind Ankara" },
  { name: "Nata Vega Konut Kuleleri" },
  { name: "JW Marriott Hotel Ankara" },
  { name: "Wyndham Ankara Hotel" },
  { name: "Anadolu Hotel Downtown" },
  { name: "Nişantaşı Pazarı" },
];

(() => {
  const track = document.querySelector("[data-refs-track]");
  const list = document.querySelector("[data-refs-list]");
  const refs = (window.MAGNUM_REFS || []).filter((item) => item && item.name);
  if (!refs.length) return;

  const card = (item, hidden) => {
    const li = document.createElement("li");
    if (hidden) li.setAttribute("aria-hidden", "true");
    const article = document.createElement("article");
    article.className = "refs-card";

    const plate = document.createElement("div");
    plate.className = "refs-plate";
    if (item.src) {
      const img = document.createElement("img");
      img.className = "refs-logo";
      img.src = item.src;
      img.alt = hidden ? "" : item.name;
      plate.append(img);
    } else {
      const slot = document.createElement("span");
      slot.className = "refs-slot";
      slot.textContent = "Logo";
      plate.append(slot);
    }

    const name = document.createElement("p");
    name.className = "refs-name";
    name.textContent = item.name;

    article.append(plate, name);
    li.append(article);
    return li;
  };

  if (track) {
    track.replaceChildren(...refs.map((item) => card(item, false)), ...refs.map((item) => card(item, true)));
  }

  if (list) {
    list.replaceChildren(
      ...refs.map((item) => {
        const li = document.createElement("li");
        li.textContent = item.name;
        return li;
      })
    );
  }
})();
