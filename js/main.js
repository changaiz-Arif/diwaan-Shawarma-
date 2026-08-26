/* ============================================================
   DEWAAN SHAWARMA — MAIN
   Navigation, scroll reveals, featured-product rendering,
   contact form, small shared behaviours used on every page.
   ============================================================ */

/* ---------- Mobile navigation ---------- */

function initNav() {
  const toggle = document.querySelector("[data-nav-toggle]");
  const nav = document.querySelector("[data-nav-menu]");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    toggle.classList.toggle("is-open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      toggle.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });

  /* Header shrink + shadow on scroll */
  const header = document.querySelector("[data-site-header]");
  if (header) {
    window.addEventListener("scroll", () => {
      header.classList.toggle("is-scrolled", window.scrollY > 12);
    });
  }

  /* Highlight current page in nav */
  const path = window.location.pathname.split("/").pop() || "index.html";
  nav.querySelectorAll("a[href]").forEach((link) => {
    const href = link.getAttribute("href");
    if (href === path || (path === "" && href === "index.html")) {
      link.classList.add("is-active");
    }
  });
}

/* ---------- Smooth scroll for on-page anchors ---------- */

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href");
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

/* ---------- Scroll reveal ---------- */

function initReveal() {
  const items = document.querySelectorAll("[data-reveal]");
  if (!items.length) return;

  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );

  items.forEach((el) => observer.observe(el));
}

/* ---------- Product card markup ---------- */

function productCardHTML(product) {
  return `
    <article class="product-card" data-reveal data-product-id="${product.id}">
      <div class="product-card__media">
        <img src="${product.image}" alt="${product.name}" loading="lazy" />
        ${product.popular ? '<span class="product-card__badge">Popular</span>' : ""}
      </div>
      <div class="product-card__body">
        <h3 class="product-card__name">${product.name}</h3>
        <p class="product-card__desc">${product.description}</p>
        <div class="product-card__footer">
          <span class="product-card__price">${formatPrice(product.price)}</span>
          <div class="stepper">
            <button type="button" class="qty-btn" data-step-decrease aria-label="Decrease quantity">−</button>
            <span data-qty-value class="qty-value">1</span>
            <button type="button" class="qty-btn" data-step-increase aria-label="Increase quantity">+</button>
          </div>
        </div>
        <button type="button" class="btn btn--primary btn--block" data-add-to-cart>Add to Order</button>
      </div>
    </article>`;
}

/* ---------- Featured products (home page) ---------- */

function renderFeatured() {
  const grid = document.querySelector("[data-featured-grid]");
  if (!grid) return;
  const featured = getProductsByCategory("popular").slice(0, 6);
  grid.innerHTML = featured.map(productCardHTML).join("");
}

/* ---------- Contact form (contact.html) ---------- */

function initContactForm() {
  const form = document.querySelector("[data-contact-form]");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = form.querySelector('[name="name"]');
    const phone = form.querySelector('[name="phone"]');
    const message = form.querySelector('[name="message"]');
    let valid = true;

    [name, phone, message].forEach((input) => {
      const wrap = input.closest(".field");
      wrap?.classList.remove("has-error");
    });

    if (!name.value.trim()) {
      name.closest(".field")?.classList.add("has-error");
      valid = false;
    }
    if (phone.value.replace(/[^\d]/g, "").length < 10) {
      phone.closest(".field")?.classList.add("has-error");
      valid = false;
    }
    if (!message.value.trim()) {
      message.closest(".field")?.classList.add("has-error");
      valid = false;
    }

    if (!valid) {
      toast("Please check the highlighted fields");
      return;
    }

    const text = `*New Message — Dewaan Shawarma Website*\n\n*Name:* ${name.value.trim()}\n*Phone:* ${phone.value.trim()}\n*Message:* ${message.value.trim()}`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank");
    form.reset();
    toast("Message ready on WhatsApp — hit send there!");
  });
}

/* ---------- Footer year ---------- */

function setYear() {
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initNav();
  initSmoothScroll();
  renderFeatured();
  initContactForm();
  setYear();
  initReveal();
});
