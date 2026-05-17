const map = L.map("map-container").setView([59.936, 30.255], 13);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

let markers = [];
let markersById = {};
let zoneLayers = [];

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

function renderZones() {
  zoneLayers.forEach((zoneLayer) => zoneLayer.remove());
  zoneLayers = [];

  zones.forEach((zone) => {
    const zoneLayer = L.polygon(zone.coords, {
      color: zone.color,
      fillColor: zone.color,
      fillOpacity: 0.18,
      weight: 2,
      opacity: 0.8,
    })
      .addTo(map)
      .bindPopup(
        `<strong>${zone.title}</strong><br>${zone.period}<br>${zone.description}`,
      );

    zoneLayers.push(zoneLayer);
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
            class="card__image js-open-image"
            src="${object.image}"
            alt="${object.title}"
            data-full-image="${object.image}"
          />

          <div class="card__content">
            <p class="card__period">${object.period} · ${object.years}</p>
            <h3>${object.title}</h3>

            <p class="card__meta"><strong>Адрес:</strong> ${object.address}</p>
            <p class="card__meta"><strong>Архитекторы:</strong> ${object.architects}</p>
            <p class="card__text">${object.fullText}</p>

            <button class="card__map-button" data-object-id="${object.id}">
              Показать на карте
            </button>
          </div>
        </article>
      `,
    )
    .join("");

  initCardMapButtons();
  initImageModal();
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

function initImageModal() {
  const images = document.querySelectorAll(".js-open-image");
  const modal = document.querySelector("#image-modal");
  const modalImage = document.querySelector("#image-modal-img");
  const closeButton = document.querySelector("#image-modal-close");

  if (!modal || !modalImage || !closeButton) {
    console.log("Модальное окно не найдено в HTML");
    return;
  }

  images.forEach((image) => {
    image.addEventListener("click", () => {
      modalImage.src = image.dataset.fullImage;
      modalImage.alt = image.alt;
      modal.classList.add("active");
      document.body.classList.add("modal-open");
    });
  });

  closeButton.addEventListener("click", closeImageModal);

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeImageModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeImageModal();
    }
  });
}

function closeImageModal() {
  const modal = document.querySelector("#image-modal");
  const modalImage = document.querySelector("#image-modal-img");

  if (!modal || !modalImage) {
    return;
  }

  modal.classList.remove("active");
  document.body.classList.remove("modal-open");
  modalImage.src = "";
  modalImage.alt = "";
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

renderZones();
renderMarkers();
renderCards();
initTabs();
initFilters();
