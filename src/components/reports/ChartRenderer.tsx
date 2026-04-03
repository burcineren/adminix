import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { ReportWidget, ReportDataItem } from "@/types/report-types";
import { cn } from "@/utils/cn";
import { ArrowUpRight, ArrowDownRight, TrendingUp } from "lucide-react";

interface ChartRendererProps {
  widget: ReportWidget;
  data: ReportDataItem[];
}

const DEFAULT_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--primary)/0.7)",
  "hsl(var(--primary)/0.5)",
  "hsl(var(--primary)/0.3)",
  "hsl(221, 83%, 53%)",
  "hsl(262, 83%, 58%)",
  "hsl(142, 71%, 45%)",
  "hsl(346, 84%, 50%)",
];

interface TooltipPayload {
  name?: string | number;
  value?: number | string | readonly (number | string)[];
  color?: string;
  dataKey?: string | number | ((obj: unknown) => unknown);
  payload?: Record<string, unknown>;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: readonly TooltipPayload[];
  label?: string | number;
  prefix?: string;
  suffix?: string;
}

const CustomTooltip = ({ active, payload, label, prefix, suffix }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 shadow-xl backdrop-blur-md">
        <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-[hsl(var(--muted-foreground))] opacity-70 text-left">
          {label}
        </p>
        <div className="space-y-1">
          {payload.map((item: TooltipPayload, i: number) => (
            <div key={i} className="flex items-center gap-3 text-left">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs font-bold text-[hsl(var(--foreground))]">
                {item.name}:
              </span>
              <span className="ml-auto text-xs font-medium tabular-nums">
                {prefix}
                {item.value}
                {suffix}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export function ChartRenderer({ widget, data }: ChartRendererProps) {
  const { type, config } = widget;

  if (type === "kpi") {
    const rawValue =
      data.length > 0
        ? config.valueField
          ? data[0][config.valueField]
          : data[0]
        : 0;
    const value = typeof rawValue === "number" ? rawValue : 0;
    const formattedValue = new Intl.NumberFormat().format(value);

    const isPositive = true;
    const trend = "+12.5%";

    return (
      <div className="flex flex-col gap-2 p-1">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold tracking-tight">
            {config.prefix}
            {formattedValue}
            {config.suffix}
          </div>
          <div
            className={cn(
              "flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold",
              isPositive
                ? "bg-emerald-500/10 text-emerald-500"
                : "bg-rose-500/10 text-rose-500",
            )}
          >
            {isPositive ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            {trend}
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))]">
          <TrendingUp className="h-3 w-3 opacity-50" />
          <span>vs last period</span>
        </div>
      </div>
    );
  }

  if (type === "table") {
    if (!data.length)
      return (
        <div className="flex h-full items-center justify-center text-sm text-[hsl(var(--muted-foreground))]">
          No data available
        </div>
      );
    const keys = Object.keys(data[0]);
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[hsl(var(--border))]">
              {keys.map((k) => (
                <th
                  key={k}
                  className="p-2 font-black uppercase tracking-widest opacity-50 text-left"
                >
                  {k}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 10).map((row, i) => (
              <tr
                key={i}
                className="border-b border-[hsl(var(--border))/0.5] hover:bg-[hsl(var(--muted)/0.3)] transition-colors"
              >
                {keys.map((k) => (
                  <td key={k} className="p-2 font-medium">
                    {String(row[k])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  const chartColors = config.colors || DEFAULT_COLORS;

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        {type === "line" ? (
          <LineChart
            data={data}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            {config.showGrid && (
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="hsl(var(--border))"
                opacity={0.5}
              />
            )}
            <XAxis
              dataKey={config.xAxisField}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            />
            <Tooltip
              content={(props) => (
                <CustomTooltip
                  {...props}
                  prefix={config.prefix}
                  suffix={config.suffix}
                />
              )}
              cursor={{
                stroke: "hsl(var(--primary))",
                strokeWidth: 1,
                opacity: 0.1,
              }}
            />
            {config.showLegend && (
              <Legend wrapperStyle={{ fontSize: 10, paddingTop: 10 }} />
            )}
            {config.seriesFields?.map((field, i) => (
              <Line
                key={field}
                type="monotone"
                dataKey={field}
                stroke={chartColors[i % chartColors.length]}
                strokeWidth={2.5}
                dot={{ r: 4, strokeWidth: 2, fill: "hsl(var(--card))" }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            ))}
          </LineChart>
        ) : type === "bar" ? (
          <BarChart
            data={data}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            {config.showGrid && (
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="hsl(var(--border))"
                opacity={0.5}
              />
            )}
            <XAxis
              dataKey={config.xAxisField}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            />
            <Tooltip
              content={(props) => (
                <CustomTooltip
                  {...props}
                  prefix={config.prefix}
                  suffix={config.suffix}
                />
              )}
              cursor={{ fill: "hsl(var(--muted))", opacity: 0.2 }}
            />
            {config.showLegend && (
              <Legend wrapperStyle={{ fontSize: 10, paddingTop: 10 }} />
            )}
            {config.seriesFields?.map((field, i) => (
              <Bar
                key={field}
                dataKey={field}
                fill={chartColors[i % chartColors.length]}
                radius={[4, 4, 0, 0]}
                stackId={config.stack ? "a" : undefined}
              />
            ))}
          </BarChart>
        ) : type === "area" ? (
          <AreaChart
            data={data}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <defs>
              {config.seriesFields?.map((field, i) => (
                <linearGradient
                  key={field}
                  id={`gradient-${field}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={chartColors[i % chartColors.length]}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor={chartColors[i % chartColors.length]}
                    stopOpacity={0}
                  />
                </linearGradient>
              ))}
            </defs>
            {config.showGrid && (
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="hsl(var(--border))"
                opacity={0.5}
              />
            )}
            <XAxis
              dataKey={config.xAxisField}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            />
            <Tooltip
              content={(props) => (
                <CustomTooltip
                  {...props}
                  prefix={config.prefix}
                  suffix={config.suffix}
                />
              )}
            />
            {config.showLegend && (
              <Legend wrapperStyle={{ fontSize: 10, paddingTop: 10 }} />
            )}
            {config.seriesFields?.map((field, i) => (
              <Area
                key={field}
                type="monotone"
                dataKey={field}
                stroke={chartColors[i % chartColors.length]}
                fillOpacity={1}
                fill={`url(#gradient-${field})`}
                strokeWidth={2}
                stackId={config.stack ? "a" : undefined}
              />
            ))}
          </AreaChart>
        ) : type === "pie" ? (
          <PieChart>
            <Pie
              data={data}
              dataKey={config.valueField || "value"}
              nameKey={config.xAxisField || "name"}
              cx="50%"
              cy="50%"
              outerRadius={80}
              innerRadius={60}
              paddingAngle={5}
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={chartColors[index % chartColors.length]}
                />
              ))}
            </Pie>
            <Tooltip
              content={(props) => (
                <CustomTooltip
                  {...props}
                  prefix={config.prefix}
                  suffix={config.suffix}
                />
              )}
            />
            {config.showLegend && <Legend wrapperStyle={{ fontSize: 10 }} />}
          </PieChart>
        ) : null}
      </ResponsiveContainer>
    </div>
  );
}
