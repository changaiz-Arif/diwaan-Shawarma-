/* ============================================================
   DEWAAN SHAWARMA — PRODUCT DATA
   This mirrors the restaurant's real printed menu card exactly:
   names, prices and details. Edit prices/descriptions/images
   here. Each product's `image` path is mapped to a real uploaded
   photo — do not swap these unless replacing the actual file.
   ============================================================ */

const CURRENCY = "Rs.";

const CATEGORIES = [
  { id: "popular", label: "Popular" },
  { id: "platters", label: "Shawarma Platters" },
  { id: "specials", label: "Specials & Sides" },
  { id: "fries", label: "Fries" },
  { id: "drinks", label: "Beverages" }
];

const products = [
  /* ---------- Shawarma Platters ---------- */
  {
    id: 1,
    name: "Single Shawarma",
    description: "1 Shawarma, 1 Cold Drink.",
    price: 999,
    image: "images/products/chicken-shawarma-rolls.jpg",
    category: "platters",
    popular: false
  },
  {
    id: 2,
    name: "Friendly Shawarma",
    description: "Shawarma Platter, 2 Cold Drinks.",
    price: 1999,
    image: "images/products/friendly-shawarma-platter.jpg",
    category: "platters",
    popular: true
  },
  {
    id: 3,
    name: "Family Shawarma",
    description: "Shawarma Platter, 4 Cold Drinks.",
    price: 3499,
    image: "images/products/family-shawarma-feast.jpg",
    category: "platters",
    popular: true
  },
  {
    id: 4,
    name: "Signature Chicken Shawarma",
    description: "Chicken Shawarma Wrap, Garlic Sauce, Fries.",
    price: 499,
    image: "images/products/classic-chicken-shawarma-wrap.jpg",
    category: "platters",
    popular: true
  },

  /* ---------- Specials & Sides ---------- */
  {
    id: 5,
    name: "Ayshe Bulbul",
    description: "Soft and cheesy Arabic bread baked to perfection.",
    price: 699,
    image: "images/products/cheese-bread.jpg",
    category: "specials",
    popular: true
  },
  {
    id: 6,
    name: "Hummus",
    description: "Creamy hummus topped with olive oil and chickpeas.",
    price: 799,
    image: "images/products/hummus.jpg",
    category: "specials",
    popular: false
  },
  {
    id: 7,
    name: "Arabic Wrap",
    description: "Grilled chicken wrap with fries, garlic sauce and pickles.",
    price: 749,
    image: "images/products/shawarma-mix-plate.jpg",
    category: "specials",
    popular: true
  },
  {
    id: 8,
    name: "Fattoush Salad",
    description: "Fresh veggies, herbs and crispy pita with lemon dressing.",
    price: 749,
    image: "images/products/fattoush-salad.jpg",
    category: "specials",
    popular: false
  },

  /* ---------- Fries ---------- */
  {
    id: 9,
    name: "Fries",
    description: "Crispy golden fries served with sauces.",
    price: 299,
    image: "images/products/classic-fries.jpg",
    category: "fries",
    popular: false
  },
  {
    id: 10,
    name: "Full Fries",
    description: "Loaded fries with extra flavor & crunch.",
    price: 749,
    image: "images/products/loaded-shawarma-fries.jpg",
    category: "fries",
    popular: true
  },

  /* ---------- Beverages ---------- */
  {
    id: 11,
    name: "Peach Ice Tea",
    description: "Refreshing peach flavored iced tea.",
    price: 249,
    image: "images/products/peach-iced-tea.jpg",
    category: "drinks",
    popular: false
  },
  {
    id: 12,
    name: "Cold Drink",
    description: "Chilled soft drink with ice.",
    price: 120,
    image: "images/products/coca-cola.jpg",
    category: "drinks",
    popular: false
  },
  {
    id: 13,
    name: "Water",
    description: "Pure & refreshing mineral water.",
    price: 60,
    image: "images/products/mint-water.jpg",
    category: "drinks",
    popular: false
  }
];

/* Helper lookups used across pages */
function getProductById(id) {
  return products.find((p) => p.id === Number(id));
}

function getProductsByCategory(categoryId) {
  if (categoryId === "popular") return products.filter((p) => p.popular);
  if (!categoryId || categoryId === "all") return products;
  return products.filter((p) => p.category === categoryId);
}

function formatPrice(amount) {
  return `${CURRENCY} ${amount.toLocaleString("en-PK")}`;
}
