import { useState, useMemo } from "react";
import { Button } from "@/ui/Button";
import { Input } from "@/ui/Input";
import {
  ChevronLeft,
  Plus,
  Save,
  LineChart as LineChartIcon,
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp,
  Table as TableIcon,
  Settings,
  Trash2,
  Database,
  Globe,
  Layout,
  RefreshCw,
  Zap,
} from "lucide-react";
import type { ReportDefinition, ReportWidget, ChartType } from "@/types/report-types";
import type { ResourceDefinition } from "@/types/resource-types";
import { cn } from "@/utils/cn";
import { useAdminStore, type AdminState } from "@/core/store";

interface ReportBuilderProps {
  initialReport?: ReportDefinition;
  onSave: (report: ReportDefinition) => void;
  onCancel: () => void;
  defaultResourceName?: string;
}

export function ReportBuilder({ initialReport, onSave, onCancel, defaultResourceName }: ReportBuilderProps) {
  const [report, setReport] = useState<ReportDefinition>(() => initialReport || {
    id: `report-${Math.random().toString(36).substr(2, 9)}`,
    name: "New Report",
    description: "A custom overview of your data",
    widgets: [],
    filters: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    _source: "local",
  });

  const [activeWidgetId, setActiveWidgetId] = useState<string | null>(null);
  const { resources } = useAdminStore() as AdminState;

  const activeWidget = useMemo(() => 
    report.widgets.find((w: ReportWidget) => w.id === activeWidgetId),
    [report.widgets, activeWidgetId]
  );

  const addWidget = (type: ChartType = "line") => {
    const id = `widget-${Math.random().toString(36).substr(2, 9)}`;
    const newWidget: ReportWidget = {
      id,
      type,
      title: "New Chart",
      dataSource: {
        resourceName: defaultResourceName || resources[0]?.name || "",
      },
      config: {
        xAxisField: "id",
        yAxisField: "",
        seriesFields: [],
        showGrid: true,
        showLegend: true,
      },
      layout: { x: 0, y: report.widgets.length * 2, w: 6, h: 4, i: id },
    };
    setReport((r: ReportDefinition) => ({ ...r, widgets: [...r.widgets, newWidget] }));
    setActiveWidgetId(newWidget.id);
  };

  const updateWidget = (id: string, updates: Partial<ReportWidget>) => {
    setReport((r: ReportDefinition) => ({
      ...r,
      widgets: r.widgets.map((w: ReportWidget) => (w.id === id ? { ...w, ...updates } : w)),
    }));
  };

  const removeWidget = (id: string) => {
    setReport((r: ReportDefinition) => ({
      ...r,
      widgets: r.widgets.filter((w: ReportWidget) => w.id !== id),
    }));
    if (activeWidgetId === id) setActiveWidgetId(null);
  };

  return (
    <div className="flex h-full flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[hsl(var(--border))] pb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onCancel} className="h-10 w-10">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <Input 
              value={report.name} 
              onChange={(e) => setReport({ ...report, name: e.target.value })}
              className="border-none bg-transparent p-0 text-2xl font-black focus-visible:ring-0 w-auto min-w-[200px]"
              placeholder="Report Name"
            />
            <Input 
              value={report.description} 
              onChange={(e) => setReport({ ...report, description: e.target.value })}
              className="border-none bg-transparent p-0 text-sm font-medium text-[hsl(var(--muted-foreground))] opacity-70 focus-visible:ring-0"
              placeholder="Add a description..."
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onCancel} className="rounded-xl px-6 font-bold transition-all hover:bg-rose-500/10 hover:text-rose-500 h-10">
            Discard
          </Button>
          <Button onClick={() => onSave(report)} className="gap-2 rounded-xl px-8 font-black shadow-lg shadow-[hsl(var(--primary)/0.2)] h-10">
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden min-h-0">
        {/* Left Panel: Widgets List */}
        <div className="flex w-64 flex-col gap-4 pr-2">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))] opacity-60">
              Widgets ({report.widgets.length})
            </h3>
            <Button variant="ghost" size="icon" onClick={() => addWidget()} className="h-6 w-6 text-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.1)] hover:bg-[hsl(var(--primary))] hover:text-white transition-all rounded-md">
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          
          <div className="flex flex-col gap-2 overflow-y-auto">
            {report.widgets.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-[hsl(var(--border))] rounded-2xl text-center opacity-40">
                <Layout className="h-8 w-8 mb-2" />
                <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">No widgets yet.<br/>Add your first chart.</p>
              </div>
            ) : (
              report.widgets.map((w: ReportWidget) => (
                <button
                  key={w.id}
                  onClick={() => setActiveWidgetId(w.id)}
                  className={cn(
                    "flex flex-col gap-1 w-full rounded-xl p-3 text-left transition-all group",
                    activeWidgetId === w.id 
                      ? "bg-[hsl(var(--primary))] text-white shadow-lg shadow-[hsl(var(--primary)/0.2)]" 
                      : "bg-[hsl(var(--muted)/0.5)] hover:bg-[hsl(var(--accent))] text-[hsl(var(--foreground))]"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black truncate max-w-[120px]">{w.title}</span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className={cn("h-5 w-5", activeWidgetId === w.id ? "text-white hover:bg-white/20" : "text-rose-500 hover:bg-rose-500/10")}
                        onClick={(e) => { e.stopPropagation(); removeWidget(w.id); }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <span className={cn("text-[10px] font-bold uppercase tracking-widest opacity-60", activeWidgetId === w.id ? "text-white" : "text-[current]")}>
                    {w.type}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Panel: Widget Configurator or Preview */}
        <div className="flex-1 overflow-y-auto rounded-[32px] bg-[hsl(var(--muted)/0.15)] p-8 border border-[hsl(var(--border))] shadow-inner">
          {activeWidget ? (
            <div className="mx-auto max-w-2xl animate-slide-in">
              <div className="flex items-center gap-3 mb-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[hsl(var(--primary))] text-white shadow-xl shadow-[hsl(var(--primary)/0.3)]">
                   <Settings className="h-6 w-6" />
                </div>
                <div>
                   <h2 className="text-xl font-black tracking-tight uppercase leading-none">Configure Widget</h2>
                   <p className="text-[10px] font-bold text-[hsl(var(--muted-foreground))] opacity-50 tracking-widest mt-1 uppercase">Visual data mapping designer</p>
                </div>
              </div>

              <div className="space-y-8">
                {/* Visual Settings */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[hsl(var(--primary))] pl-1">Visual Settings</h4>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-[hsl(var(--muted-foreground))] pl-1">Widget Title</label>
                       <Input 
                         value={activeWidget.title} 
                         onChange={(e) => updateWidget(activeWidget.id, { title: e.target.value })}
                         className="rounded-2xl border-[hsl(var(--border))] bg-[hsl(var(--background))] focus:border-[hsl(var(--primary))] transition-all h-11 text-sm font-bold px-4"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-[hsl(var(--muted-foreground))] pl-1">Chart Type</label>
                       <div className="flex bg-[hsl(var(--muted)/0.5)] rounded-2xl p-1 gap-1 h-11">
                         {[
                           { name: "line", icon: LineChartIcon },
                           { name: "bar", icon: BarChart3 },
                           { name: "pie", icon: PieChartIcon },
                           { name: "kpi", icon: TrendingUp },
                           { name: "table", icon: TableIcon },
                         ].map((t) => (
                           <button
                             key={t.name}
                             onClick={() => updateWidget(activeWidget.id, { type: t.name as ChartType })}
                             className={cn(
                               "flex-1 flex items-center justify-center rounded-xl transition-all",
                               activeWidget.type === t.name 
                                 ? "bg-[hsl(var(--card))] text-[hsl(var(--primary))] shadow-md" 
                                 : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                             )}
                             title={t.name.toUpperCase()}
                           >
                             <t.icon className="h-4 w-4" />
                           </button>
                         ))}
                       </div>
                    </div>
                  </div>
                </div>

                {/* Data Source Settings */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[hsl(var(--primary))] pl-1">Data Source</h4>
                  <div className="flex bg-[hsl(var(--muted)/0.5)] rounded-2xl p-1 gap-1 mb-4 h-11">
                    <button 
                      onClick={() => updateWidget(activeWidget.id, { dataSource: { ...activeWidget.dataSource, resourceName: resources[0]?.name, endpoint: undefined } })}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                        activeWidget.dataSource.resourceName ? "bg-[hsl(var(--card))] text-[hsl(var(--primary))] shadow-md" : "opacity-40"
                      )}
                    >
                      <Database className="h-3 w-3" />
                      Resources
                    </button>
                    <button 
                       onClick={() => updateWidget(activeWidget.id, { dataSource: { ...activeWidget.dataSource, resourceName: undefined, endpoint: "/api/" } })}
                       className={cn(
                        "flex-1 flex items-center justify-center gap-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                        activeWidget.dataSource.endpoint ? "bg-[hsl(var(--card))] text-[hsl(var(--primary))] shadow-md" : "opacity-40"
                      )}
                    >
                      <Globe className="h-3 w-3" />
                      Custom API
                    </button>
                  </div>

                  {activeWidget.dataSource.resourceName !== undefined ? (
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-[hsl(var(--muted-foreground))] pl-1">Resource</label>
                       <select 
                         className="w-full h-11 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 text-sm font-bold focus:ring-1 focus:ring-[hsl(var(--primary))] appearance-none shadow-sm"
                         value={activeWidget.dataSource.resourceName}
                         onChange={(e) => updateWidget(activeWidget.id, { dataSource: { ...activeWidget.dataSource, resourceName: e.target.value } })}
                       >
                         {resources.map((res: ResourceDefinition) => (
                           <option key={res.name} value={res.name}>{res.label || res.name}</option>
                         ))}
                       </select>
                    </div>
                  ) : (
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-[hsl(var(--muted-foreground))] pl-1">Endpoint (URL)</label>
                       <Input 
                         value={activeWidget.dataSource.endpoint} 
                         onChange={(e) => updateWidget(activeWidget.id, { dataSource: { ...activeWidget.dataSource, endpoint: e.target.value } })}
                         className="rounded-2xl border-[hsl(var(--border))] bg-[hsl(var(--background))] focus:ring-1 focus:ring-[hsl(var(--primary))] h-11 text-sm font-bold px-4"
                         placeholder="/api/analytics/sales"
                       />
                    </div>
                  )}
                </div>

                {/* Mapping & Axis */}
                {["line", "bar", "area", "pie"].includes(activeWidget.type) && (
                   <div className="space-y-4">
                     <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[hsl(var(--primary))] pl-1">Mapping & Axis</h4>
                     <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-[hsl(var(--muted-foreground))] pl-1">X-Axis Field (Label)</label>
                          <Input 
                            value={activeWidget.config.xAxisField} 
                            onChange={(e) => updateWidget(activeWidget.id, { config: { ...activeWidget.config, xAxisField: e.target.value } })}
                            className="rounded-2xl h-11 text-sm font-bold px-4"
                            placeholder="e.g. date, category"
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-[hsl(var(--muted-foreground))] pl-1">
                            {activeWidget.type === "pie" ? "Value Field" : "Series Fields"}
                          </label>
                          <Input 
                            value={activeWidget.type === "pie" ? activeWidget.config.valueField : activeWidget.config.seriesFields?.join(", ")} 
                            onChange={(e) => {
                              if (activeWidget.type === "pie") {
                                updateWidget(activeWidget.id, { config: { ...activeWidget.config, valueField: e.target.value } });
                              } else {
                                updateWidget(activeWidget.id, { config: { ...activeWidget.config, seriesFields: e.target.value.split(",").map(s => s.trim()) } });
                              }
                            }}
                            className="rounded-2xl h-11 text-sm font-bold px-4"
                            placeholder="e.g. revenue, count"
                          />
                       </div>
                     </div>
                   </div>
                )}
                
                {activeWidget.type === "kpi" && (
                   <div className="space-y-4">
                     <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[hsl(var(--primary))] pl-1">KPI Configuration</h4>
                     <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-[hsl(var(--muted-foreground))] pl-1">Value Field</label>
                          <Input 
                            value={activeWidget.config.valueField} 
                            onChange={(e) => updateWidget(activeWidget.id, { config: { ...activeWidget.config, valueField: e.target.value } })}
                            className="rounded-2xl h-11 text-sm font-bold px-4"
                            placeholder="e.g. total_sum"
                          />
                       </div>
                       <div className="flex gap-2">
                          <div className="space-y-2 flex-1">
                             <label className="text-[10px] font-black uppercase tracking-widest text-[hsl(var(--muted-foreground))] pl-1">Prefix</label>
                             <Input 
                               value={activeWidget.config.prefix} 
                               onChange={(e) => updateWidget(activeWidget.id, { config: { ...activeWidget.config, prefix: e.target.value } })}
                               className="rounded-2xl h-11 text-center font-bold"
                               placeholder="$"
                             />
                          </div>
                          <div className="space-y-2 flex-1">
                             <label className="text-[10px] font-black uppercase tracking-widest text-[hsl(var(--muted-foreground))] pl-1">Suffix</label>
                             <Input 
                               value={activeWidget.config.suffix} 
                               onChange={(e) => updateWidget(activeWidget.id, { config: { ...activeWidget.config, suffix: e.target.value } })}
                               className="rounded-2xl h-11 text-center font-bold"
                               placeholder="USD"
                             />
                          </div>
                       </div>
                     </div>
                   </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-center px-12">
              <div className="h-20 w-20 mb-8 rounded-[38px] bg-[hsl(var(--primary))] text-white flex items-center justify-center shadow-2xl shadow-[hsl(var(--primary)/0.3)] animate-pulse">
                <RefreshCw className="h-10 w-10" />
              </div>
              <h2 className="text-2xl font-black uppercase tracking-tight mb-4">Designer Workspace</h2>
              <p className="text-sm text-[hsl(var(--muted-foreground))] max-w-sm mb-12 leading-relaxed font-medium">
                Select a widget to edit or create a new chart to start visualizing your data in real-time.
              </p>
              <div className="grid grid-cols-2 gap-6 w-full max-w-md">
                <div className="p-8 bg-[hsl(var(--card))] rounded-[32px] flex flex-col items-center gap-4 shadow-xl shadow-black/5 ring-1 ring-black/5">
                   <Zap className="h-6 w-6 text-amber-500" />
                   <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Live Sync</span>
                </div>
                <div className="p-8 bg-[hsl(var(--card))] rounded-[32px] flex flex-col items-center gap-4 shadow-xl shadow-black/5 ring-1 ring-black/5">
                   <Layout className="h-6 w-6 text-[hsl(var(--primary))]" />
                   <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Drag n Drop</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
