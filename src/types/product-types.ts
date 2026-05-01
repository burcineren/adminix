import { z } from "zod";

export const ProductVariantSchema = z.object({
  id: z.string(),
  name: z.string(), // e.g. "S / Red"
  options: z.record(z.string(), z.string()), // { size: "S", color: "Red" }
  price: z.number().min(0),
  stock: z.number().int().min(0),
  sku: z.string().optional(),
});

export type ProductVariant = z.infer<typeof ProductVariantSchema>;

export const ProductMediaSchema = z.object({
  id: z.string(),
  url: z.string(),
  type: z.enum(["image", "video"]),
  isMain: z.boolean().optional(),
});

export type ProductMedia = z.infer<typeof ProductMediaSchema>;

export const ProductFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.number().min(0, "Price must be at least 0"),
  discount: z.number().min(0).max(100).optional(),
  category: z.string().min(1, "Category is required"),
  stock: z.number().int().min(0).optional(),
  status: z.enum(["active", "draft"]).default("draft"),
  media: z.array(ProductMediaSchema).default([]),
  variants: z.array(ProductVariantSchema).default([]),
  tags: z.array(z.string()).default([]),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

export type ProductFormData = z.infer<typeof ProductFormSchema>;

export interface ProductConfig {
  createEndpoint: string;
  uploadEndpoint: string;
  categories?: { label: string; value: string }[];
}
