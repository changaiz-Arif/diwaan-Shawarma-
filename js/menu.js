/* ============================================================
   DEWAAN SHAWARMA — MENU PAGE
   Category filter tabs + product grid rendering + live search.
   ============================================================ */

let activeCategory = "all";
let activeSearch = "";

function renderCategoryTabs() {
  const tabWrap = document.querySelector("[data-category-tabs]");
  if (!tabWrap) return;

  const allTab = { id: "all", label: "Full Menu" };
  const tabs = [allTab, ...CATEGORIES.filter((c) => c.id !== "popular"), { id: "popular", label: "Popular" }];

  tabWrap.innerHTML = tabs
    .map(
      (tab) => `
      <button type="button" class="tab ${tab.id === activeCategory ? "is-active" : ""}" data-category="${tab.id}">
        ${tab.label}
      </button>`
    )
    .join("");
}

function renderMenuGrid() {
  const grid = document.querySelector("[data-menu-grid]");
  if (!grid) return;

  let list = getProductsByCategory(activeCategory);
  if (activeSearch.trim()) {
    const q = activeSearch.trim().toLowerCase();
    list = list.filter(
      (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    );
  }

  const empty = document.querySelector("[data-menu-empty]");
  if (list.length === 0) {
    grid.innerHTML = "";
    if (empty) empty.classList.remove("is-hidden");
    return;
  }
  if (empty) empty.classList.add("is-hidden");

  grid.innerHTML = list.map(productCardHTML).join("");
  initReveal();
}

document.addEventListener("click", (e) => {
  const tab = e.target.closest("[data-category]");
  if (!tab) return;
  activeCategory = tab.dataset.category;
  renderCategoryTabs();
  renderMenuGrid();
});

document.addEventListener("input", (e) => {
  const search = e.target.closest("[data-menu-search]");
  if (!search) return;
  activeSearch = search.value;
  renderMenuGrid();
});

document.addEventListener("DOMContentLoaded", () => {
  /* Allow menu.html?category=drinks style deep links from other pages */
  const params = new URLSearchParams(window.location.search);
  const requested = params.get("category");
  if (requested && CATEGORIES.some((c) => c.id === requested)) {
    activeCategory = requested;
  }
  renderCategoryTabs();
  renderMenuGrid();
});
