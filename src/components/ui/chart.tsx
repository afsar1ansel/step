import React from "react";

// ChartContainer component
export const ChartContainer = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={`w-full h-[300px] ${className}`} {...props}>
      {children}
    </div>
  );
};

// ChartConfig type (example)
export type ChartConfig = {
  type: "line" | "bar" | "pie";
  data: Record<string, any>;
  options?: Record<string, any>;
};

// ChartTooltip component
export const ChartTooltip = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={`bg-background border rounded-md p-2 shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// ChartTooltipContent component
export const ChartTooltipContent = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={`text-sm ${className}`} {...props}>
      {children}
    </div>
  );
};
