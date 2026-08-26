/* ============================================================
   DEWAAN SHAWARMA — CART
   Handles all cart state: add / remove / quantity / totals.
   Persisted to localStorage so the cart survives page changes.
   Renders the "order chit" drawer used on every page.
   ============================================================ */

const CART_KEY = "dewaan_cart_v1";
const DELIVERY_FEE = 150;

function readCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("Cart read failed:", err);
    return [];
  }
}

function writeCart(cart) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch (err) {
    console.error("Cart save failed:", err);
  }
  renderCartBadge();
  renderCartDrawer();
}

function addToCart(productId, qty = 1) {
  const product = getProductById(productId);
  if (!product) return;
  const cart = readCart();
  const existing = cart.find((item) => item.id === product.id);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ id: product.id, qty });
  }
  writeCart(cart);
  pulseCartIcon();
  toast(`Added ${product.name} to your order`);
}

function updateQty(productId, qty) {
  let cart = readCart();
  if (qty <= 0) {
    cart = cart.filter((item) => item.id !== Number(productId));
  } else {
    const item = cart.find((i) => i.id === Number(productId));
    if (item) item.qty = qty;
  }
  writeCart(cart);
}

function removeFromCart(productId) {
  const cart = readCart().filter((item) => item.id !== Number(productId));
  writeCart(cart);
  toast("Removed from your order");
}

function clearCart() {
  writeCart([]);
}

function cartLines() {
  return readCart()
    .map((item) => {
      const product = getProductById(item.id);
      if (!product) return null;
      return { ...product, qty: item.qty, lineTotal: product.price * item.qty };
    })
    .filter(Boolean);
}

function cartCount() {
  return readCart().reduce((sum, item) => sum + item.qty, 0);
}

function cartSubtotal() {
  return cartLines().reduce((sum, line) => sum + line.lineTotal, 0);
}

/* ---------- Rendering ---------- */

function renderCartBadge() {
  document.querySelectorAll("[data-cart-count]").forEach((el) => {
    const count = cartCount();
    el.textContent = count;
    el.classList.toggle("is-hidden", count === 0);
  });
}

function pulseCartIcon() {
  document.querySelectorAll("[data-cart-toggle]").forEach((el) => {
    el.classList.remove("pulse");
    void el.offsetWidth; /* restart animation */
    el.classList.add("pulse");
  });
}

function renderCartDrawer() {
  const list = document.querySelector("[data-cart-lines]");
  if (!list) return; /* drawer not on this page load yet */

  const lines = cartLines();
  const fulfilment = document.querySelector('input[name="fulfilment"]:checked');
  const isDelivery = fulfilment ? fulfilment.value === "delivery" : true;

  if (lines.length === 0) {
    list.innerHTML = `
      <li class="chit-empty">
        <p>Your chit is empty.</p>
        <span>Add something delicious from the menu.</span>
      </li>`;
  } else {
    list.innerHTML = lines
      .map(
        (line) => `
        <li class="chit-line" data-line="${line.id}">
          <img src="${line.image}" alt="${line.name}" loading="lazy" />
          <div class="chit-line__info">
            <p class="chit-line__name">${line.name}</p>
            <span class="chit-line__price">${formatPrice(line.price)} each</span>
            <div class="chit-line__controls">
              <button type="button" class="qty-btn" data-qty-decrease="${line.id}" aria-label="Decrease quantity">−</button>
              <span class="qty-value">${line.qty}</span>
              <button type="button" class="qty-btn" data-qty-increase="${line.id}" aria-label="Increase quantity">+</button>
              <button type="button" class="chit-line__remove" data-remove="${line.id}" aria-label="Remove item">Remove</button>
            </div>
          </div>
          <span class="chit-line__total">${formatPrice(line.lineTotal)}</span>
        </li>`
      )
      .join("");
  }

  const subtotal = cartSubtotal();
  const delivery = lines.length && isDelivery ? DELIVERY_FEE : 0;
  const total = subtotal + delivery;

  const subtotalEl = document.querySelector("[data-cart-subtotal]");
  const deliveryEl = document.querySelector("[data-cart-delivery]");
  const totalEl = document.querySelector("[data-cart-total]");
  if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
  if (deliveryEl) deliveryEl.textContent = delivery ? formatPrice(delivery) : "Free";
  if (totalEl) totalEl.textContent = formatPrice(total);

  const checkoutBtn = document.querySelector("[data-checkout-submit]");
  if (checkoutBtn) checkoutBtn.disabled = lines.length === 0;
}

