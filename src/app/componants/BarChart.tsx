"use client";
import { useEffect, useRef } from "react";
import {
  Chart,
  LinearScale,
  CategoryScale,
  BarElement, // Use BarElement for bar charts
  Title,
  Tooltip,
  Legend,
  BarController, // Use BarController for bar chart
} from "chart.js";
import { getRelativePosition } from "chart.js/helpers";

// Register necessary components for "bar" chart
Chart.register(
  LinearScale, // For scaling on y and x axes
  CategoryScale, // For category-based x axis (like labels)
  BarElement, // For bars in the chart
  Title, // For chart title
  Tooltip, // For tooltips
  Legend, // For the legend
  BarController // This is crucial for using "bar" chart type
);

export default function BarChart() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart<"bar", number[], string> | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Chart.js data and options
    const data = {
      labels: ["02", "02", "03", "04"],
      datasets: [
        {
          label: "",
          data: [65, 59, 80, 81],
          backgroundColor: [
            "rgba(0, 181, 98, 0.2)",
            "rgba(0, 181, 98, 0.4)",
            "rgba(0, 181, 98, 0.5)",
            "rgba(0, 181, 98, 0.8)",
          ],
          borderWidth: 1,
        },
      ],
    };

    const options = {
      plugins: {
        legend: {
          display: false, // This disables the legend entirely
        },
      },
      onClick: (event: any, elements: any[], chart: any) => {
        if (!chart) return;

        if (elements.length > 0) {
          const canvasPosition = getRelativePosition(event, chart);

          // Substitute the appropriate scale IDs
          const dataX = chart.scales.x.getValueForPixel(canvasPosition.x);
          const dataY = chart.scales.y.getValueForPixel(canvasPosition.y);

          console.log(`X: ${dataX}, Y: ${dataY}`);
        }
      },
    };

    // Get the canvas context
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    // Create the chart instance and store it in the ref
    chartRef.current = new Chart(ctx, {
      type: "bar", // Change the type to "bar" to create a bar chart
      data: data,
      options: options as any, // Use "as any" to suppress strict typing errors
    });

    // Cleanup chart instance on component unmount
    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, []);

  return (
    <div>
      <canvas ref={canvasRef} width="100px" height="100px"></canvas>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "0px",
        }}
      >
        <button
          style={{ padding: "10px 1.56vw", border: "none", fontSize: "12px" }}
        >
          Daily
        </button>
        <button
          style={{ padding: "10px 1.56vw", border: "none", fontSize: "12px" }}
        >
          1 week
        </button>
        <button
          style={{ padding: "10px 1.56vw", border: "none", fontSize: "12px" }}
        >
          1 month
        </button>
        <button
          style={{ padding: "10px 1.56vw", border: "none", fontSize: "12px" }}
        >
          3 months
        </button>
      </div>
    </div>
  );
}
