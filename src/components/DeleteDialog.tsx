import React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/ui/Button";
import { cn } from "@/utils/cn";

interface DeleteDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void | Promise<void>;
    loading?: boolean;
    itemLabel?: string;
}

export function DeleteDialog({ open, onClose, onConfirm, loading, itemLabel = "this record" }: DeleteDialogProps) {
    return (
        <AlertDialogPrimitive.Root open={open} onOpenChange={(v) => !v && onClose()}>
            <AlertDialogPrimitive.Portal>
                <AlertDialogPrimitive.Overlay
                    className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] data-[state=open]:animate-fade-in"
                />
                <AlertDialogPrimitive.Content
                    className={cn(
                        "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
                        "w-full max-w-md rounded-xl border border-[hsl(var(--border))]",
                        "bg-[hsl(var(--card))] p-6 shadow-xl",
                        "data-[state=open]:animate-scale-in focus:outline-none"
                    )}
                >
                    <div className="flex gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--destructive)/0.12)]">
                            <AlertTriangle className="h-5 w-5 text-[hsl(var(--destructive))]" />
                        </div>
                        <div className="flex-1">
                            <AlertDialogPrimitive.Title className="text-base font-semibold">
                                Are you absolutely sure?
                            </AlertDialogPrimitive.Title>
                            <AlertDialogPrimitive.Description className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
                                This will permanently delete {itemLabel}. This action cannot be undone.
                            </AlertDialogPrimitive.Description>
                            <div className="mt-6 flex items-center justify-end gap-2">
                                <AlertDialogPrimitive.Cancel asChild>
                                    <Button variant="outline" onClick={onClose}>
                                        Cancel
                                    </Button>
                                </AlertDialogPrimitive.Cancel>
                                <AlertDialogPrimitive.Action asChild>
                                    <Button
                                        variant="destructive"
                                        onClick={async () => {
                                            await onConfirm();
                                            onClose();
                                        }}
                                        loading={loading}
                                    >
                                        Delete
                                    </Button>
                                </AlertDialogPrimitive.Action>
                            </div>
                        </div>
                    </div>
                </AlertDialogPrimitive.Content>
            </AlertDialogPrimitive.Portal>
        </AlertDialogPrimitive.Root>
    );
}
