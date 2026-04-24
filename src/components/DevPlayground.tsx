import { useState } from "react";
import {
  Code2,
  Sparkles,
  Settings,
  Database,
  PanelLeftOpen,
  PanelLeftClose,
  BarChart3,
} from "lucide-react";
import { Adminix } from "./Adminix";
import { VisualSchemaEditor } from "./VisualSchemaEditor";
import { Card } from "@/ui/Misc";
import { Button } from "@/ui/Button";
import { Badge } from "@/ui/Misc";
import { cn } from "@/utils/cn";
import { exportProjectZip } from "@/utils/zip-exporter";
import { useDebounce } from "@/hooks/useDebounce";
import { validateResourceDefinition } from "@/utils/resource-schema";
import type { ResourceDefinition } from "@/types/resource-types";
import type { ReportDefinition } from "@/types/report-types";

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
      name: "category",
      type: "select",
      filter: "select",
      options: [
        { label: "Electronics", value: "electronics" },
        { label: "Hardware", value: "hardware" },
      ],
    },
    { name: "inStock", type: "boolean", filter: "boolean" },
  ],
};

const DEFAULT_REPORTS: ReportDefinition[] = [
  {
    id: "playground-overview",
    name: "Business Overview",
    description: "Sample dashboard defined via JSON config",
    widgets: [
      {
        id: "w1",
        type: "kpi",
        title: "Total Revenue",
        dataSource: { resourceName: "products" },
        config: { valueField: "price", prefix: "$" },
        layout: { x: 0, y: 0, w: 3, h: 2, i: "w1" }
      },
      {
        id: "w2",
        type: "bar",
        title: "Category Distribution",
        dataSource: { resourceName: "products" },
        config: { xAxisField: "category", seriesFields: ["price"], showGrid: true },
        layout: { x: 3, y: 0, w: 9, h: 4, i: "w2" }
      }
    ],
    filters: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    _source: "playground"
  }
];

// ── Component ─────────────────────────────────────────────────────────────────

