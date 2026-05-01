import React, { useState } from "react";
import { ProductForm } from "./ProductForm";
import { ProductPreview } from "./ProductPreview";
import { ProductFormData, ProductConfig } from "@/types/product-types";
import { toast } from "sonner";
import { ChevronLeft, LayoutPanelLeft, Eye, Smartphone, Monitor, ShoppingBag } from "lucide-react";
import { Button } from "@/ui/Button";
import { Modal } from "@/ui/Modal";
import { useAdminStore } from "@/core/store";
import { cn } from "@/utils/cn";

interface ProductCreatePageProps {
  config?: ProductConfig;
}

export function ProductCreatePage({ config }: ProductCreatePageProps) {
  const [previewData, setPreviewData] = useState<ProductFormData>({
    name: "",
    description: "",
    price: 0,
    discount: 0,
    category: "",
    status: "draft",
    media: [],
    variants: [],
    tags: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  
  const setActiveResource = useAdminStore((s) => s.setActiveResource);

  const handleDataChange = React.useCallback((data: ProductFormData) => {
    setPreviewData(data);
  }, []);

  const handleSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      if (config?.createEndpoint) {
        const response = await fetch(config.createEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        
        if (!response.ok) throw new Error("Failed to save product");
        
        toast.success("Product created successfully!", {
          description: `${data.name} has been added to your catalog.`,
        });
        setActiveResource("products"); // Go back to list
      } else {
        // Mock success if no endpoint
        console.log("Submitting product data:", data);
        await new Promise(resolve => setTimeout(resolve, 1500));
        toast.success("Product created (Mock)!", {
          description: "No API endpoint configured, but the data is valid.",
        });
      }
    } catch (error) {
      toast.error("Error creating product", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      {/* Header */}
      <div className="sticky top-0 z-40 w-full bg-[hsl(var(--background)/0.8)] backdrop-blur-xl border-b border-[hsl(var(--border))] px-6 py-4">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setActiveResource("products")}
              className="h-9 w-9 p-0 rounded-lg hover:bg-[hsl(var(--muted)/0.5)]"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <LayoutPanelLeft className="h-4 w-4 text-[hsl(var(--primary))]" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))]">Product Management</span>
              </div>
              <h1 className="text-xl font-black tracking-tight">Create New Product</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col items-end px-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-[hsl(var(--muted-foreground))]">Workspace</span>
              <span className="text-xs font-bold">Adminix Storefront</span>
            </div>
            <div className="h-8 w-px bg-[hsl(var(--border))] hidden md:block" />
            <Button 
              variant="outline" 
              className="rounded-lg gap-2 font-bold hidden sm:flex border-[hsl(var(--primary)/0.2)] hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.05)] text-[hsl(var(--primary))] transition-all"
              onClick={() => setIsPreviewOpen(true)}
            >
              <Eye className="h-4 w-4" />
              Preview as Customer
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1600px] mx-auto p-6 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Form Side */}
          <div className="lg:col-span-7 xl:col-span-8">
            <ProductForm 
              config={config} 
              onSubmit={handleSubmit} 
              isLoading={isSubmitting}
              onDataChange={handleDataChange}
            />
          </div>

          {/* Preview Side */}
          <div className="lg:col-span-5 xl:col-span-4 hidden lg:block">
            <ProductPreview data={previewData} />
          </div>
        </div>
      </div>

      {/* Full Customer Preview Modal */}
      <Modal
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        title="Customer Experience Preview"
        description="See how your customers will see this product on your storefront."
        size="full"
      >
        <div className="flex flex-col h-full bg-[hsl(var(--muted)/0.1)] rounded-2xl overflow-hidden border border-[hsl(var(--border))]">
          {/* Preview Toolbar */}
          <div className="flex items-center justify-between p-4 bg-white dark:bg-black/40 border-b border-[hsl(var(--border))]">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]">
                <ShoppingBag className="h-4 w-4" />
              </div>
              <span className="text-sm font-black italic tracking-tight">Adminix Storefront</span>
            </div>

            <div className="flex bg-[hsl(var(--muted)/0.5)] rounded-lg p-1 border border-[hsl(var(--border))]">
              <button
                onClick={() => setPreviewMode("desktop")}
                className={cn(
                  "px-3 py-1.5 rounded-md flex items-center gap-2 text-xs font-bold transition-all",
                  previewMode === "desktop" ? "bg-white dark:bg-black/40 shadow-sm text-[hsl(var(--primary))]" : "text-[hsl(var(--muted-foreground))]"
                )}
              >
                <Monitor className="h-3.5 w-3.5" />
                Desktop
              </button>
              <button
                onClick={() => setPreviewMode("mobile")}
                className={cn(
                  "px-3 py-1.5 rounded-md flex items-center gap-2 text-xs font-bold transition-all",
                  previewMode === "mobile" ? "bg-white dark:bg-black/40 shadow-sm text-[hsl(var(--primary))]" : "text-[hsl(var(--muted-foreground))]"
                )}
              >
                <Smartphone className="h-3.5 w-3.5" />
                Mobile
              </button>
            </div>

            <div className="w-24" /> {/* Spacer */}
          </div>

          {/* Preview Canvas */}
          <div className="flex-1 overflow-y-auto p-12 flex justify-center items-start">
            <div className={cn(
              "transition-all duration-500 ease-in-out",
              previewMode === "desktop" ? "w-full max-w-lg" : "w-[375px] ring-8 ring-black rounded-[40px] overflow-hidden shadow-2xl bg-white"
            )}>
              <ProductPreview data={previewData} />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
