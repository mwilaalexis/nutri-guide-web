import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function MacrosChart() {
  const data = {
    labels: ["Protéines", "Glucides", "Lipides"],
    datasets: [
      {
        label: "Grammes par jour",
        data: [120, 250, 70],
        backgroundColor: ["#2b8a3e", "#74c69d", "#40916c"],
        borderRadius: 8,
      },
    ],
  };

  return <Bar data={data} />;
}
