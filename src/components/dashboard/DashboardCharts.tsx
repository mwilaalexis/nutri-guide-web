import { useMemo } from "react";
import { Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import type { DailyMealSummaryDto } from "../../Types/global-types";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

function shortDayLabel(isoDate: string): string {
  const d = new Date(isoDate + "T12:00:00");
  return d.toLocaleDateString(undefined, { weekday: "short", day: "numeric" });
}

function slotCalories(meals: { calories?: number }[] | undefined): number {
  return (meals ?? []).reduce((s, m) => s + (Number(m.calories) || 0), 0);
}

const lineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 800, easing: "easeOutQuart" as const },
  interaction: { mode: "index" as const, intersect: false },
  plugins: {
    legend: { position: "top" as const, labels: { usePointStyle: true } },
  },
  scales: {
    y: {
      beginAtZero: true,
      title: { display: true, text: "kcal" },
      grid: { color: "rgba(0,0,0,0.06)" },
    },
    x: { grid: { display: false } },
  },
};

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 900, easing: "easeOutBack" as const },
  plugins: {
    legend: { position: "right" as const },
  },
};

type Props = {
  planDays: DailyMealSummaryDto[];
  today: DailyMealSummaryDto | null;
  targetPerDay: number;
};

export default function DashboardCharts({ planDays, today, targetPerDay }: Props) {
  const lineData = useMemo(() => {
    const labels = planDays.map((d) => shortDayLabel(d.date));
    const totals = planDays.map((d) => d.totalCalories ?? 0);

    const datasets: {
      type: "line";
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
      borderWidth?: number;
      borderDash?: number[];
      fill?: boolean | number | string;
      tension?: number;
      pointRadius?: number;
      pointHoverRadius?: number;
      pointBackgroundColor?: string;
    }[] = [
      {
        type: "line",
        label: "Daily total",
        data: totals,
        borderColor: "rgb(43, 138, 62)",
        backgroundColor: "rgba(43, 138, 62, 0.12)",
        borderWidth: 2,
        fill: true,
        tension: 0.35,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: "rgb(43, 138, 62)",
      },
    ];

    if (targetPerDay > 0) {
      datasets.push({
        type: "line",
        label: "Plan average",
        data: planDays.map(() => targetPerDay),
        borderColor: "rgba(100, 100, 100, 0.85)",
        backgroundColor: "transparent",
        borderWidth: 2,
        borderDash: [6, 4],
        fill: false,
        tension: 0,
        pointRadius: 0,
        pointHoverRadius: 0,
      });
    }

    return { labels, datasets };
  }, [planDays, targetPerDay]);

  const doughnutData = useMemo(() => {
    if (!today) return null;
    const slots = [
      { label: "Breakfast", value: slotCalories(today.breakfast) },
      { label: "Lunch", value: slotCalories(today.lunch) },
      { label: "Dinner", value: slotCalories(today.dinner) },
      { label: "Snacks", value: slotCalories(today.snacks) },
    ].filter((s) => s.value > 0);

    if (slots.length === 0) return null;

    return {
      labels: slots.map((s) => s.label),
      datasets: [
        {
          data: slots.map((s) => s.value),
          backgroundColor: ["#40916c", "#52b788", "#95d5b2", "#2d6a4f"],
          borderWidth: 2,
          borderColor: "#fff",
          hoverOffset: 8,
        },
      ],
    };
  }, [today]);

  if (!planDays.length) return null;

  return (
    <div className="dash-chartjs-grid">
      <div className="dash-chartjs-card">
        <h3 className="dash-chartjs-card__title">Calorie trend</h3>
        <p className="dash-chartjs-card__hint">Interactive line chart — hover points for details.</p>
        <div className="dash-chartjs-card__canvas">
          <Line data={lineData} options={lineOptions} />
        </div>
      </div>

      {doughnutData ? (
        <div className="dash-chartjs-card">
          <h3 className="dash-chartjs-card__title">Today by meal</h3>
          <p className="dash-chartjs-card__hint">Share of calories in the day shown on your dashboard.</p>
          <div className="dash-chartjs-card__canvas dash-chartjs-card__canvas--doughnut">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>
      ) : (
        <div className="dash-chartjs-card dash-chartjs-card--empty">
          <h3 className="dash-chartjs-card__title">Today by meal</h3>
          <p className="dash-chartjs-card__hint muted">No meal calories for the selected day yet.</p>
        </div>
      )}
    </div>
  );
}
