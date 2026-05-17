const map = L.map("map-container").setView([59.936, 30.255], 13);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

let markers = [];

function getMarkerClass(period) {
  if (period === "Авангард") {
    return "avant";
  }

  if (period === "Сталинский ампир") {
    return "stalin";
  }

  if (period === "Поздний модернизм") {
    return "modern";
  }

  return "default";
}

function createMarkerIcon(period) {
  const markerClass = getMarkerClass(period);

  return L.divIcon({
    className: "custom-marker",
    html: `<span class="marker marker--${markerClass}"></span>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

function renderMarkers(filter = "all") {
  markers.forEach((marker) => marker.remove());
  markers = [];

  const filteredObjects =
    filter === "all"
      ? objects
      : objects.filter((object) => object.period === filter);

  filteredObjects.forEach((object) => {
    const marker = L.marker(object.coords, {
      icon: createMarkerIcon(object.period),
    }).addTo(map);

    marker.on("click", () => {
      renderSelectedObject(object);
    });

    markers.push(marker);
  });
}

function renderSelectedObject(object) {
  const container = document.querySelector("#selected-object");

  container.innerHTML = `
    <article class="object-preview">
      <img
        class="object-preview__image"
        src="${object.image}"
        alt="${object.title}"
      />

      <div class="object-preview__content">
        <p class="object-preview__period">${object.period} · ${object.years}</p>
        <h2>${object.title}</h2>

        <p><strong>Адрес:</strong> ${object.address}</p>
        <p><strong>Архитекторы:</strong> ${object.architects}</p>
        <p>${object.shortText}</p>
      </div>
    </article>
  `;
}

function renderCards() {
  const container = document.querySelector("#cards-container");

  container.innerHTML = objects
    .map(
      (object) => `
        <article class="card">
          <img
            class="card__image"
            src="${object.image}"
            alt="${object.title}"
          />

          <div class="card__content">
            <p class="card__period">${object.period} · ${object.years}</p>
            <h3>${object.title}</h3>

            <p><strong>Адрес:</strong> ${object.address}</p>
            <p><strong>Архитекторы:</strong> ${object.architects}</p>
            <p>${object.fullText}</p>
          </div>
        </article>
      `,
    )
    .join("");
}

function initTabs() {
  const navButtons = document.querySelectorAll(".nav__button");
  const tabs = document.querySelectorAll(".tab");

  navButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetTab = button.dataset.tab;

      navButtons.forEach((navButton) => {
        navButton.classList.remove("active");
      });

      tabs.forEach((tab) => {
        tab.classList.remove("active");
      });

      button.classList.add("active");
      document.querySelector(`#${targetTab}`).classList.add("active");

      if (targetTab === "map-section") {
        setTimeout(() => {
          map.invalidateSize();
        }, 100);
      }
    });
  });
}

function initFilters() {
  const filterButtons = document.querySelectorAll(".filter-button");

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;

      filterButtons.forEach((filterButton) => {
        filterButton.classList.remove("active");
      });

      button.classList.add("active");
      renderMarkers(filter);
    });
  });
}

renderMarkers();
renderCards();
initTabs();
initFilters();
