import { useState, useCallback } from "react";
import {
    Code2,
    Monitor,
    AlertCircle,
    RefreshCw,
    Undo2,
    ChevronLeft,
    Sparkles,
    Download,
    CheckCircle2
} from "lucide-react";
import { AdminPanel } from "./AdminPanel";
import { Card } from "@/ui/Misc";
import { Button } from "@/ui/Button";
import { Badge } from "@/ui/Misc";
import { cn } from "@/utils/cn";
import { exportProjectZip } from "@/utils/zip-exporter";
import { useDebounce } from "@/hooks/useDebounce";
import { validateResourceDefinition } from "@/utils/resource-schema";
import type { ResourceDefinition } from "@/types/resource-types";

// ── Default Sample Configuration ──────────────────────────────────────────────

const DEFAULT_RESOURCE: ResourceDefinition = {
    name: "products",
    endpoint: "/api/products",
    label: "Inventory Management",
    description: "Real-time schema editing playground",
    fields: [
        { name: "id", type: "number", sortable: true },
        { name: "name", type: "string", required: true, searchable: true },
        { name: "price", type: "number", filter: "range", sortable: true },
        {
            name: "category", type: "select", filter: "select", options: [
                { label: "Electronics", value: "electronics" },
                { label: "Hardware", value: "hardware" }
            ]
        },
        { name: "inStock", type: "boolean", filter: "boolean" }
    ],
    permissions: {
        create: true,
        edit: true,
        delete: true
    }
};

// ── Component ─────────────────────────────────────────────────────────────────

