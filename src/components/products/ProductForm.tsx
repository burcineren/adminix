import { useEffect, useMemo, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Rocket, Clock, History } from "lucide-react";
import { 
  ProductFormSchema, 
  ProductFormData, 
  ProductConfig 
} from "@/types/product-types";
import { Button } from "@/ui/Button";
import { Separator } from "@/ui/Misc";
import { cn } from "@/utils/cn";
import { toast } from "sonner";
import { debounce } from "lodash-es";
import { getDummyProductData } from "@/utils/product-utils";
import { 
  BasicInfoSection, 
  PricingInventorySection, 
  MediaSection, 
  VariantSection 
} from "./FormSections";

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
  const lastSyncedData = useRef<string>("");

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
    const dummy = getDummyProductData();
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
  const debouncedSave = useMemo(
    () => debounce((data: ProductFormData) => {
      localStorage.setItem("adminix_product_draft", JSON.stringify(data));
    }, 2000),
    []
  );

  useEffect(() => {
    if (isDirty) {
      debouncedSave(formData as ProductFormData);
    }
  }, [formData, isDirty, debouncedSave]);

  const onFormSubmit = (data: ProductFormData) => {
    onSubmit(data);
    localStorage.removeItem("adminix_product_draft");
  };

  const sectionProps = { register, control, setValue, errors, config };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8 pb-32">
      <BasicInfoSection {...sectionProps} onFillDummy={fillDummyData} />
      
      <PricingInventorySection {...sectionProps} />

      <MediaSection {...sectionProps} />

      <VariantSection {...sectionProps} />

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
