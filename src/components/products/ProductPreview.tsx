import React from "react";
import { ProductFormData } from "@/types/product-types";
import { Card } from "@/ui/Misc";
import { Badge } from "@/ui/Misc";
import { ShoppingCart, Heart, Share2, Info } from "lucide-react";

interface ProductPreviewProps {
  data: ProductFormData;
}

export function ProductPreview({ data }: ProductPreviewProps) {
  const mainImage = data.media.find(m => m.isMain)?.url || data.media[0]?.url;
  const price = data.price || 0;
  const discount = data.discount || 0;
  const discountedPrice = discount > 0 ? price * (1 - discount / 100) : price;

  return (
    <div className="sticky top-20">
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="text-sm font-black tracking-widest uppercase text-[hsl(var(--muted-foreground))] flex items-center gap-2">
          Live Preview
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </h3>
        <Badge variant="outline" className="rounded-md border-emerald-500/20 text-emerald-600 bg-emerald-500/5">
          {data.status === 'active' ? 'Published' : 'Draft'}
        </Badge>
      </div>

      <Card className="overflow-hidden border-none shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] bg-white dark:bg-[hsl(var(--card))] group">
        <div className="relative aspect-square overflow-hidden bg-[hsl(var(--muted)/0.3)]">
          {mainImage ? (
            <img 
              src={mainImage} 
              alt={data.name} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-[hsl(var(--muted-foreground)/0.5)]">
              <div className="h-16 w-16 rounded-full border-4 border-dashed border-[hsl(var(--muted))] mb-4 flex items-center justify-center">
                <ShoppingCart className="h-8 w-8 opacity-20" />
              </div>
              <p className="text-xs font-bold uppercase tracking-tighter">No image uploaded</p>
            </div>
          )}
          
          {discount > 0 && (
            <div className="absolute top-4 left-4">
              <Badge className="bg-red-500 text-white border-none px-3 py-1 text-sm font-black italic shadow-lg">
                -{discount}%
              </Badge>
            </div>
          )}

          <div className="absolute top-4 right-4 flex flex-col gap-2 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
            <button className="h-9 w-9 rounded-full bg-white/90 dark:bg-black/80 backdrop-blur shadow-xl flex items-center justify-center text-[hsl(var(--foreground))] hover:bg-[hsl(var(--primary))] hover:text-white transition-colors">
              <Heart className="h-4 w-4" />
            </button>
            <button className="h-9 w-9 rounded-full bg-white/90 dark:bg-black/80 backdrop-blur shadow-xl flex items-center justify-center text-[hsl(var(--foreground))] hover:bg-[hsl(var(--primary))] hover:text-white transition-colors">
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-[hsl(var(--primary))] opacity-70">
              {data.category || "Uncategorized"}
            </p>
            <h2 className="text-xl font-black tracking-tight leading-tight line-clamp-2">
              {data.name || "Product Name"}
            </h2>
          </div>

          <div className="flex items-end gap-3">
            <div className="text-2xl font-black tracking-tighter">
              ${discountedPrice.toFixed(2)}
            </div>
            {discount > 0 && (
              <div className="text-sm text-[hsl(var(--muted-foreground))] line-through mb-1 opacity-50">
                ${price.toFixed(2)}
              </div>
            )}
          </div>

          <p className="text-xs text-[hsl(var(--muted-foreground))] line-clamp-3 leading-relaxed min-h-[3em]">
            {data.description || "Enter a description to see it here. High quality product details will help customers understand what they are buying."}
          </p>

          <div className="pt-2 flex gap-2">
            <button className="flex-1 bg-[hsl(var(--foreground))] text-[hsl(var(--background))] h-11 rounded-xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all">
              Add to Cart
            </button>
            <button className="h-11 w-11 rounded-xl border border-[hsl(var(--border))] flex items-center justify-center hover:bg-[hsl(var(--muted)/0.5)] transition-colors">
              <Info className="h-5 w-5" />
            </button>
          </div>
        </div>
      </Card>

      <div className="mt-8 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 bg-[hsl(var(--primary)/0.03)] border-[hsl(var(--primary)/0.1)]">
            <p className="text-[10px] font-black uppercase text-[hsl(var(--primary))] mb-1 opacity-70">Variants</p>
            <p className="text-lg font-black">{data.variants.length}</p>
          </Card>
          <Card className="p-4 bg-[hsl(var(--primary)/0.03)] border-[hsl(var(--primary)/0.1)]">
            <p className="text-[10px] font-black uppercase text-[hsl(var(--primary))] mb-1 opacity-70">Stock</p>
            <p className="text-lg font-black">{data.variants.reduce((acc, v) => acc + (v.stock || 0), 0) || data.stock || 0}</p>
          </Card>
        </div>

        {data.variants.length > 0 && (
          <Card className="p-4 border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.1)]">
            <p className="text-[10px] font-black uppercase text-[hsl(var(--muted-foreground))] mb-3 tracking-widest">Available Options</p>
            <div className="flex flex-wrap gap-2">
              {Array.from(new Set(data.variants.flatMap(v => Object.values(v.options)))).map(opt => (
                <span key={opt} className="px-2 py-1 bg-white dark:bg-black/20 border border-[hsl(var(--border))] rounded-md text-[10px] font-bold">
                  {opt}
                </span>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
