import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/utils/cn";

interface ModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    children: React.ReactNode;
    size?: "sm" | "md" | "lg" | "xl" | "full";
    footer?: React.ReactNode;
}

const sizeMap: Record<NonNullable<ModalProps["size"]>, string> = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-[95vw]",
};

export function Modal({
    open,
    onOpenChange,
    title,
    description,
    children,
    size = "md",
    footer,
}: ModalProps) {
    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay
                    className={cn(
                        "fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px]",
                        "data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-in"
                    )}
                />
                <Dialog.Content
                    className={cn(
                        "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
                        "w-full rounded-xl border border-[hsl(var(--border))]",
                        "bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] shadow-xl",
                        "data-[state=open]:animate-scale-in",
                        "focus:outline-none",
                        "flex flex-col max-h-[90vh]",
                        sizeMap[size]
                    )}
                >
                    {/* Header */}
                    <div className="flex items-start justify-between p-6 pb-4 shrink-0">
                        <div>
                            <Dialog.Title className="text-lg font-semibold leading-none tracking-tight">
                                {title}
                            </Dialog.Title>
                            {description && (
                                <Dialog.Description className="mt-1.5 text-sm text-[hsl(var(--muted-foreground))]">
                                    {description}
                                </Dialog.Description>
                            )}
                        </div>
                        <Dialog.Close
                            className={cn(
                                "rounded-md p-1.5 opacity-70 ring-offset-background transition-opacity",
                                "hover:opacity-100 hover:bg-[hsl(var(--accent))]",
                                "focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                            )}
                        >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Close</span>
                        </Dialog.Close>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto px-6 py-2">{children}</div>

                    {/* Footer */}
                    {footer && (
                        <div className="border-t border-[hsl(var(--border))] px-6 py-4 shrink-0 flex items-center justify-end gap-2">
                            {footer}
                        </div>
                    )}
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
