import React from "react";

interface Point {
  x: number;
  y: number;
}

export function LineChart({ data = [30, 40, 35, 50, 49, 60, 70, 91, 125] }: { data?: number[] }) {
  const width = 500;
  const height = 200;
  const padding = 20;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min;

  const points: Point[] = data.map((val, i) => ({
    x: padding + (i * (width - padding * 2)) / (data.length - 1),
    y: height - padding - ((val - min) * (height - padding * 2)) / range,
  }));

  const pathD = `M ${points.map((p) => `${p.x},${p.y}`).join(" L ")}`;
  const areaD = `${pathD} L ${points[points.length - 1].x},${height} L ${points[0].x},${height} Z`;

  return (
    <div className="relative w-full h-full min-h-[200px] flex items-end">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full drop-shadow-lg"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Grid lines */}
        {[0, 1, 2, 3, 4].map((i) => (
          <line
            key={i}
            x1={padding}
            y1={padding + (i * (height - padding * 2)) / 4}
            x2={width - padding}
            y2={padding + (i * (height - padding * 2)) / 4}
            stroke="hsl(var(--muted))"
            strokeWidth="1"
            strokeDasharray="4,4"
            opacity="0.5"
          />
        ))}

        {/* Area */}
        <path d={areaD} fill="url(#chartGradient)" />
        
        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="animate-draw"
          style={{
            strokeDasharray: 1000,
            strokeDashoffset: 0,
          }}
        />

        {/* Points */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="4"
            fill="hsl(var(--background))"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            className="hover:r-6 transition-all cursor-pointer"
          />
        ))}
      </svg>
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes draw {
          from { stroke-dashoffset: 1000; }
          to { stroke-dashoffset: 0; }
        }
        .animate-draw {
          animation: draw 2s ease-out forwards;
        }
      `}} />
    </div>
  );
}
