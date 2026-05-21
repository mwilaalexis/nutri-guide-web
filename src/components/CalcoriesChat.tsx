import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

export default function CaloriesChart() {
  const data = {
    labels: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"],
    datasets: [
      {
        label: "Calories consommées",
        data: [1800, 1950, 1700, 2100, 2000, 1850, 2200],
        borderColor: "#2b8a3e",
        backgroundColor: "rgba(43, 138, 62, 0.2)",
        borderWidth: 3,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  return <Line data={data} />;
}