export function DevPlayground() {
    const [jsonText, setJsonText] = useState(JSON.stringify(DEFAULT_RESOURCE, null, 2));
    const [resource, setResource] = useState<ResourceDefinition>(DEFAULT_RESOURCE);
    const [parseError, setParseError] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isExporting, setIsExporting] = useState(false);

    // Debounce the JSON text for preview updates (300ms)
    const debouncedJson = useDebounce(jsonText, 300);

    // Parse and validate when debounced text changes
    const processSchema = useCallback((text: string) => {
        // Step 1: Parse JSON
        let parsed: unknown;
        try {
            parsed = JSON.parse(text);
            setParseError(null);
        } catch (e) {
            setParseError((e as Error).message);
            setValidationErrors([]);
            return;
        }

        // Step 2: Validate with Zod
        const result = validateResourceDefinition(parsed);
        if (result.success) {
            setResource(result.data as ResourceDefinition);
            setValidationErrors([]);
        } else {
            setValidationErrors(result.errors);
            // Still update the preview with the raw parsed data if JSON is valid
            setResource(parsed as ResourceDefinition);
        }
    }, []);

    // Use effect equivalent: process when debounced value changes
    // We use useState + useCallback pattern to avoid useEffect dependency issues
    const [lastProcessed, setLastProcessed] = useState(debouncedJson);
    if (debouncedJson !== lastProcessed) {
        setLastProcessed(debouncedJson);
        processSchema(debouncedJson);
    }

    const hasError = !!parseError;
    const hasWarnings = validationErrors.length > 0;

    const handleFormat = () => {
        try {
            const parsed = JSON.parse(jsonText);
            setJsonText(JSON.stringify(parsed, null, 2));
        } catch (e) {
            setParseError((e as Error).message);
        }
    };

    const handleReset = () => {
        setJsonText(JSON.stringify(DEFAULT_RESOURCE, null, 2));
        setParseError(null);
        setValidationErrors([]);
    };

    const handleExport = async () => {
        if (hasError) return;
        setIsExporting(true);
        try {
            await exportProjectZip([resource], `autoadmin-project-${resource.name}`);
        } catch (err) {
            console.error(err);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="flex h-screen w-full overflow-hidden bg-[hsl(var(--background))]">
            {/* 1. Editor Sidebar */}
            <aside
                className={cn(
                    "relative flex flex-col border-r border-[hsl(var(--border))] bg-[hsl(var(--card))] transition-all duration-300",
                    isSidebarOpen ? "w-[480px]" : "w-0"
                )}
            >
                <div className="flex items-center justify-between px-4 py-3 border-b border-[hsl(var(--border))]">
                    <div className="flex items-center gap-2">
                        <Code2 className="h-4 w-4 text-[hsl(var(--primary))]" />
                        <span className="font-bold text-sm tracking-tight uppercase">Schema Editor</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="default"
                            size="sm"
                            className="h-8 gap-1.5 px-3 mr-1"
                            onClick={handleExport}
                            disabled={hasError || isExporting}
                        >
                            {isExporting ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                            <span className="text-[11px] font-bold uppercase tracking-wider">Export</span>
                        </Button>
                        <div className="h-4 w-[1px] bg-[hsl(var(--border))] mx-1" />
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleReset} title="Reset to default">
                            <Undo2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleFormat} title="Format JSON">
                            <RefreshCw className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>

                <div className="flex-1 relative overflow-hidden group">
                    <textarea
                        value={jsonText}
                        onChange={(e) => setJsonText(e.target.value)}
                        spellCheck={false}
                        className={cn(
                            "absolute inset-0 w-full h-full p-6 font-mono text-xs leading-relaxed transition-all",
                            "bg-transparent resize-none border-none outline-none text-[hsl(var(--foreground))]",
                            "placeholder:text-[hsl(var(--muted-foreground))]/50",
                            hasError ? "selection:bg-red-500/20" : "selection:bg-[hsl(var(--primary)/0.2)]"
                        )}
                        placeholder="Paste your ResourceDefinition JSON here..."
                    />

                    {/* Error / Validation Overlay */}
                    {(hasError || hasWarnings) && (
                        <div className="absolute bottom-4 left-4 right-4 animate-in slide-in-from-bottom-2 duration-300 space-y-2 max-h-[200px] overflow-y-auto">
                            {hasError && (
                                <Card className="bg-[hsl(var(--destructive)/0.1)] border-[hsl(var(--destructive)/0.2)] p-3">
                                    <div className="flex items-start gap-2">
                                        <AlertCircle className="h-4 w-4 text-[hsl(var(--destructive))] mt-0.5 shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-[hsl(var(--destructive))] uppercase tracking-wider">Invalid JSON</p>
                                            <p className="text-[10px] text-[hsl(var(--destructive))] opacity-80 font-mono mt-1 break-all">
                                                {parseError}
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            )}
                            {hasWarnings && !hasError && (
                                <Card className="bg-amber-500/10 border-amber-500/20 p-3">
                                    <div className="flex items-start gap-2">
                                        <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                                                Schema Warnings ({validationErrors.length})
                                            </p>
                                            <ul className="mt-1 space-y-0.5">
                                                {validationErrors.slice(0, 5).map((err, i) => (
                                                    <li key={i} className="text-[10px] text-amber-700 dark:text-amber-300 font-mono break-all">
                                                        • {err}
                                                    </li>
                                                ))}
                                                {validationErrors.length > 5 && (
                                                    <li className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                                                        ...and {validationErrors.length - 5} more
                                                    </li>
                                                )}
                                            </ul>
                                        </div>
                                    </div>
                                </Card>
                            )}
                        </div>
                    )}
                </div>

                <div className="p-3 border-t border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.3)] flex items-center justify-between">
                    <Badge
                        variant={hasError ? "destructive" : hasWarnings ? "warning" : "success"}
                        className="h-5 gap-1"
                    >
                        {hasError ? (
                            <><AlertCircle className="h-3 w-3" /> Parse Error</>
                        ) : hasWarnings ? (
                            <><AlertCircle className="h-3 w-3" /> {validationErrors.length} Warning{validationErrors.length > 1 ? "s" : ""}</>
                        ) : (
                            <><CheckCircle2 className="h-3 w-3" /> Valid Schema</>
                        )}
                    </Badge>
                    <div className="flex items-center gap-1.5 text-[10px] text-[hsl(var(--muted-foreground))] font-medium">
                        <Sparkles className="h-3 w-3" />
                        Debounced updates (300ms)
                    </div>
                </div>

                {/* Toggle Button Inside Sidebar */}
                <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm transition-transform hover:scale-110"
                >
                    <ChevronLeft className="h-3 w-3" />
                </button>
            </aside>

            {/* Re-open Sidebar Button */}
            {!isSidebarOpen && (
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="absolute left-4 bottom-4 z-50 flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-[hsl(var(--primary))] bg-[hsl(var(--card))] text-[hsl(var(--primary))] shadow-xl animate-in zoom-in duration-300 hover:scale-110 active:scale-95 transition-all"
                >
                    <Code2 className="h-6 w-6" />
                </button>
            )}

            {/* 2. Preview Area */}
            <main className="flex-1 relative bg-[hsl(var(--muted)/0.05)] overflow-hidden flex flex-col">
                <div className="h-full w-full overflow-hidden relative">
                    <div key={resource.name} className="absolute inset-0">
                        <AdminPanel
                            resources={[resource]}
                            showDashboard={false}
                            title="AutoAdmin Playground"
                        />
                    </div>
                </div>

                {/* Status Indicators */}
                <div className="absolute top-4 left-6 pointer-events-none z-20 flex flex-col gap-2">
                    <div className="flex h-7 items-center gap-2 rounded-full border border-[hsl(var(--primary)/0.2)] bg-[hsl(var(--background)/0.8)] backdrop-blur px-3 shadow-lg">
                        <Monitor className="h-3 w-3 text-[hsl(var(--primary))]" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-[hsl(var(--primary))]">Live Preview</span>
                    </div>
                </div>

                {/* Status Indicator (Bottom Right) */}
                <div className="absolute bottom-6 right-6 pointer-events-none z-20">
                    <div className="flex items-center gap-3 rounded-full bg-[hsl(var(--background))/0.8] backdrop-blur border border-[hsl(var(--border))] px-4 py-2 shadow-2xl">
                        <div className={cn(
                            "flex h-2 w-2 rounded-full animate-pulse",
                            hasError ? "bg-red-500" : hasWarnings ? "bg-amber-500" : "bg-emerald-500"
                        )} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">
                            {hasError ? "Parsing Error" : hasWarnings ? "Schema Warnings" : "Engine Reactive"}
                        </span>
                    </div>
                </div>
            </main>
        </div>
    );
}
