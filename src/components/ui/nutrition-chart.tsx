"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface NutritionChartProps {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export function NutritionChart({ calories, protein, carbs, fat }: NutritionChartProps) {
  const data = [
    { name: "Protein", value: protein, fill: "var(--secondary)" },
    { name: "Carbs", value: carbs, fill: "var(--accent)" },
    { name: "Fat", value: fat, fill: "var(--primary)" },
  ];

  return (
    <div className="w-full flex flex-col items-center">
      <div className="relative w-full h-64 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="60%"
              outerRadius="80%"
              paddingAngle={5}
              dataKey="value"
              stroke="none"
              isAnimationActive={true}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: any) => [`${value}g`]}
              contentStyle={{ 
                borderRadius: "8px", 
                border: "1px solid var(--border)", 
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                backgroundColor: "var(--background)",
                color: "var(--foreground)"
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center Calories Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-4xl font-black text-[var(--primary)] leading-none">{calories}</span>
          <span className="text-xs font-semibold text-foreground-muted uppercase tracking-widest mt-1">Calories</span>
        </div>
      </div>
      
      {/* Legend below the chart */}
      <div className="flex flex-wrap justify-center gap-6 mt-4">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-2.5">
            <div className="w-3.5 h-3.5 rounded-full shadow-sm" style={{ backgroundColor: item.fill }} />
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold text-foreground-muted uppercase tracking-wider">{item.name}</span>
              <span className="text-sm font-bold text-[var(--foreground)] leading-none mt-0.5">{item.value}g</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