export function DevPlayground() {
  const [jsonText, setJsonText] = useState(JSON.stringify(DEFAULT_RESOURCE, null, 2));
  const [reportsJsonText, setReportsJsonText] = useState(JSON.stringify(DEFAULT_REPORTS, null, 2));
  const [resource, setResource] = useState<ResourceDefinition>(DEFAULT_RESOURCE);
  const [reports, setReports] = useState<ReportDefinition[]>(DEFAULT_REPORTS);
  
  const [parseError, setParseError] = useState<string | null>(null);
  const [reportsParseError, setReportsParseError] = useState<string | null>(null);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [editMode, setEditMode] = useState<"visual" | "json" | "reports" | "mock">("visual");
  
  const [mockJsonText, setMockJsonText] = useState(
    '[\n  { "id": 1, "name": "Pro Headphones", "price": 199.99, "category": "electronics", "inStock": true },\n  { "id": 2, "name": "Mechanical Keyboard", "price": 129.99, "category": "electronics", "inStock": true },\n  { "id": 3, "name": "USB-C Cable", "price": 19.99, "category": "electronics", "inStock": false }\n]',
  );

  const debouncedJson = useDebounce(jsonText, 300);
  const debouncedReportsJson = useDebounce(reportsJsonText, 300);
  const debouncedMockJson = useDebounce(mockJsonText, 300);

  const isSyncing = jsonText !== debouncedJson || reportsJsonText !== debouncedReportsJson || mockJsonText !== debouncedMockJson;

  const [prevDebouncedJson, setPrevDebouncedJson] = useState(debouncedJson);
  const [prevDebouncedReportsJson, setPrevDebouncedReportsJson] = useState(debouncedReportsJson);

  // Sync resource from text editor (debounced)
  if (debouncedJson !== prevDebouncedJson) {
    setPrevDebouncedJson(debouncedJson);
    try {
      const parsed = JSON.parse(debouncedJson);
      setParseError(null);
      const result = validateResourceDefinition(parsed);
      setResource(result.success ? (result.data as ResourceDefinition) : (parsed as ResourceDefinition));
    } catch (e) {
      setParseError((e as Error).message);
    }
  }
  
  // Sync reports from text editor (debounced)
  if (debouncedReportsJson !== prevDebouncedReportsJson) {
    setPrevDebouncedReportsJson(debouncedReportsJson);
    try {
      const parsed = JSON.parse(debouncedReportsJson);
      setReportsParseError(null);
      if (Array.isArray(parsed)) {
        setReports(parsed.map((r: ReportDefinition) => ({ ...r, _source: 'playground' as const })));
      }
    } catch (e) {
      setReportsParseError((e as Error).message);
    }
  }

  const handleVisualChange = (updated: ResourceDefinition) => {
    setResource(updated);
    setJsonText(JSON.stringify(updated, null, 2));
  };

  const handleFormat = () => {
    try {
      if (editMode === "json") setJsonText(JSON.stringify(JSON.parse(jsonText), null, 2));
      else if (editMode === "reports") setReportsJsonText(JSON.stringify(JSON.parse(reportsJsonText), null, 2));
      else if (editMode === "mock") setMockJsonText(JSON.stringify(JSON.parse(mockJsonText), null, 2));
    } catch (e) {
      setParseError((e as Error).message);
    }
  };

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-[hsl(var(--background))]">
      <aside className={cn(
        "relative flex flex-col border-r border-[hsl(var(--border))] bg-[hsl(var(--card))] transition-all duration-500 shadow-2xl z-40 overflow-hidden",
        isSidebarOpen ? "w-[480px]" : "w-0 border-r-0"
      )}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[hsl(var(--border))] bg-[hsl(var(--background)/0.3)] backdrop-blur-md">
          <div className="flex items-center gap-3">
             <Code2 className="h-5 w-5 text-[hsl(var(--primary))]" />
             <span className="font-bold text-sm tracking-widest uppercase">Adminix Designer</span>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => exportProjectZip([resource], "adminix-export")}>Export</Button>
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)}><PanelLeftClose className="h-4 w-4" /></Button>
          </div>
        </div>

        <div className="px-5 py-3 border-b border-[hsl(var(--border))]">
          <div className="flex p-1 bg-[hsl(var(--muted)/0.4)] rounded-xl border border-[hsl(var(--border))]">
            {[
              { id: "visual", label: "Visual", icon: Settings },
              { id: "json", label: "Schema", icon: Code2 },
              { id: "reports", label: "Reports", icon: BarChart3 },
              { id: "mock", label: "Mock", icon: Database },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setEditMode(t.id as "visual" | "json" | "reports" | "mock")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                  editMode === t.id ? "bg-[hsl(var(--card))] text-[hsl(var(--primary))] shadow-sm" : "text-[hsl(var(--muted-foreground))]"
                )}
              >
                <t.icon className="h-3 w-3" />
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 relative overflow-hidden flex flex-col">
          {editMode === "visual" ? (
            <VisualSchemaEditor resource={resource} onChange={handleVisualChange} />
          ) : (
            <div className="relative h-full w-full">
               <textarea
                  value={editMode === "json" ? jsonText : editMode === "reports" ? reportsJsonText : mockJsonText}
                  onChange={(e) => {
                     if (editMode === "json") setJsonText(e.target.value);
                     else if (editMode === "reports") setReportsJsonText(e.target.value);
                     else setMockJsonText(e.target.value);
                  }}
                  className="absolute inset-0 w-full h-full p-8 font-mono text-xs leading-relaxed bg-transparent resize-none border-none outline-none"
                  spellCheck={false}
               />
               <div className="absolute top-4 right-4">
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg border bg-white/50 backdrop-blur" onClick={handleFormat}>
                     <Sparkles className="h-3 w-3" />
                  </Button>
               </div>
            </div>
          )}
          
          {(parseError || reportsParseError) && (
            <div className="absolute bottom-4 left-4 right-4 animate-in slide-in-from-bottom-2">
               <Card className="bg-rose-500/10 border-rose-500/20 p-3 text-[10px] text-rose-500 font-mono">
                  {parseError || reportsParseError}
               </Card>
            </div>
          )}
        </div>

        <div className="p-3 border-t border-[hsl(var(--border))] flex justify-between items-center">
            <Badge variant="success" className="h-5">Live Designer</Badge>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase opacity-40">
               <Sparkles className="h-3 w-3" />
               Realtime Sync
            </div>
        </div>
      </aside>

      {!isSidebarOpen && (
        <button onClick={() => setIsSidebarOpen(true)} className="absolute left-6 top-6 z-50 h-10 w-10 bg-white dark:bg-black rounded-xl border flex items-center justify-center shadow-2xl">
           <PanelLeftOpen className="h-5 w-5" />
        </button>
      )}

      <main className="flex-1 relative bg-[hsl(var(--muted)/0.05)] overflow-hidden">
        <div className="absolute inset-0" key={`${resource.name}-${reports.length}`}>
          <Adminix
            resources={[resource]}
            initialReports={reports}
            enableReports={true}
            showDashboard={true}
            title="Adminix Playground"
          />
        </div>
        
        <div className="absolute bottom-8 right-8 pointer-events-none z-20">
          <div className="flex items-center gap-3 rounded-full bg-[hsl(var(--background)/0.6)] backdrop-blur-2xl border px-5 py-2.5 shadow-2xl transition-all">
             <div className={cn("h-2.5 w-2.5 rounded-full animate-pulse", isSyncing ? "bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" : "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]")} />
             <span className="text-[10px] font-black uppercase tracking-widest">{isSyncing ? "Syncing..." : "Live Preview"}</span>
          </div>
        </div>
      </main>
    </div>
  );
}
