"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import style from "./page.module.css";

import { Tooltip } from "recharts";

export const description = "An interactive bar chart";

const chartData = [
  { date: "2024-04-01", desktop: 222, mobile: 150 },
  { date: "2024-04-02", desktop: 97, mobile: 180 },
  { date: "2024-04-03", desktop: 167, mobile: 120 },
  { date: "2024-04-04", desktop: 242, mobile: 260 },
  { date: "2024-04-05", desktop: 373, mobile: 290 },
  { date: "2024-04-06", desktop: 301, mobile: 340 },
  { date: "2024-04-07", desktop: 245, mobile: 180 },
  { date: "2024-04-08", desktop: 409, mobile: 320 },
  { date: "2024-04-09", desktop: 59, mobile: 110 },
  { date: "2024-04-10", desktop: 261, mobile: 190 },
  { date: "2024-04-11", desktop: 327, mobile: 350 },
  { date: "2024-04-12", desktop: 292, mobile: 210 },
  { date: "2024-04-13", desktop: 342, mobile: 380 },
  { date: "2024-04-14", desktop: 137, mobile: 220 },
  { date: "2024-04-15", desktop: 120, mobile: 170 },
  { date: "2024-04-16", desktop: 138, mobile: 190 },
  { date: "2024-04-17", desktop: 446, mobile: 360 },
  { date: "2024-04-18", desktop: 364, mobile: 410 },
  { date: "2024-04-19", desktop: 243, mobile: 180 },
];

const chartConfig = {
  type: "bar", // or "line" or "pie"
  data: chartData, // assuming chartData is an array of objects with string keys and any values
  options: {
    // add any options you need here
  },
  views: {
    label: "Page Views",
  },
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--chart-2))",
  },
} as ChartConfig;

 function Component() {
  const [activeChart, setActiveChart] = React.useState<
    keyof typeof chartConfig
  >("desktop" as keyof typeof chartConfig);

  const total = React.useMemo(
    () => ({
      desktop: chartData.reduce((acc, curr) => acc + curr.desktop, 0),
      mobile: chartData.reduce((acc, curr) => acc + curr.mobile, 0),
    }),
    []
  );

  return (
    <Card>
      <CardHeader style={{ display: "flex", flexDirection: "column", alignItems: "stretch", padding: "0px", borderBottom: "1px solid #e5e7eb"  }}>
        <div style={{display: "flex", flexDirection: "column", justifyContent:"center", gap: "10px", padding: "20px"}} >
          <CardTitle>Bar Chart - Interactive</CardTitle>
          <CardDescription>
            Showing total visitors for the last 3 months
          </CardDescription>
        </div>
        <div className="flex">
          {["desktop", "mobile"].map((key) => {
            const chart = key as keyof typeof chartConfig;
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
                onClick={() => setActiveChart(chart)}
              >
                <span className="text-xs text-muted-foreground">
                  {chartConfig[chart]?.label}
                </span>
                <span className="text-lg font-bold leading-none sm:text-3xl">
                  {total[key as keyof typeof total].toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />

            {/* ✅ Use Recharts Tooltip Instead */}
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload || payload.length === 0) return null;

                return (
                  <div
                    style={{
                      backgroundColor: "white",
                      border: "1px solid #d1d5db",
                      boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                      padding: "8px",
                      borderRadius: "6px",
                      fontSize: "14px",
                    }}
                  >
                    <p style={{ fontWeight: "bold", marginBottom: "4px" }}>
                      {new Date(label).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                    <p style={{ color: "#2563eb", margin: "2px 0" }}>
                      Desktop: {payload[0]?.value}
                    </p>
                    <p style={{ color: "#60a5fa", margin: "2px 0" }}>
                      Mobile: {payload[1]?.value ?? 0}
                    </p>
                  </div>
                );
              }}
              cursor={{ fill: "#f3f4f6" }}
            />

            <Bar dataKey={activeChart} fill={chartConfig[activeChart]?.color} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export default Component;
