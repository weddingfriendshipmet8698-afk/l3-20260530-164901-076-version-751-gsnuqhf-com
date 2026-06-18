const ready = (callback) => {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
};

ready(() => {
  const toggle = document.querySelector("[data-menu-toggle]");
  const menu = document.querySelector("[data-mobile-menu]");

  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      const isOpen = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  document.querySelectorAll("[data-carousel]").forEach((carousel) => {
    const slides = Array.from(carousel.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(carousel.querySelectorAll("[data-hero-dot]"));
    let current = Math.max(0, slides.findIndex((slide) => slide.classList.contains("is-active")));

    const showSlide = (index) => {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    };

    dots.forEach((dot, dotIndex) => {
      dot.addEventListener("click", () => showSlide(dotIndex));
    });

    if (slides.length > 1) {
      window.setInterval(() => showSlide(current + 1), 5600);
    }
  });

  const inputs = Array.from(document.querySelectorAll("[data-search-input]"));
  const cards = Array.from(document.querySelectorAll("[data-search-card]"));
  const chips = Array.from(document.querySelectorAll("[data-filter]"));
  const params = new URLSearchParams(window.location.search);
  const queryValue = params.get("q") || "";

  let activeFilter = "all";

  if (queryValue && inputs.length) {
    inputs.forEach((input) => {
      input.value = queryValue;
    });
  }

  const applySearch = () => {
    const query = inputs.map((input) => input.value.trim().toLowerCase()).find(Boolean) || "";

    cards.forEach((card) => {
      const haystack = (card.dataset.search || "").toLowerCase();
      const type = card.dataset.type || "";
      const matchesQuery = !query || haystack.includes(query);
      const matchesFilter = activeFilter === "all" || type.includes(activeFilter) || haystack.includes(activeFilter.toLowerCase());
      card.classList.toggle("is-hidden-card", !(matchesQuery && matchesFilter));
    });
  };

  inputs.forEach((input) => {
    input.addEventListener("input", applySearch);
  });

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((item) => item.classList.remove("is-active"));
      chip.classList.add("is-active");
      activeFilter = chip.dataset.filter || "all";
      applySearch();
    });
  });

  applySearch();
});
