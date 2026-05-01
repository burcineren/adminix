import { ProductFormData } from "@/types/product-types";

/**
 * Generates Cartesian product of arrays
 */
export function cartesian(...args: unknown[][]) {
  return args.reduce((a, b) => (a as unknown[][]).flatMap(d => (b as unknown[][]).map(e => [d, e].flat())));
}

/**
 * Generates a random ID
 */
export function generateId() {
  return Math.random().toString(36).substring(7);
}

/**
 * Returns dummy product data for testing
 */
export function getDummyProductData(): ProductFormData {
  return {
    name: "UltraVision Pro Z1",
    description: "Experience clarity like never before with the UltraVision Pro Z1. Featuring state-of-the-art noise cancellation and 40-hour battery life, these headphones are designed for the modern audiophile. Crafted from premium materials for all-day comfort.",
    price: 299.99,
    discount: 15,
    category: "electronics",
    stock: 120,
    status: "active",
    media: [
      { id: "1", url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80", type: "image", isMain: true },
      { id: "2", url: "https://images.unsplash.com/photo-1546435770-a3e4265da3af?w=800&q=80", type: "image" },
      { id: "3", url: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&q=80", type: "image" },
    ],
    variants: [
      { id: "v1", name: "Midnight Black", options: { Color: "Black" }, price: 299.99, stock: 50, sku: "UV-BLK-01" },
      { id: "v2", name: "Arctic White", options: { Color: "White" }, price: 299.99, stock: 70, sku: "UV-WHT-01" },
    ],
    tags: ["wireless", "audio", "premium", "noise-cancelling"],
  };
}
