# Dewaan Shawarma — Website

A fully static, dependency-free restaurant ordering website. Built with
plain **HTML5, CSS3 and vanilla JavaScript only** — no frameworks, no
build step, no paid libraries.

## Getting started

Just open `index.html` in a browser, or serve the folder with any static
file server, e.g.:

```
npx serve .
```

or

```
python3 -m http.server 8080
```

## Design language

The site takes its identity from the night-market shawarma stall itself:
a charcoal-dark palette with ember/saffron accents, copper platter tones,
and a **cart drawer styled as an "order chit"** (a paper receipt with a
perforated edge) — because that's exactly what you'd get handed at the
counter.

- **Display type:** Fraunces (serif, warm, characterful)
- **Body type:** Work Sans (clean, orderly)
- **Utility/price type:** JetBrains Mono (receipt / ticket feel)

## Project structure

```
DEWAAN-SHAWARMA/
├── index.html          Home page (hero, featured items, story, gallery)
├── menu.html            Full menu with category filters + search
├── about.html            Brand story, stats, team
├── contact.html           Contact details, map, message form
├── reviews.html           Ratings summary + review submission
│
├── css/
│   ├── style.css          Design tokens + all component/section styles
│   ├── animations.css     Keyframes, scroll reveals, reduced-motion
│   └── responsive.css     Breakpoints (1080 / 900 / 720 / 460px)
│
├── js/
│   ├── products.js        Product + category data (edit here to add items)
│   ├── cart.js             Cart state, localStorage persistence, drawer UI
│   ├── menu.js              Menu page filtering + search
│   ├── checkout.js          Order-chit form validation + WhatsApp message
│   └── main.js               Nav, scroll reveal, featured grid, contact form
│
├── images/
│   ├── products/            Real product photos (see mapping below)
│   ├── banners/              Hero / atmosphere photo
│   ├── gallery/               (reserved for future gallery photos)
│   └── logo/                    (reserved — add a logo file here if you have one)
│
└── README.md
```

## Editing the menu

Everything about a product lives in **`js/products.js`** — name,
description, price, category, and image path. To add a new item, copy an
existing object in the `products` array, give it a unique `id`, and drop
its photo into `images/products/`.

```js
{
  id: 14,
  name: "New Item",
  description: "Short, appetising description.",
  price: 500,
  image: "images/products/new-item.jpg",
  category: "sides",   // one of: wraps, platters, sides, salads, drinks
  popular: false
}
```

## Uploaded photo → product mapping

These are the real uploaded photos, matched to their menu item — do not
swap them for stock/AI images:

| Product | File |
|---|---|
| Classic Chicken Shawarma Wrap | `classic-chicken-shawarma-wrap.jpg` |
| Shawarma Bite Rolls (6 pcs) | `chicken-shawarma-rolls.jpg` |
| Family Shawarma Feast | `family-shawarma-feast.jpg` |
| Friendly Shawarma Platter | `friendly-shawarma-platter.jpg` |
| Shawarma Mix Plate | `shawarma-mix-plate.jpg` |
| Loaded Shawarma Fries | `loaded-shawarma-fries.jpg` |
| Classic Spiced Fries | `classic-fries.jpg` |
| Hummus | `hummus.jpg` |
| Cheese-Stuffed Bread | `cheese-bread.jpg` |
| Fattoush Salad | `fattoush-salad.jpg` |
| Fresh Mint Water | `mint-water.jpg` |
| Coca-Cola | `coca-cola.jpg` |
| Peach Iced Tea | `peach-iced-tea.jpg` |
| Hero / market banner | `banners/hero-market.jpg` |

## Cart & checkout

- Cart state lives in `localStorage` under the key `dewaan_cart_v1`, so it
  survives page navigation and browser refreshes.
- The cart drawer ("order chit") is duplicated in the markup of every
  page so it's available everywhere — `js/cart.js` renders into it via
  `data-*` attributes, so its logic only needs to be written once.
- Submitting the checkout form builds a formatted order message and opens
  `https://wa.me/923058033821?text=...` in a new tab — the customer
  still has to press Send inside WhatsApp themselves (this is how the
  WhatsApp click-to-chat API works; a message cannot be sent silently on
  a customer's behalf).

## WhatsApp number

Set in **two places** — keep them in sync if you ever change the number:
- `js/checkout.js` → `WHATSAPP_NUMBER`
- Footer / contact links across each HTML page (search for
  `wa.me/923058033821` and `tel:+923058033821`)

## Notes

- All images were compressed to optimized JPEGs (max dimension 1200px,
  quality 82) to keep the site fast.
- Fonts load from Google Fonts via `@import` in `css/style.css` — an
  internet connection is required for the intended typography; the site
  falls back to system serif/sans-serif fonts otherwise.
- No backend: the "Place Order" and "Submit Review" flows both hand off
  to WhatsApp rather than storing anything server-side.
