"use client";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Define Props Type
interface DepartmentChartProps {
  data: {
    department: string;
    dinnerRequests: number;
    lunchRequests: number;
  }[];
}

const DepartmentChart: React.FC<DepartmentChartProps> = ({ data }) => {
  const chartData = {
    labels: data.map((d) => d.department),
    datasets: [
      {
        label: "Dinner Requests",
        data: data.map((d) => d.dinnerRequests),
        backgroundColor: "rgba(75, 192, 192, 0.5)",
      },
      {
        label: "Lunch Requests",
        data: data.map((d) => d.lunchRequests),
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
    ],
  };

  return (
    <Bar
      data={chartData}
      options={{
        responsive: true,
        plugins: {
          legend: {
            position: "top",
          },
        },
      }}
    />
  );
};

export default DepartmentChart;
