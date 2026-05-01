import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { X, GripVertical, UploadCloud, Loader2, Star } from "lucide-react";
import { cn } from "@/utils/cn";
import { ProductMedia } from "@/types/product-types";

interface ImageUploaderProps {
  images: ProductMedia[];
  onChange: (images: ProductMedia[]) => void;
  uploadEndpoint?: string;
}

export function ImageUploader({ images, onChange, uploadEndpoint }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsUploading(true);
    
    // Simulate or actual upload
    const newImages: ProductMedia[] = await Promise.all(
      acceptedFiles.map(async (file) => {
        if (uploadEndpoint) {
          // Actual upload logic here if needed
          // For now, fallback to base64
        }
        
        return new Promise<ProductMedia>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve({
              id: Math.random().toString(36).substring(7),
              url: e.target?.result as string,
              type: "image",
              isMain: images.length === 0,
            });
          };
          reader.readAsDataURL(file);
        });
      })
    );

    onChange([...images, ...newImages]);
    setIsUploading(false);
  }, [images, onChange, uploadEndpoint]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpeg", ".png", ".webp", ".jpg"] },
  });

  const removeImage = (id: string) => {
    onChange(images.filter((img) => img.id !== id));
  };

  const setMainImage = (id: string) => {
    onChange(images.map((img) => ({ ...img, isMain: img.id === id })));
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(images);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    onChange(items);
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          "relative border-2 border-dashed rounded-2xl p-8 transition-all cursor-pointer flex flex-col items-center justify-center gap-3",
          isDragActive 
            ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.05)] scale-[0.99]" 
            : "border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.5)] hover:bg-[hsl(var(--muted)/0.3)]"
        )}
      >
        <input {...getInputProps()} />
        <div className="h-12 w-12 rounded-full bg-[hsl(var(--primary)/0.1)] flex items-center justify-center text-[hsl(var(--primary))]">
          {isUploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <UploadCloud className="h-6 w-6" />}
        </div>
        <div className="text-center">
          <p className="font-bold text-sm">Click to upload or drag and drop</p>
          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">PNG, JPG, WebP (max. 2MB)</p>
        </div>
      </div>

      {images.length > 0 && (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="images" direction="horizontal">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="flex flex-wrap gap-4"
              >
                {images.map((image, index) => (
                  <Draggable key={image.id} draggableId={image.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={cn(
                          "relative group w-32 h-32 rounded-xl overflow-hidden border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm transition-all",
                          snapshot.isDragging && "ring-2 ring-[hsl(var(--primary))] shadow-xl scale-105 z-50",
                          image.isMain && "ring-2 ring-[hsl(var(--primary))]"
                        )}
                      >
                        <img
                          src={image.url}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => removeImage(image.id)}
                            className="p-1.5 bg-white/10 hover:bg-red-500/80 rounded-lg text-white transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                          <div
                            {...provided.dragHandleProps}
                            className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white cursor-grab"
                          >
                            <GripVertical className="h-4 w-4" />
                          </div>
                        </div>

                        {image.isMain ? (
                          <div className="absolute top-2 left-2 bg-[hsl(var(--primary))] text-white px-1.5 py-0.5 rounded-md shadow-lg flex items-center gap-1">
                            <Star className="h-3 w-3 fill-current" />
                            <span className="text-[8px] font-black uppercase tracking-tighter">Main</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setMainImage(image.id)}
                            className="absolute top-2 left-2 bg-black/40 opacity-0 group-hover:opacity-100 text-white p-1.5 rounded-md hover:bg-[hsl(var(--primary))] transition-all backdrop-blur-sm"
                            title="Set as Main"
                          >
                            <Star className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
}
