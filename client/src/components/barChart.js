import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

// ลงทะเบียน components ของ Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const BarChart = ({ data, options }) => {
  const containerWidth = Math.max(800, data.labels.length * 75); // ปรับความกว้างตามจำนวน labels

  return (
    <div
      className={`w-full ${
        data.labels.length > 10
          ? "overflow-x-auto scrollbar-hide"
          : "overflow-x-auto scrollbar-hide w-full"
      }`}
      style={{ height: "600px" }} // ความสูงแบบ fix
    >
      <div
        style={{
          width: `${containerWidth}px`,
          minWidth: "100%",
          height: "100%",
        }}
      >
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default BarChart;
