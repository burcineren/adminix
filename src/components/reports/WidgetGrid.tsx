import React from "react";
import { Responsive, WidthProvider } from "react-grid-layout/legacy";
import * as RGL from "react-grid-layout";
import { Card, CardHeader, CardContent } from "@/ui/Misc";
import { ChartRenderer } from "./ChartRenderer";
import type { ReportWidget, ReportDefinition, ReportDataItem } from "@/types/report-types";
import { apiClient } from "@/core/api-client";
import { useQuery } from "@tanstack/react-query";
import { MoreVertical, Trash2, Edit3, Loader2 } from "lucide-react";
import { Button } from "@/ui/Button";
import { Dropdown } from "@/ui/Dropdown";
import { cn } from "@/utils/cn";

// ResponsiveGridLayout with proper Typing
const ResponsiveGridLayout = WidthProvider(Responsive);

// ── Widget Wrapper ───────────────────────────────────────────────────────────

interface WidgetContainerProps { 
  widget: ReportWidget; 
  onRemove?: (id: string) => void;
  onEdit?: (id: string) => void;
  isEditing: boolean;
}

function WidgetContainer({ 
  widget, 
  onRemove, 
  onEdit,
  isEditing 
}: WidgetContainerProps) {
  const { data, isLoading, error } = useQuery<ReportDataItem[]>({
    queryKey: ["report-widget-data", widget.id, widget.dataSource],
    queryFn: async () => {
      const endpoint = widget.dataSource.endpoint || `/api/${widget.dataSource.resourceName}`;
      const response = await apiClient.get<ReportDataItem[] | { data: ReportDataItem[] }>(endpoint, widget.dataSource.params || {});
      
      if (Array.isArray(response)) {
        return response;
      }
      
      if (response && typeof response === "object" && "data" in response && Array.isArray(response.data)) {
        return response.data;
      }
      
      return [];
    },
    staleTime: 5 * 60 * 1000, 
  });

  const dropdownItems = [];
  if (onEdit) dropdownItems.push({ label: "Edit", icon: <Edit3 className="h-3.5 w-3.5" />, onClick: () => onEdit(widget.id) });
  if (onRemove) dropdownItems.push({ label: "Delete", icon: <Trash2 className="h-3.5 w-3.5" />, onClick: () => onRemove(widget.id), variant: "destructive" as const });

  return (
    <Card className={cn(
      "h-full flex flex-col group/widget overflow-hidden transition-all duration-300",
      isEditing && "ring-2 ring-[hsl(var(--primary)/0.2)]"
    )}>
      <CardHeader className="flex flex-row items-center justify-between p-3 pb-1 shrink-0 space-y-0 text-left">
        <div className="flex flex-col gap-0.5">
          <h3 className="text-xs font-black uppercase tracking-wider text-[hsl(var(--muted-foreground))] opacity-60">
            {widget.title}
          </h3>
          {widget.description && (
            <p className="text-[10px] text-[hsl(var(--muted-foreground))] line-clamp-1">{widget.description}</p>
          )}
        </div>
        
        {isEditing && (
          <div className="flex items-center gap-1 opacity-100 transition-opacity">
            <Dropdown
              trigger={
                <Button variant="ghost" size="icon" className="h-6 w-6">
                   <MoreVertical className="h-3.5 w-3.5" />
                </Button>
              }
              items={dropdownItems}
            />
          </div>
        )}
      </CardHeader>
      
      <CardContent className="flex-1 p-3 pt-2 overflow-hidden relative">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-[hsl(var(--primary))] opacity-50" />
          </div>
        ) : error ? (
          <div className="flex h-full items-center justify-center text-[10px] text-rose-500 font-medium text-center">
            Error loading data
          </div>
        ) : (
          <ChartRenderer widget={widget} data={data || []} />
        )}
      </CardContent>
    </Card>
  );
}

// ── Widget Grid Component ────────────────────────────────────────────────────

interface WidgetGridProps {
  report: ReportDefinition;
  onLayoutChange?: (newLayout: RGL.Layout[]) => void;
  onRemoveWidget?: (id: string) => void;
  onEditWidget?: (id: string) => void;
  isEditing?: boolean;
}

export function WidgetGrid({ 
  report, 
  onLayoutChange, 
  onRemoveWidget,
  onEditWidget,
  isEditing = false 
}: WidgetGridProps) {
  const layouts = {
    lg: report.widgets.map((w) => w.layout),
  };

  return (
    <div className="w-full h-full min-h-[400px]">
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={100}
        draggableHandle=".widget-drag-handle"
        isDraggable={isEditing}
        isResizable={isEditing}
        onLayoutChange={(current: RGL.Layout[]) => onLayoutChange?.(current)}
        margin={[16, 16]}
      >
        {report.widgets.map((widget) => (
          <div key={widget.id} data-grid={widget.layout} className="relative">
            {isEditing && (
              <div className="widget-drag-handle absolute top-0 left-0 right-0 h-8 cursor-move z-10" />
            )}
            <WidgetContainer 
              widget={widget} 
              onRemove={onRemoveWidget}
              onEdit={onEditWidget}
              isEditing={isEditing}
            />
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
}