/* ---------- Drawer open / close ---------- */

function openCartDrawer() {
  const drawer = document.querySelector("[data-cart-drawer]");
  const overlay = document.querySelector("[data-cart-overlay]");
  if (!drawer) return;
  drawer.classList.add("is-open");
  overlay?.classList.add("is-open");
  document.body.classList.add("no-scroll");
  renderCartDrawer();
}

function closeCartDrawer() {
  const drawer = document.querySelector("[data-cart-drawer]");
  const overlay = document.querySelector("[data-cart-overlay]");
  drawer?.classList.remove("is-open");
  overlay?.classList.remove("is-open");
  document.body.classList.remove("no-scroll");
}

/* ---------- Toast ---------- */

let toastTimer = null;
function toast(message) {
  let el = document.querySelector(".toast");
  if (!el) {
    el = document.createElement("div");
    el.className = "toast";
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("is-visible"), 2200);
}

/* ---------- Wiring (event delegation, works on every page) ---------- */

document.addEventListener("click", (e) => {
  const toggle = e.target.closest("[data-cart-toggle]");
  if (toggle) {
    openCartDrawer();
    return;
  }
  const close = e.target.closest("[data-cart-close]");
  if (close) {
    closeCartDrawer();
    return;
  }
  const overlay = e.target.closest("[data-cart-overlay]");
  if (overlay) {
    closeCartDrawer();
    return;
  }
  const inc = e.target.closest("[data-qty-increase]");
  if (inc) {
    const id = Number(inc.dataset.qtyIncrease);
    const line = cartLines().find((l) => l.id === id);
    updateQty(id, (line ? line.qty : 0) + 1);
    return;
  }
  const dec = e.target.closest("[data-qty-decrease]");
  if (dec) {
    const id = Number(dec.dataset.qtyDecrease);
    const line = cartLines().find((l) => l.id === id);
    updateQty(id, (line ? line.qty : 1) - 1);
    return;
  }
  const remove = e.target.closest("[data-remove]");
  if (remove) {
    removeFromCart(Number(remove.dataset.remove));
    return;
  }
  const addBtn = e.target.closest("[data-add-to-cart]");
  if (addBtn) {
    const card = addBtn.closest("[data-product-id]");
    const id = Number(card ? card.dataset.productId : addBtn.dataset.addToCart);
    const stepper = card ? card.querySelector("[data-qty-value]") : null;
    const qty = stepper ? Number(stepper.textContent) : 1;
    addToCart(id, qty);
    if (stepper) stepper.textContent = "1";
    return;
  }
  const stepInc = e.target.closest("[data-step-increase]");
  if (stepInc) {
    const card = stepInc.closest("[data-product-id]");
    const el = card.querySelector("[data-qty-value]");
    el.textContent = Number(el.textContent) + 1;
    return;
  }
  const stepDec = e.target.closest("[data-step-decrease]");
  if (stepDec) {
    const card = stepDec.closest("[data-product-id]");
    const el = card.querySelector("[data-qty-value]");
    el.textContent = Math.max(1, Number(el.textContent) - 1);
    return;
  }
});

document.addEventListener("change", (e) => {
  if (e.target.name === "fulfilment") renderCartDrawer();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeCartDrawer();
});

document.addEventListener("DOMContentLoaded", () => {
  renderCartBadge();
  renderCartDrawer();
});
