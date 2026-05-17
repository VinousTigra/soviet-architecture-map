const map = L.map("map-container").setView([59.936, 30.255], 13);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

let markers = [];
let markersById = {};

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
  markersById = {};

  const filteredObjects =
    filter === "all"
      ? objects
      : objects.filter((object) => object.period === filter);

  filteredObjects.forEach((object) => {
    const marker = L.marker(object.coords, {
      icon: createMarkerIcon(object.period),
    })
      .addTo(map)
      .bindPopup(`<strong>${object.title}</strong><br>${object.period}`);

    marker.on("click", () => {
      renderSelectedObject(object);
    });

    markers.push(marker);
    markersById[object.id] = marker;
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

            <button class="card__map-button" data-object-id="${object.id}">
              Показать на карте
            </button>
          </div>
        </article>
      `,
    )
    .join("");

  initCardMapButtons();
}

function initCardMapButtons() {
  const buttons = document.querySelectorAll(".card__map-button");

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const objectId = Number(button.dataset.objectId);
      const object = objects.find((item) => item.id === objectId);

      if (!object) {
        return;
      }

      showObjectOnMap(object);
    });
  });
}

function showObjectOnMap(object) {
  const navButtons = document.querySelectorAll(".nav__button");
  const tabs = document.querySelectorAll(".tab");

  navButtons.forEach((button) => {
    button.classList.remove("active");

    if (button.dataset.tab === "map-section") {
      button.classList.add("active");
    }
  });

  tabs.forEach((tab) => {
    tab.classList.remove("active");
  });

  document.querySelector("#map-section").classList.add("active");

  setTimeout(() => {
    map.invalidateSize();
    map.setView(object.coords, 16);

    renderSelectedObject(object);

    const marker = markersById[object.id];

    if (marker) {
      marker.openPopup();
    }
  }, 100);
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
