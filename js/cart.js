/* ============================================================
   DIWAN SHAWARMA — CART
   ------------------------------------------------------------
   Everything related to the "order chit" cart: state, storage,
   totals, and the drawer's rendered UI. Organized top-to-bottom
   as: config → storage → mutations → derived data → rendering →
   drawer controls → toast → event wiring.

   Public functions used by other scripts (do not rename):
     addToCart, updateQty, removeFromCart, clearCart,
     cartLines, cartCount, cartSubtotal, getDeliveryFee,
     renderCartBadge, renderCartDrawer, openCartDrawer,
     closeCartDrawer, toast, DELIVERY_FEE, FREE_DELIVERY_THRESHOLD
   ============================================================ */

/* ---------- Config ---------- */

const CART_KEY = "diwan_cart_v1";
const DELIVERY_FEE = 150;
const FREE_DELIVERY_THRESHOLD = 2500; /* spend this much (Rs.) and delivery is free */

/* ---------- Storage ---------- */

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

/* ---------- Mutations ---------- */

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
  toast(`${product.name} added to your order`);
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

let lastRemoved = null; /* holds { item, index } briefly so "Undo" can restore it */

function removeFromCart(productId) {
  const cart = readCart();
  const index = cart.findIndex((item) => item.id === Number(productId));
  if (index === -1) return;

  const product = getProductById(productId);
  lastRemoved = { item: cart[index], index };
  cart.splice(index, 1);
  writeCart(cart);

  toast(product ? `Removed ${product.name}` : "Item removed", {
    actionLabel: "Undo",
    onAction: undoLastRemove
  });
}

function undoLastRemove() {
  if (!lastRemoved) return;
  const cart = readCart();
  cart.splice(Math.min(lastRemoved.index, cart.length), 0, lastRemoved.item);
  lastRemoved = null;
  writeCart(cart);
}

function clearCart() {
  writeCart([]);
}

/* ---------- Derived data ---------- */

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

/**
 * Delivery is free above FREE_DELIVERY_THRESHOLD, otherwise DELIVERY_FEE.
 * Pickup and empty carts never carry a delivery charge. Kept as a single
 * shared function so the cart drawer and the WhatsApp checkout message
 * always agree on the same number.
 */
