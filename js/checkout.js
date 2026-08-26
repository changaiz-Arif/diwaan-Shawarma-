/* ============================================================
   DEWAAN SHAWARMA — CHECKOUT
   Validates the order-chit form and builds the WhatsApp message.
   ============================================================ */

const WHATSAPP_NUMBER = "923058033821"; /* +92 305 8033821, digits only for wa.me */
const RESTAURANT_PHONE = "+923058033821";

function toggleAddressField() {
  const delivery = document.querySelector('input[name="fulfilment"][value="delivery"]');
  const addressField = document.querySelector("[data-address-field]");
  if (!delivery || !addressField) return;
  addressField.classList.toggle("is-hidden", !delivery.checked);
  const addressInput = addressField.querySelector("textarea");
  if (addressInput) addressInput.required = delivery.checked;
}

function showFieldError(input, message) {
  const wrap = input.closest(".field");
  if (!wrap) return;
  wrap.classList.add("has-error");
  const errorEl = wrap.querySelector(".field__error");
  if (errorEl) errorEl.textContent = message;
}

function clearFieldError(input) {
  const wrap = input.closest(".field");
  if (!wrap) return;
  wrap.classList.remove("has-error");
  const errorEl = wrap.querySelector(".field__error");
  if (errorEl) errorEl.textContent = "";
}

function validateCheckoutForm(form) {
  let valid = true;
  const name = form.querySelector('[name="customerName"]');
  const phone = form.querySelector('[name="customerPhone"]');
  const fulfilment = form.querySelector('input[name="fulfilment"]:checked');
  const address = form.querySelector('[name="address"]');

  [name, phone].forEach(clearFieldError);
  if (address) clearFieldError(address);

  if (!name.value.trim()) {
    showFieldError(name, "Please tell us your name.");
    valid = false;
  }

  const phoneDigits = phone.value.replace(/[^\d]/g, "");
  if (phoneDigits.length < 10) {
    showFieldError(phone, "Enter a valid phone number.");
    valid = false;
  }

  if (fulfilment && fulfilment.value === "delivery" && address && !address.value.trim()) {
    showFieldError(address, "Add a delivery address so we can find you.");
    valid = false;
  }

  return valid;
}

function buildWhatsAppMessage(form) {
  const name = form.querySelector('[name="customerName"]').value.trim();
  const phone = form.querySelector('[name="customerPhone"]').value.trim();
  const fulfilment = form.querySelector('input[name="fulfilment"]:checked').value;
  const address = form.querySelector('[name="address"]')?.value.trim();
  const notes = form.querySelector('[name="notes"]')?.value.trim();

  const lines = cartLines();
  const subtotal = cartSubtotal();
  const delivery = fulfilment === "delivery" ? DELIVERY_FEE : 0;
  const total = subtotal + delivery;

  let msg = `*New Order — Dewaan Shawarma*\n\n`;
  msg += `*Name:* ${name}\n`;
  msg += `*Phone:* ${phone}\n`;
  msg += `*Order type:* ${fulfilment === "delivery" ? "Delivery" : "Pickup"}\n`;
  if (fulfilment === "delivery" && address) msg += `*Address:* ${address}\n`;
  msg += `\n*Items:*\n`;
  lines.forEach((line) => {
    msg += `• ${line.name} x${line.qty} — ${formatPrice(line.lineTotal)}\n`;
  });
  msg += `\n*Subtotal:* ${formatPrice(subtotal)}\n`;
  msg += `*Delivery:* ${delivery ? formatPrice(delivery) : "Free"}\n`;
  msg += `*Total:* ${formatPrice(total)}\n`;
  if (notes) msg += `\n*Notes:* ${notes}`;

  return msg;
}

document.addEventListener("submit", (e) => {
  const form = e.target.closest("[data-checkout-form]");
  if (!form) return;
  e.preventDefault();

  if (cartLines().length === 0) {
    toast("Add something to your order first");
    return;
  }

  if (!validateCheckoutForm(form)) {
    toast("Please check the highlighted fields");
    return;
  }

  const message = buildWhatsAppMessage(form);
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
  toast("Opening WhatsApp with your order…");
});

document.addEventListener("change", (e) => {
  if (e.target.name === "fulfilment") toggleAddressField();
});

document.addEventListener("DOMContentLoaded", toggleAddressField);
