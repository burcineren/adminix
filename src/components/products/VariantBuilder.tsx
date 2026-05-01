import React, { useState, useEffect } from "react";
import { Plus, X, Trash2, RefreshCw } from "lucide-react";
import { Button } from "@/ui/Button";
import { Input } from "@/ui/Input";
import { Card } from "@/ui/Misc";
import { ProductVariant } from "@/types/product-types";
import { cn } from "@/utils/cn";

interface VariantOption {
  id: string;
  name: string;
  values: string[];
}

interface VariantBuilderProps {
  variants: ProductVariant[];
  onChange: (variants: ProductVariant[]) => void;
  basePrice: number;
}

export function VariantBuilder({ variants, onChange, basePrice }: VariantBuilderProps) {
  const [options, setOptions] = useState<VariantOption[]>([]);
  const [inputValue, setInputValue] = useState<Record<string, string>>({});

  const addOption = () => {
    setOptions([...options, { id: Math.random().toString(36).substring(7), name: "", values: [] }]);
  };

  const removeOption = (id: string) => {
    setOptions(options.filter((o) => o.id !== id));
  };

  const updateOptionName = (id: string, name: string) => {
    setOptions(options.map((o) => (o.id === id ? { ...o, name } : o)));
  };

  const addValue = (optionId: string) => {
    const val = inputValue[optionId]?.trim();
    if (!val) return;
    
    setOptions(options.map((o) => {
      if (o.id === optionId && !o.values.includes(val)) {
        return { ...o, values: [...o.values, val] };
      }
      return o;
    }));
    setInputValue({ ...inputValue, [optionId]: "" });
  };

  const removeValue = (optionId: string, value: string) => {
    setOptions(options.map((o) => (o.id === optionId ? { ...o, values: o.values.filter((v) => v !== value) } : o)));
  };

  const generateVariants = () => {
    const validOptions = options.filter(o => o.name && o.values.length > 0);
    if (validOptions.length === 0) {
      onChange([]);
      return;
    }

    const cartesian = (...args: any[][]) => 
      args.reduce((a, b) => a.flatMap(d => b.map(e => [d, e].flat())));

    const combinations = cartesian(...validOptions.map(o => o.values));
    
    const newVariants: ProductVariant[] = (Array.isArray(combinations[0]) ? combinations : combinations.map(c => [c])).map((combo: string[]) => {
      const opts: Record<string, string> = {};
      validOptions.forEach((o, i) => {
        opts[o.name] = combo[i];
      });
      
      const name = combo.join(" / ");
      
      // Try to find existing variant to preserve price/stock
      const existing = variants.find(v => v.name === name);
      
      return {
        id: existing?.id || Math.random().toString(36).substring(7),
        name,
        options: opts,
        price: existing?.price ?? basePrice,
        stock: existing?.stock ?? 0,
        sku: existing?.sku || "",
      };
    });

    onChange(newVariants);
  };

  const updateVariant = (id: string, updates: Partial<ProductVariant>) => {
    onChange(variants.map(v => v.id === id ? { ...v, ...updates } : v));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {options.map((option) => (
          <Card key={option.id} className="p-4 bg-[hsl(var(--muted)/0.2)] border-dashed">
            <div className="flex items-start gap-4">
              <div className="flex-1 space-y-3">
                <Input
                  placeholder="Option name (e.g. Size, Color)"
                  value={option.name}
                  onChange={(e) => updateOptionName(option.id, e.target.value)}
                  className="bg-white dark:bg-black/20"
                />
                
                <div className="flex flex-wrap gap-2">
                  {option.values.map((val) => (
                    <span 
                      key={val} 
                      className="inline-flex items-center gap-1 px-2 py-1 bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] text-xs font-bold rounded-md"
                    >
                      {val}
                      <button onClick={() => removeValue(option.id, val)}>
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add value..."
                      value={inputValue[option.id] || ""}
                      onChange={(e) => setInputValue({ ...inputValue, [option.id]: e.target.value })}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addValue(option.id))}
                      className="h-7 text-xs w-24"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => addValue(option.id)}
                      className="h-7 w-7 p-0"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
              <Button 
                type="button" 
                variant="destructive" 
                size="sm" 
                onClick={() => removeOption(option.id)}
                className="h-9 w-9 p-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
        
        <Button 
          type="button" 
          variant="outline" 
          onClick={addOption}
          className="w-full border-dashed border-2 py-6 hover:bg-[hsl(var(--primary)/0.02)] hover:border-[hsl(var(--primary)/0.5)] group"
        >
          <Plus className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
          Add Option
        </Button>

        {options.length > 0 && (
          <Button 
            type="button" 
            onClick={generateVariants}
            className="w-full bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.9)] text-white shadow-lg shadow-[hsl(var(--primary)/0.2)]"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Generate Combinations
          </Button>
        )}
      </div>

      {variants.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-[hsl(var(--border))]">
          <table className="w-full text-sm">
            <thead className="bg-[hsl(var(--muted)/0.5)] border-b border-[hsl(var(--border))]">
              <tr>
                <th className="text-left p-3 font-bold">Variant</th>
                <th className="text-left p-3 font-bold w-32">Price ($)</th>
                <th className="text-left p-3 font-bold w-24">Stock</th>
                <th className="text-left p-3 font-bold">SKU</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border))]">
              {variants.map((variant) => (
                <tr key={variant.id} className="hover:bg-[hsl(var(--muted)/0.2)] transition-colors">
                  <td className="p-3 font-medium">{variant.name}</td>
                  <td className="p-3">
                    <Input
                      type="number"
                      value={variant.price}
                      onChange={(e) => updateVariant(variant.id, { price: Number(e.target.value) })}
                      className="h-8"
                    />
                  </td>
                  <td className="p-3">
                    <Input
                      type="number"
                      value={variant.stock}
                      onChange={(e) => updateVariant(variant.id, { stock: Number(e.target.value) })}
                      className="h-8"
                    />
                  </td>
                  <td className="p-3">
                    <Input
                      placeholder="SKU-123"
                      value={variant.sku}
                      onChange={(e) => updateVariant(variant.id, { sku: e.target.value })}
                      className="h-8"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
