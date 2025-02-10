"use client";
import { useEffect, useRef } from "react";
import {
  Chart,
  Title,
  Tooltip,
  Legend,
  ArcElement, // Required for pie charts
  DoughnutController, // Required to enable "pie" charts
} from "chart.js";

// Register components required for the "pie" chart
Chart.register(Title, Tooltip, Legend, ArcElement, DoughnutController);

export default function PieChart() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Chart.js data and options
    const data = {
      labels: ["Active devices", "Offline devices", "Inactive devices"], // Labels for the pie chart
      datasets: [
        {
          label: "Dataset Example",
          data: [30, 60, 10], // Data values for each slice
          backgroundColor: [
            "rgba(255, 99, 132, 0.6)", // Red
            "rgba(54, 162, 235, 0.6)", // Blue
            "rgba(255, 206, 86, 0.6)", // Yellow
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
          ],
          borderWidth: 1,
        },
      ],
    };

 const options = {
   responsive: true,
   plugins: {
     legend: {
       display: true,
       position: "bottom" as const, // Change this line
     },
     title: {
       display: false,
       text: "",
     },
   },
 };



    // Get the canvas context
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    // Create the chart instance
    const chartInstance = new Chart(ctx, {
      type: "doughnut", // Change the type to "pie"
      data,
      options,
    });

    // Cleanup chart instance on component unmount
    return () => {
      chartInstance.destroy();
    };
  }, []);

  return (
    <div
      style={{ width: "23vw" }}
    >
      <canvas ref={canvasRef} width="400px" height="400px"></canvas>
    </div>
  );
}
