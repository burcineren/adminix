import React, { useEffect, useCallback } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Package, 
  Tag, 
  DollarSign, 
  Layers, 
  Image as ImageIcon, 
  BarChart, 
  Search,
  Save,
  Rocket,
  Clock,
  History,
  Wand2
} from "lucide-react";
import { 
  ProductFormSchema, 
  ProductFormData, 
  ProductConfig 
} from "@/types/product-types";
import { Input } from "@/ui/Input";
import { Button } from "@/ui/Button";
import { Card, CardHeader, CardContent, Separator, Badge, Switch } from "@/ui/Misc";
import { ImageUploader } from "./ImageUploader";
import { VariantBuilder } from "./VariantBuilder";
import { Select } from "@/ui/Select";
import { cn } from "@/utils/cn";
import { toast } from "sonner";
import { debounce } from "lodash-es";

interface ProductFormProps {
  config?: ProductConfig;
  onSubmit: (data: ProductFormData) => void;
  isLoading?: boolean;
  onDataChange?: (data: ProductFormData) => void;
}

export function ProductForm({ config, onSubmit, isLoading, onDataChange }: ProductFormProps) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty }
  } = useForm<ProductFormData>({
    resolver: zodResolver(ProductFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      discount: 0,
      category: "",
      stock: 0,
      status: "draft",
      media: [],
      variants: [],
      tags: [],
    }
  });

  const formData = useWatch({ control });
  const lastSyncedData = React.useRef<string>("");

  // Sync data with preview
  useEffect(() => {
    const dataStr = JSON.stringify(formData);
    if (dataStr !== lastSyncedData.current) {
      lastSyncedData.current = dataStr;
      const timeout = setTimeout(() => {
        onDataChange?.(formData as ProductFormData);
      }, 0);
      return () => clearTimeout(timeout);
    }
  }, [formData, onDataChange]);

  const fillDummyData = () => {
    const dummy = {
      name: "UltraVision Pro Z1",
      description: "Experience clarity like never before with the UltraVision Pro Z1. Featuring state-of-the-art noise cancellation and 40-hour battery life, these headphones are designed for the modern audiophile.",
      price: 299.99,
      discount: 15,
      category: "electronics",
      stock: 120,
      status: "active" as const,
      media: [
        { id: "1", url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80", type: "image" as const, isMain: true },
        { id: "2", url: "https://images.unsplash.com/photo-1546435770-a3e4265da3af?w=800&q=80", type: "image" as const },
      ],
      variants: [
        { id: "v1", name: "Midnight Black", options: { Color: "Black" }, price: 299.99, stock: 50, sku: "UV-BLK-01" },
        { id: "v2", name: "Arctic White", options: { Color: "White" }, price: 299.99, stock: 70, sku: "UV-WHT-01" },
      ],
      tags: ["wireless", "audio", "premium"],
    };
    reset(dummy);
    toast.success("Dummy data loaded!");
  };

  // Restore from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("adminix_product_draft");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        reset(parsed);
        toast.info("Restored draft from previous session", {
          icon: <History className="h-4 w-4" />,
          action: {
            label: "Clear",
            onClick: () => {
              localStorage.removeItem("adminix_product_draft");
              reset();
            }
          }
        });
      } catch (e) {
        console.error("Failed to restore draft", e);
      }
    }
  }, [reset]);

  // Auto-save logic
  const debouncedSave = useCallback(
    debounce((data: ProductFormData) => {
      localStorage.setItem("adminix_product_draft", JSON.stringify(data));
    }, 2000),
    []
  );

  useEffect(() => {
    if (isDirty) {
      debouncedSave(formData);
    }
  }, [formData, isDirty, debouncedSave]);

  const onFormSubmit = (data: ProductFormData) => {
    onSubmit(data);
    localStorage.removeItem("adminix_product_draft");
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8 pb-32">
      {/* Basic Info */}
      <Card className="border-none shadow-sm overflow-hidden bg-[hsl(var(--card))]">
        <CardHeader className="bg-[hsl(var(--muted)/0.2)] border-b border-[hsl(var(--border))] flex flex-row items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[hsl(var(--primary)/0.1)] flex items-center justify-center text-[hsl(var(--primary))]">
            <Package className="h-5 w-5" />
          </div>
          <div className="flex items-center justify-between w-full">
            <div>
              <h3 className="text-lg font-black tracking-tight">Basic Information</h3>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">Title and description of your product</p>
            </div>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={fillDummyData}
              className="text-[10px] font-black uppercase tracking-widest h-8 px-3 rounded-lg border-dashed border-2 hover:bg-[hsl(var(--primary)/0.05)] hover:text-[hsl(var(--primary))] transition-all"
            >
              <Wand2 className="h-3 w-3 mr-2" />
              Fill Dummy
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold flex items-center gap-2">
              Product Name
              {errors.name && <span className="text-[hsl(var(--destructive))] text-[10px] uppercase font-black tracking-widest">{errors.name.message}</span>}
            </label>
            <Input 
              {...register("name")} 
              placeholder="e.g. Premium Wireless Headphones" 
              className={cn("h-12 text-lg font-medium", errors.name && "border-[hsl(var(--destructive))] ring-[hsl(var(--destructive)/0.2)]")}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold">Description</label>
            <textarea 
              {...register("description")} 
              rows={5}
              placeholder="Describe the benefits and features of your product..."
              className="w-full rounded-xl border border-[hsl(var(--border))] bg-white dark:bg-black/20 p-4 text-sm focus:ring-2 focus:ring-[hsl(var(--primary)/0.2)] focus:border-[hsl(var(--primary))] outline-none transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold">Category</label>
              <Select 
                options={config?.categories || [
                  { label: "Electronics", value: "electronics" },
                  { label: "Clothing", value: "clothing" },
                  { label: "Home & Garden", value: "home" },
                ]}
                value={formData.category}
                onChange={(val) => setValue("category", val as string, { shouldDirty: true })}
                placeholder="Select category"
              />
              {errors.category && <p className="text-[hsl(var(--destructive))] text-[10px] uppercase font-black">{errors.category.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold">Status</label>
              <div className="flex items-center gap-4 h-11 px-4 rounded-xl border border-[hsl(var(--border))] bg-white dark:bg-black/20">
                <Switch 
                  checked={formData.status === "active"}
                  onCheckedChange={(checked) => setValue("status", checked ? "active" : "draft", { shouldDirty: true })}
                />
                <span className="text-sm font-medium">{formData.status === "active" ? "Active" : "Draft"}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing & Inventory */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="border-none shadow-sm overflow-hidden bg-[hsl(var(--card))]">
          <CardHeader className="bg-[hsl(var(--muted)/0.2)] border-b border-[hsl(var(--border))] flex flex-row items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">Pricing</h3>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">Set your price and discounts</p>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold">Base Price ($)</label>
              <Input 
                type="number" 
                step="0.01" 
                {...register("price", { valueAsNumber: true })} 
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold">Discount (%)</label>
              <Input 
                type="number" 
                {...register("discount", { valueAsNumber: true })} 
                className="h-11"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm overflow-hidden bg-[hsl(var(--card))]">
          <CardHeader className="bg-[hsl(var(--muted)/0.2)] border-b border-[hsl(var(--border))] flex flex-row items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
              <BarChart className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">Inventory</h3>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">Manage stock levels</p>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold">Stock Quantity</label>
              <Input 
                type="number" 
                {...register("stock", { valueAsNumber: true })} 
                className="h-11"
                disabled={formData.variants.length > 0}
              />
              {formData.variants.length > 0 && (
                <p className="text-[10px] text-amber-600 font-bold uppercase tracking-widest">
                  Stock is managed via variants
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Media */}
      <Card className="border-none shadow-sm overflow-hidden bg-[hsl(var(--card))]">
        <CardHeader className="bg-[hsl(var(--muted)/0.2)] border-b border-[hsl(var(--border))] flex flex-row items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600">
            <ImageIcon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-black tracking-tight">Product Media</h3>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">Upload images and videos</p>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <ImageUploader 
            images={formData.media} 
            onChange={(media) => setValue("media", media, { shouldDirty: true })}
            uploadEndpoint={config?.uploadEndpoint}
          />
        </CardContent>
      </Card>

      {/* Variants */}
      <Card className="border-none shadow-sm overflow-hidden bg-[hsl(var(--card))]">
        <CardHeader className="bg-[hsl(var(--muted)/0.2)] border-b border-[hsl(var(--border))] flex flex-row items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-black tracking-tight">Product Variants</h3>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">Sizes, colors, and more</p>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <VariantBuilder 
            variants={formData.variants} 
            onChange={(variants) => setValue("variants", variants, { shouldDirty: true })}
            basePrice={formData.price}
          />
        </CardContent>
      </Card>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 flex justify-center pointer-events-none">
        <div className="max-w-5xl w-full bg-white/80 dark:bg-black/80 backdrop-blur-xl border border-[hsl(var(--border))] rounded-2xl shadow-2xl p-4 flex items-center justify-between pointer-events-auto animate-slide-up">
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-[hsl(var(--muted-foreground))]">Status</span>
              <div className="flex items-center gap-2">
                <div className={cn("h-2 w-2 rounded-full", formData.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500')} />
                <span className="text-sm font-bold capitalize">{formData.status}</span>
              </div>
            </div>
            <Separator className="h-8 w-px mx-2 hidden sm:block" />
            <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
              <Clock className="h-3 w-3" />
              {isDirty ? "Unsaved changes" : "All changes saved"}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => reset()}
              className="rounded-xl font-bold"
            >
              Discard
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.9)] text-white rounded-xl font-black px-8 shadow-lg shadow-[hsl(var(--primary)/0.3)] transition-all active:scale-95"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Rocket className="h-4 w-4" />
                  Publish Product
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
