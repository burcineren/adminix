import { useState } from "react";
import type * as RGL from "react-grid-layout";
import { useAdminStore } from "@/core/store";
import { WidgetGrid } from "./WidgetGrid";
import { ReportBuilder } from "./ReportBuilder";
import { 
  Plus, 
  Settings2, 
  Trash2, 
  ExternalLink, 
  Calendar, 
  Layout as LayoutIcon, 
  MoreHorizontal,
  ChevronRight,
  TrendingUp,
  Grid
} from "lucide-react";
import { Button } from "@/ui/Button";
import { Card, CardHeader, CardContent } from "@/ui/Misc";
import { Dropdown } from "@/ui/Dropdown";
import { cn } from "@/utils/cn";
import type { ReportDefinition } from "@/types/report-types";

export function ReportsPage() {
  const { reports, addReport, updateReport, removeReport } = useAdminStore();
  const [activeReportId, setActiveReportId] = useState<string | null>(null);
  const [isBuilding, setIsBuilding] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [editingReport, setEditingReport] = useState<ReportDefinition | undefined>();

  const activeReport = reports.find((r) => r.id === activeReportId);

  const handleCreate = () => {
    setEditingReport(undefined);
    setIsBuilding(true);
  };

  const handleEdit = (report: ReportDefinition) => {
    setEditingReport(report);
    setIsBuilding(true);
  };

  const handleSave = (report: ReportDefinition) => {
    if (editingReport) {
      updateReport(report.id, report);
    } else {
      addReport(report);
    }
    setIsBuilding(false);
    setActiveReportId(report.id);
  };

  if (isBuilding) {
    return (
      <div className="p-6">
        <ReportBuilder 
          initialReport={editingReport} 
          onSave={handleSave} 
          onCancel={() => setIsBuilding(false)} 
        />
      </div>
    );
  }

  if (activeReport) {
    return (
      <div className="flex flex-col gap-6 p-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[hsl(var(--border))] pb-6 shrink-0">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setActiveReportId(null)} className="h-10 w-10">
              <ChevronRight className="h-5 w-5 rotate-180" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                 <h1 className="text-2xl font-black tracking-tight">{activeReport.name}</h1>
                 <div className="bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest leading-none">
                    Live
                 </div>
              </div>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5 font-medium opacity-70">
                {activeReport.description || "Live data visualization overview"}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant={isCustomizing ? "secondary" : "outline"} 
              onClick={() => setIsCustomizing(!isCustomizing)}
              className={cn(
                "gap-1.5 rounded-xl px-5 font-bold transition-all",
                isCustomizing && "bg-[hsl(var(--primary))] text-white"
              )}
            >
              <Settings2 className={cn("h-4 w-4", isCustomizing && "animate-spin")} />
              {isCustomizing ? "Finish Customizing" : "Customize Layout"}
            </Button>
            <Button onClick={handleCreate} className="gap-1.5 rounded-xl px-5 font-black shadow-lg shadow-[hsl(var(--primary)/0.2)]">
              <Plus className="h-4 w-4" />
              New Report
            </Button>
          </div>
        </div>

        <div className="flex-1 w-full relative h-[calc(100vh-200px)]">
          <WidgetGrid 
            report={activeReport} 
            isEditing={isCustomizing}
            onLayoutChange={(newLayout: RGL.Layout[]) => {
               const updatedWidgets = activeReport.widgets.map(w => {
                 const layoutSnapshot = newLayout.find(l => l.i === w.id);
                 if (layoutSnapshot) {
                    return { 
                      ...w, 
                      layout: {
                        x: layoutSnapshot.x,
                        y: layoutSnapshot.y,
                        w: layoutSnapshot.w,
                        h: layoutSnapshot.h,
                        i: layoutSnapshot.i
                      } 
                    };
                 }
                 return w;
               });
               updateReport(activeReport.id, { widgets: updatedWidgets });
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 p-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-widest uppercase italic">Reports & Analytics</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1 font-medium opacity-60">
            Build custom dashboards and visualize your business metrics
          </p>
        </div>
        <Button onClick={handleCreate} className="gap-1.5 rounded-2xl px-8 py-6 font-black shadow-xl shadow-[hsl(var(--primary)/0.2)] transition-transform hover:scale-105 active:scale-95 text-lg">
          <Plus className="h-5 w-5" />
          Create New Report
        </Button>
      </div>

      {reports.length === 0 ? (
        <Card className="rounded-[40px] border-none shadow-2xl shadow-[hsl(var(--primary)/0.05)] overflow-hidden bg-linear-to-br from-[hsl(var(--background))] to-[hsl(var(--muted)/0.5)]">
           <CardContent className="p-0">
              <div className="grid md:grid-cols-2 gap-0 overflow-hidden">
                 <div className="p-12 flex flex-col justify-center gap-6">
                    <div className="h-14 w-14 bg-[hsl(var(--primary))] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-[hsl(var(--primary)/0.3)]">
                       <TrendingUp className="h-8 w-8" />
                    </div>
                    <div className="space-y-2">
                       <h2 className="text-3xl font-black tracking-tighter leading-tight uppercase">Analyze Your Data Like Never Before</h2>
                       <p className="text-[hsl(var(--muted-foreground))] font-medium text-lg leading-relaxed">
                          Connect any data source and build interactive dashboards with Line charts, Heatmaps, Area charts and more.
                       </p>
                    </div>
                    <div className="flex flex-col gap-3 pt-4">
                       <div className="flex items-center gap-3 text-sm font-bold opacity-70">
                          <TrendingUp className="h-4 w-4 text-emerald-500" />
                          <span>Dynamic KPI Tracking</span>
                       </div>
                       <div className="flex items-center gap-3 text-sm font-bold opacity-70">
                          <LayoutIcon className="h-4 w-4 text-indigo-500" />
                          <span>Flexible Grid Layouts</span>
                       </div>
                    </div>
                    <div className="pt-6">
                       <Button onClick={handleCreate} className="rounded-2xl px-12 py-7 font-black shadow-xl shadow-[hsl(var(--primary)/0.3)] text-xl">
                          Get Started
                       </Button>
                    </div>
                 </div>
                 <div className="bg-[hsl(var(--primary)/0.03)] p-12 hidden md:flex items-center justify-center relative overflow-hidden border-l border-[hsl(var(--border))/0.5]">
                    <div className="grid grid-cols-2 gap-4 w-full rotate-3 scale-110 opacity-30 select-none pointer-events-none">
                       <Card className="h-32 mb-4 bg-white/50 dark:bg-black/20" />
                       <Card className="h-48 bg-white/50 dark:bg-black/20" />
                       <Card className="h-48 -mt-16 bg-white/50 dark:bg-black/20" />
                       <Card className="h-32 bg-white/50 dark:bg-black/20" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                       <div className="h-64 w-64 bg-[hsl(var(--primary))] rounded-full blur-[120px] opacity-10" />
                    </div>
                 </div>
              </div>
           </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <Card 
              key={report.id} 
              className={cn(
                "group cursor-pointer border-none shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 rounded-[32px] overflow-hidden bg-[hsl(var(--card))]",
                "ring-1 ring-[hsl(var(--border))/0.5]"
              )}
              onClick={() => setActiveReportId(report.id)}
            >
              <CardHeader className="p-6 pb-2 flex flex-row items-center justify-between">
                <div className="bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] p-4 rounded-3xl group-hover:bg-[hsl(var(--primary))] group-hover:text-white transition-all duration-500 shadow-sm">
                   <LayoutIcon className="h-7 w-7" />
                </div>
                <Dropdown 
                  trigger={
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  }
                  items={[
                    { label: "Open Report", icon: <ExternalLink className="h-3.5 w-3.5" />, onClick: () => setActiveReportId(report.id) },
                    { label: "Configure", icon: <Settings2 className="h-3.5 w-3.5" />, onClick: () => handleEdit(report) },
                    { label: "Delete", icon: <Trash2 className="h-3.5 w-3.5" />, onClick: () => removeReport(report.id), variant: "destructive" },
                  ]}
                />
              </CardHeader>
              <CardContent className="p-8 pt-4">
                <div className="mb-6">
                  <h3 className="text-2xl font-black tracking-tight leading-tight mb-2 truncate group-hover:text-[hsl(var(--primary))] transition-colors">{report.name}</h3>
                  <p className="text-sm text-[hsl(var(--muted-foreground))] font-medium opacity-70 line-clamp-2 leading-relaxed">
                    {report.description || "Visualize your key performance indicators and API data."}
                  </p>
                </div>
                
                <div className="flex items-center gap-6 border-t border-[hsl(var(--border))/0.5] pt-6 opacity-60 group-hover:opacity-100 transition-opacity">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] uppercase font-black tracking-widest text-[hsl(var(--muted-foreground))]">Widgets</span>
                    <div className="flex items-center gap-1.5 font-black text-sm">
                       <Grid className="h-3.5 w-3.5 opacity-40" />
                       {report.widgets.length}
                    </div>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] uppercase font-black tracking-widest text-[hsl(var(--muted-foreground))]">Updated</span>
                    <div className="flex items-center gap-1.5 font-black text-sm">
                       <Calendar className="h-3.5 w-3.5 opacity-40" />
                       {new Date(report.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="ml-auto">
                    <div className="h-10 w-10 bg-[hsl(var(--muted)/0.5)] rounded-2xl flex items-center justify-center group-hover:bg-[hsl(var(--primary))] group-hover:text-white transition-all duration-500">
                       <ChevronRight className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          <button 
            onClick={handleCreate}
            className="flex flex-col items-center justify-center gap-4 p-8 border-2 border-dashed border-[hsl(var(--border))] rounded-[32px] bg-[hsl(var(--muted)/0.1)] hover:bg-[hsl(var(--muted)/0.3)] hover:border-[hsl(var(--primary))] transition-all duration-300 group"
          >
            <div className="h-14 w-14 rounded-3xl bg-[hsl(var(--muted))] flex items-center justify-center text-[hsl(var(--muted-foreground))] group-hover:bg-[hsl(var(--primary))] group-hover:text-white transition-all duration-500 shadow-sm">
               <Plus className="h-7 w-7" />
            </div>
            <div className="text-center">
              <span className="text-lg font-black tracking-tight block">Add New View</span>
              <span className="text-xs font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-widest opacity-60">Design a custom layout</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
