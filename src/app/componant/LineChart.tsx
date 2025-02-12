"use client";
import { useEffect, useRef } from "react";
import {
  Chart,
  LinearScale,
  CategoryScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  LineController,
} from "chart.js";
import { getRelativePosition } from "chart.js/helpers";

// Register components required for the "line" chart
Chart.register(
  LinearScale,
  CategoryScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  LineController
);

export default function LineChart() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Chart.js data and options
    const data = {
      labels: ["01", "02", "03",],
      datasets: [
        {
          label: "My First Dataset",
          data: [0, 10, 20,],
          fill: false,
          borderColor: "rgb(75, 192, 192)",
          tension: 0.1, // Curved line tension
        },
      ],
    };

    const options = {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          position: "top",
        },
        title: {
          display: true,
          text: "",
        },
      },
      scales: {
        x: {
          beginAtZero: true,
        },
        y: {
          beginAtZero: true,
        },
      },
    };

    // Get the canvas context
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    // Create the chart instance
    const chartInstance = new Chart(ctx, {
      type: "line",
      data,
    
    });

    // Cleanup chart instance on component unmount
    return () => {
      chartInstance.destroy();
    };
  }, []);

  return (
    <div>
      <canvas ref={canvasRef} width="400" height="400"></canvas>;
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
          1 Month
        </button>
        <button
          style={{ padding: "10px 1.56vw", border: "none", fontSize: "12px" }}
        >
          1 year
        </button>
        <button
          style={{ padding: "10px 1.56vw", border: "none", fontSize: "12px" }}
        >
          max
        </button>
      </div>
    </div>
  ); 
}
