import React from "react";
import { UseFormRegister, Control, useWatch, UseFormSetValue, FieldErrors } from "react-hook-form";
import { Package, DollarSign, BarChart, ImageIcon, Layers, Wand2 } from "lucide-react";
import { ProductFormData, ProductConfig } from "@/types/product-types";
import { Input, Textarea } from "@/ui/Input";
import { Button } from "@/ui/Button";
import { Card, CardHeader, CardContent, Switch } from "@/ui/Misc";
import { Select } from "@/ui/Select";
import { ImageUploader } from "./ImageUploader";
import { VariantBuilder } from "./VariantBuilder";

interface SectionProps {
  register: UseFormRegister<ProductFormData>;
  control: Control<ProductFormData>;
  setValue: UseFormSetValue<ProductFormData>;
  errors: FieldErrors<ProductFormData>;
  config?: ProductConfig;
}

export const BasicInfoSection = ({ register, control, setValue, errors, config, onFillDummy }: SectionProps & { onFillDummy: () => void }) => {
  const category = useWatch({ control, name: "category" });
  const status = useWatch({ control, name: "status" });

  return (
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
            onClick={onFillDummy}
            className="text-[10px] font-black uppercase tracking-widest h-8 px-3 rounded-lg border-dashed border-2 hover:bg-[hsl(var(--primary)/0.05)] hover:text-[hsl(var(--primary))] transition-all"
          >
            <Wand2 className="h-3 w-3 mr-2" />
            Fill Dummy
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <Input 
          label="Product Name"
          {...register("name")} 
          placeholder="e.g. Premium Wireless Headphones" 
          error={errors.name?.message}
          className="h-12 text-lg font-medium"
        />

        <Textarea 
          label="Description"
          {...register("description")} 
          rows={5}
          placeholder="Describe the benefits and features of your product..."
          className="bg-white dark:bg-black/20"
        />

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold">Category</label>
            <Select 
              options={config?.categories || [
                { label: "Electronics", value: "electronics" },
                { label: "Clothing", value: "clothing" },
                { label: "Home & Garden", value: "home" },
              ]}
              value={category}
              onChange={(val) => setValue("category", val as string, { shouldDirty: true })}
              placeholder="Select category"
            />
            {errors.category && <p className="text-[hsl(var(--destructive))] text-[10px] uppercase font-black">{errors.category.message}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold">Status</label>
            <div className="flex items-center gap-4 h-11 px-4 rounded-xl border border-[hsl(var(--border))] bg-white dark:bg-black/20">
              <Switch 
                checked={status === "active"}
                onCheckedChange={(checked) => setValue("status", checked ? "active" : "draft", { shouldDirty: true })}
              />
              <span className="text-sm font-medium">{status === "active" ? "Active" : "Draft"}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const PricingInventorySection = ({ register, control, errors }: SectionProps) => {
  const variants = useWatch({ control, name: "variants" });

  return (
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
          <Input 
            label="Base Price ($)"
            type="number" 
            step="0.01" 
            {...register("price", { valueAsNumber: true })} 
            error={errors.price?.message}
            className="h-11"
          />
          <Input 
            label="Discount (%)"
            type="number" 
            {...register("discount", { valueAsNumber: true })} 
            error={errors.discount?.message}
            className="h-11"
          />
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
            <Input 
              label="Stock Quantity"
              type="number" 
              {...register("stock", { valueAsNumber: true })} 
              className="h-11"
              disabled={variants.length > 0}
              error={errors.stock?.message}
            />
            {variants.length > 0 && (
              <p className="text-[10px] text-amber-600 font-bold uppercase tracking-widest">
                Stock is managed via variants
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const MediaSection = ({ control, setValue, config }: SectionProps) => {
  const media = useWatch({ control, name: "media" });

  return (
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
          images={media} 
          onChange={(m) => setValue("media", m, { shouldDirty: true })}
          uploadEndpoint={config?.uploadEndpoint}
        />
      </CardContent>
    </Card>
  );
};

export const VariantSection = ({ control, setValue }: SectionProps) => {
  const variants = useWatch({ control, name: "variants" });
  const price = useWatch({ control, name: "price" });

  return (
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
          variants={variants} 
          onChange={(v) => setValue("variants", v, { shouldDirty: true })}
          basePrice={price}
        />
      </CardContent>
    </Card>
  );
};