function getDeliveryFee(subtotal, fulfilment) {
  if (fulfilment !== "delivery" || subtotal <= 0) return 0;
  return subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
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

function emptyChitMarkup() {
  return `
    <li class="chit-empty">
      <span class="chit-empty__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4"/>
          <path d="M3 6h18"/>
          <path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
      </span>
      <p>Your chit is empty</p>
      <span>Add something delicious from the menu to get started.</span>
      <a href="menu.html" class="btn btn--primary chit-empty__cta">Browse the Menu</a>
    </li>`;
}

function chitLineMarkup(line, index) {
  return `
    <li class="chit-line" data-line="${line.id}" style="animation-delay:${index * 0.05}s">
      <img src="${line.image}" alt="${line.name}" loading="lazy" />
      <div class="chit-line__info">
        <p class="chit-line__name">${line.name}</p>
        <span class="chit-line__price">${formatPrice(line.price)} each</span>
        <div class="chit-line__controls">
          <div class="stepper stepper--compact">
            <button type="button" class="qty-btn" data-qty-decrease="${line.id}" aria-label="Decrease quantity">−</button>
            <span class="qty-value">${line.qty}</span>
            <button type="button" class="qty-btn" data-qty-increase="${line.id}" aria-label="Increase quantity">+</button>
          </div>
          <button type="button" class="chit-line__remove" data-remove="${line.id}" aria-label="Remove ${line.name}">Remove</button>
        </div>
      </div>
      <span class="chit-line__total">${formatPrice(line.lineTotal)}</span>
    </li>`;
}

function deliveryProgressMarkup(subtotal, isDelivery) {
  if (!isDelivery) return "";

  if (subtotal >= FREE_DELIVERY_THRESHOLD) {
    return `
      <div class="chit-progress chit-progress--done">
        <span class="chit-progress__label">🎉 You've unlocked free delivery!</span>
      </div>`;
  }

  const remaining = FREE_DELIVERY_THRESHOLD - subtotal;
  const pct = Math.min(100, Math.round((subtotal / FREE_DELIVERY_THRESHOLD) * 100));
  return `
    <div class="chit-progress">
      <span class="chit-progress__label">Add ${formatPrice(remaining)} more for <strong>free delivery</strong></span>
      <div class="chit-progress__track"><div class="chit-progress__fill" style="width:${pct}%"></div></div>
    </div>`;
}

function renderCartDrawer() {
  const list = document.querySelector("[data-cart-lines]");
  if (!list) return; /* drawer markup not present on this page load yet */

  const lines = cartLines();
  const fulfilmentInput = document.querySelector('input[name="fulfilment"]:checked');
  const fulfilment = fulfilmentInput ? fulfilmentInput.value : "delivery";
  const isDelivery = fulfilment === "delivery";

  list.innerHTML = lines.length
    ? lines.map(chitLineMarkup).join("")
    : emptyChitMarkup();

  const subtotal = cartSubtotal();
  const delivery = getDeliveryFee(subtotal, fulfilment);
  const total = subtotal + delivery;

  const progressHost = document.querySelector("[data-cart-progress]");
  if (progressHost) {
    progressHost.innerHTML = lines.length ? deliveryProgressMarkup(subtotal, isDelivery) : "";
  }

  const subtotalEl = document.querySelector("[data-cart-subtotal]");
  const deliveryEl = document.querySelector("[data-cart-delivery]");
  const totalEl = document.querySelector("[data-cart-total]");
  if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
  if (deliveryEl) deliveryEl.textContent = delivery ? formatPrice(delivery) : "Free";
  if (totalEl) totalEl.textContent = formatPrice(total);

  const checkoutBtn = document.querySelector("[data-checkout-submit]");
  if (checkoutBtn) checkoutBtn.disabled = lines.length === 0;

  const footer = document.querySelector("[data-cart-footer]");
  if (footer) footer.classList.toggle("is-hidden", lines.length === 0);
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

/* ---------- Swipe / drag to close ----------
   Lets the drawer be dragged toward the right edge (the direction
   it slides in from) to dismiss it, the way a native app sheet
   would behave. Works with touch and mouse. A vertical swipe
   inside the item list still scrolls normally — the gesture only
   takes over once the drag is clearly more horizontal than
   vertical. */

function initDrawerSwipe() {
  const drawer = document.querySelector("[data-cart-drawer]");
  const overlay = document.querySelector("[data-cart-overlay]");
  if (!drawer) return;

  const CLOSE_THRESHOLD = 90; /* px dragged before a release counts as "close" */
  let startX = 0;
  let startY = 0;
  let dragX = 0;
  let axis = null; /* "x" once a horizontal drag is detected, "y" if vertical (ignored) */
  let dragging = false;

  function pointFrom(e) {
    return e.touches ? e.touches[0] : e;
  }

  function start(e) {
    if (!drawer.classList.contains("is-open")) return;
    if (e.target.closest("input, textarea, button, select, a")) return; /* don't hijack controls */
    const p = pointFrom(e);
    startX = p.clientX;
    startY = p.clientY;
    dragX = 0;
    axis = null;
    dragging = true;
  }

  function move(e) {
    if (!dragging) return;
    const p = pointFrom(e);
    const deltaX = p.clientX - startX;
    const deltaY = p.clientY - startY;

    if (!axis) {
      if (Math.abs(deltaX) < 8 && Math.abs(deltaY) < 8) return; /* not enough movement yet */
      axis = Math.abs(deltaX) > Math.abs(deltaY) ? "x" : "y";
      if (axis === "x") drawer.classList.add("is-dragging");
    }

    if (axis !== "x") return; /* vertical drag — let the list scroll as normal */

    if (e.cancelable) e.preventDefault();
    dragX = Math.max(0, Math.min(deltaX, drawer.offsetWidth));
    drawer.style.transform = `translateX(${dragX}px)`;
    if (overlay) overlay.style.opacity = String(Math.max(0.15, 1 - dragX / drawer.offsetWidth));
  }

  function end() {
    if (!dragging) return;
    dragging = false;
    drawer.classList.remove("is-dragging");
    drawer.style.transform = "";
    if (overlay) overlay.style.opacity = "";

    if (axis === "x" && dragX > CLOSE_THRESHOLD) closeCartDrawer();
    dragX = 0;
    axis = null;
  }

  drawer.addEventListener("touchstart", start, { passive: true });
  drawer.addEventListener("touchmove", move, { passive: false });
  drawer.addEventListener("touchend", end);
  drawer.addEventListener("touchcancel", end);

  drawer.addEventListener("mousedown", start);
  document.addEventListener("mousemove", move);
  document.addEventListener("mouseup", end);
}


/* ---------- Toast ----------
   toast(message) for a plain notice, or
   toast(message, { actionLabel, onAction, duration }) for an
   undo-style action (e.g. restoring a removed item). */

let toastTimer = null;

function toast(message, options = {}) {
  const { actionLabel, onAction, duration = actionLabel ? 4200 : 2200 } = options;

  let el = document.querySelector(".toast");
  if (!el) {
    el = document.createElement("div");
    el.className = "toast";
    document.body.appendChild(el);
  }

  el.innerHTML = `
    <span class="toast__message">${message}</span>
    ${actionLabel ? `<button type="button" class="toast__action">${actionLabel}</button>` : ""}
  `;

  if (actionLabel && typeof onAction === "function") {
    el.querySelector(".toast__action").addEventListener(
      "click",
      () => {
        onAction();
        hideToast(el);
      },
      { once: true }
    );
  }

  el.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => hideToast(el), duration);
}

function hideToast(el) {
  el.classList.remove("is-visible");
}

/* ---------- Event wiring (delegated — works identically on every page) ---------- */

document.addEventListener("click", (e) => {
  const toggle = e.target.closest("[data-cart-toggle]");
  if (toggle) return openCartDrawer();

  const close = e.target.closest("[data-cart-close]");
  if (close) return closeCartDrawer();

  const overlay = e.target.closest("[data-cart-overlay]");
  if (overlay) return closeCartDrawer();

  const inc = e.target.closest("[data-qty-increase]");
  if (inc) {
    const id = Number(inc.dataset.qtyIncrease);
    const line = cartLines().find((l) => l.id === id);
    return updateQty(id, (line ? line.qty : 0) + 1);
  }

  const dec = e.target.closest("[data-qty-decrease]");
  if (dec) {
    const id = Number(dec.dataset.qtyDecrease);
    const line = cartLines().find((l) => l.id === id);
    return updateQty(id, (line ? line.qty : 1) - 1);
  }

  const remove = e.target.closest("[data-remove]");
  if (remove) return removeFromCart(Number(remove.dataset.remove));

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
  initDrawerSwipe();
});
