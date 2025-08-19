import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { authenticatedFetch } from "@/lib/auth";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function CadetProgressChart() {
  const chartRef = useRef(null);

  // Mock data for now - replace with real API call
  const chartData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Academic Performance',
        data: [72, 76, 81, 85],
        borderColor: 'hsl(224, 64%, 33%)',
        backgroundColor: 'hsla(224, 64%, 33%, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Physical Fitness',
        data: [68, 74, 78, 82],
        borderColor: 'hsl(142, 72%, 29%)',
        backgroundColor: 'hsla(142, 72%, 29%, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Behavior Score',
        data: [85, 87, 89, 91],
        borderColor: 'hsl(42, 96%, 49%)',
        backgroundColor: 'hsla(42, 96%, 49%, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-card-foreground">Cadet Progress Overview</h3>
        <select 
          className="text-sm border border-border rounded-lg px-3 py-1 bg-background"
          data-testid="select-timeframe"
        >
          <option>Last 30 Days</option>
          <option>Last 3 Months</option>
          <option>Last Year</option>
        </select>
      </div>
      <div className="h-64">
        <Line ref={chartRef} data={chartData} options={options} />
      </div>
    </div>
  );
}
