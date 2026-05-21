import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

import { PlansService } from "../services/plans.service";

import type { PlanSummaryDto, MealSummaryDto } from "../Types/global-types";
import { toPlanSummaryDto } from "../utils/normalize";
import FoodImage from "../components/media/FoodImage";
import { exportPlan, type PlanExportFormat } from "../utils/planExport";

type Feedback = { type: "success" | "error"; message: string } | null;

function planStatusBadgeClass(status: string | undefined) {
  const s = (status ?? "").toLowerCase();
  if (s.includes("active") || s.includes("complete")) return "plans-badge plans-badge--ok";
  if (s.includes("draft") || s.includes("pending")) return "plans-badge plans-badge--warn";
  if (s.includes("fail") || s.includes("cancel")) return "plans-badge plans-badge--err";
  return "plans-badge";
}

export default function PlanDetails() {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const planBackPath = planId ? `/dashboard/plans/${planId}` : "/dashboard/plans";

  const [plan, setPlan] = useState<PlanSummaryDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const sliderRef = useRef<HTMLDivElement>(null);
  const dayRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeDayIndex, setActiveDayIndex] = useState(0);

  const showFeedback = useCallback((f: Feedback) => {
    setFeedback(f);
    if (f) window.setTimeout(() => setFeedback(null), 5000);
  }, []);

  const runExport = useCallback(
    async (format: PlanExportFormat) => {
      if (!planId || !plan) return;
      try {
        await exportPlan(planId, format, plan);
        const labels: Record<PlanExportFormat, string> = {
          pdf: "PDF",
          docx: "Word",
        };
        showFeedback({ type: "success", message: `${labels[format]} downloaded.` });
      } catch {
        showFeedback({ type: "error", message: "Could not export file." });
      }
    },
    [planId, plan, showFeedback],
  );

  useEffect(() => {
    if (!planId) {
      setError("Invalid plan ID");
      setLoading(false);
      return;
    }
    loadPlan();
  }, [planId]);

  const loadPlan = async () => {
    if (!planId) return;
    try {
      setLoading(true);
      const res = await PlansService.getById(planId);
      const parsed = toPlanSummaryDto(res.data);
      if (!parsed) {
        setError("Unable to load this plan.");
        setPlan(null);
        return;
      }
      setPlan(parsed);
      setError(null);
      setActiveDayIndex(0);
    } catch {
      setError("Unable to load this plan.");
      setPlan(null);
    } finally {
      setLoading(false);
    }
  };

  const sortedDays = useMemo(() => {
    if (!plan?.days?.length) return [];
    return [...plan.days].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [plan]);

  const weekCalories = useMemo(
    () => sortedDays.reduce((sum, d) => sum + (d.totalCalories ?? 0), 0),
    [sortedDays]
  );

  const scrollSlider = (direction: number) => {
    const el = sliderRef.current;
    if (!el) return;
    const step = Math.min(360, Math.max(240, el.clientWidth * 0.85));
    el.scrollBy({ left: direction * step, behavior: "smooth" });
  };

  const scrollDayIntoView = (index: number) => {
    const el = dayRefs.current[index];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  };

  const goToDay = (index: number) => {
    setActiveDayIndex(index);
    scrollDayIntoView(index);
  };

  const openFood = (meal: MealSummaryDto) => {
    if (!meal.foodId) {
      showFeedback({ type: "error", message: "No food details available for this meal." });
      return;
    }
    navigate(`/dashboard/foods/${meal.foodId}`, { state: { from: planBackPath } });
  };

  const openSwap = (meal: MealSummaryDto) => {
    if (!planId) return;
    navigate(`/dashboard/plans/${planId}/swap/${meal.id}`);
  };

  const openRegenerate = (meal: MealSummaryDto) => {
    if (!planId) return;
    navigate(`/dashboard/plans/${planId}/regenerate/${meal.id}`);
  };

  if (loading) {
    return (
      <div className="plan-details flex min-h-[40vh] items-center justify-center text-[var(--text-light)]">
        <p>Loading plan…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="plan-details mx-auto max-w-lg px-4 py-10 text-center">
        <p className="text-danger mb-4">{error}</p>
        <Link to="/dashboard/plans" className="btn btn-primary">
          Back to plans
        </Link>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="plan-details mx-auto max-w-lg px-4 py-10 text-center">
        <p className="mb-4 text-[var(--text-light)]">Plan not found.</p>
        <Link to="/dashboard/plans" className="btn btn-primary">
          Back to plans
        </Link>
      </div>
    );
  }

  const firstDay = sortedDays[0];
  const lastDay = sortedDays[sortedDays.length - 1];

  return (
    <main className="plan-details w-full max-w-[1200px] px-0">
      {feedback && (
        <div
          className={`app-status mb-6 ${
            feedback.type === "success" ? "app-status--ok" : "app-status--err"
          }`}
          role="status"
        >
          {feedback.message}
        </div>
      )}

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link to="/dashboard/plans" className="btn btn-link mb-0 self-start p-0 text-left sm:self-auto">
          ← Back to plans
        </Link>
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button type="button" className="btn btn-light btn-sm" onClick={() => loadPlan()}>
            Refresh plan
          </button>
          <button type="button" className="btn btn-light btn-sm" onClick={() => void runExport("pdf")}>
            Download PDF
          </button>
          <button type="button" className="btn btn-light btn-sm" onClick={() => void runExport("docx")}>
            Download Word
          </button>
        </div>
      </div>

      <header className="plan-page-header mb-6 border-b border-[var(--surface-strong)] pb-6">
        <div className="plan-page-header__row">
          <div className="min-w-0">
            <p className="plan-page-kicker">Nutrition plan</p>
            <h1 className="page-title m-0 text-2xl sm:text-3xl">Meal plan</h1>
            {firstDay && lastDay ? (
              <p className="date-range m-0 mt-2 text-sm sm:text-base">
                {new Date(firstDay.date).toLocaleDateString(undefined, {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}{" "}
                —{" "}
                {new Date(lastDay.date).toLocaleDateString(undefined, {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            ) : null}
            {plan.generatedAt ? (
              <p className="plan-page-meta m-0 mt-1 text-xs text-[var(--text-light)] sm:text-sm">
                Generated {new Date(plan.generatedAt).toLocaleString()}
              </p>
            ) : null}
          </div>
          <span className={`shrink-0 ${planStatusBadgeClass(plan.status)}`}>{plan.status}</span>
        </div>

        <div className="plan-stat-grid">
          <div className="plan-stat-tile">
            <span className="plan-stat-tile__label">Goal</span>
            <span className="plan-stat-tile__value">{plan.goal}</span>
          </div>
          <div className="plan-stat-tile">
            <span className="plan-stat-tile__label">Diet</span>
            <span className="plan-stat-tile__value">{plan.dietStyle}</span>
          </div>
          <div className="plan-stat-tile">
            <span className="plan-stat-tile__label">Avg / day</span>
            <span className="plan-stat-tile__value">{plan.averageCaloriesPerDay} kcal</span>
          </div>
          <div className="plan-stat-tile">
            <span className="plan-stat-tile__label">Week total</span>
            <span className="plan-stat-tile__value">
              {weekCalories > 0 ? weekCalories : plan.totalCalories ?? 0} kcal
            </span>
          </div>
          <div className="plan-stat-tile">
            <span className="plan-stat-tile__label">Days</span>
            <span className="plan-stat-tile__value">{plan.totalDays ?? sortedDays.length}</span>
          </div>
        </div>
      </header>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="section-title m-0 text-xl font-semibold text-[var(--accent-dark)] sm:text-2xl">
            Daily breakdown
          </h2>
          <p className="m-0 mt-1 text-xs text-[var(--text-light)] sm:text-sm">
            Use the day chips to jump, or scroll the row horizontally.
          </p>
        </div>
        <div className="slider-controls m-0 flex w-full gap-2 sm:w-auto">
          <button type="button" onClick={() => scrollSlider(-1)} className="btn btn-light btn-sm flex-1 sm:flex-initial">
            Previous
          </button>
          <button type="button" onClick={() => scrollSlider(1)} className="btn btn-light btn-sm flex-1 sm:flex-initial">
            Next
          </button>
        </div>
      </div>

      {sortedDays.length > 0 ? (
        <nav className="plan-day-strip" aria-label="Jump to day">
          {sortedDays.map((day, index) => {
            const d = new Date(day.date);
            const label = d.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
            const active = index === activeDayIndex;
            return (
              <button
                key={day.dayId || `day-${day.date}`}
                type="button"
                className={`plan-day-chip${active ? " plan-day-chip--active" : ""}`}
                onClick={() => goToDay(index)}
              >
                <span className="plan-day-chip__main">{label}</span>
                <span className="plan-day-chip__sub">{day.totalCalories ?? 0} kcal</span>
              </button>
            );
          })}
        </nav>
      ) : null}

      <div ref={sliderRef} className="days-slider plan-days-slider pb-3">
        {sortedDays.map((day, index) => (
          <div
            key={day.dayId || `day-${day.date}`}
            ref={(el) => {
              dayRefs.current[index] = el;
            }}
            className="day-slide plan-day-card card p-4 shadow-sm sm:p-5"
          >
            <div className="plan-day-card__head">
              <h3 className="day-title m-0 text-lg sm:text-xl">
                {new Date(day.date).toLocaleDateString(undefined, {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </h3>
              <p className="plan-day-card__kcal m-0 text-sm font-semibold text-[var(--accent-dark)] sm:text-base">
                {day.totalCalories ?? 0} kcal
              </p>
            </div>

            {renderCategory("Breakfast", day.breakfast, openFood, openSwap, openRegenerate)}
            {renderCategory("Lunch", day.lunch, openFood, openSwap, openRegenerate)}
            {renderCategory("Dinner", day.dinner, openFood, openSwap, openRegenerate)}
            {renderCategory("Snacks", day.snacks, openFood, openSwap, openRegenerate)}
          </div>
        ))}
      </div>

    </main>
  );
}

function renderCategory(
  title: string,
  meals: MealSummaryDto[] | undefined,
  onSelect: (m: MealSummaryDto) => void,
  onSwap: (m: MealSummaryDto) => void,
  onRegenerate: (m: MealSummaryDto) => void
) {
  if (!meals?.length) return null;

  return (
    <section className="meal-section">
      <h2 className="meal-section-title text-lg sm:text-xl">{title}</h2>

      <div className="meal-list">
        {meals.map((m) => (
          <div key={m.id} className="meal-item">
            <button
              type="button"
              className="meal-left m-0 cursor-pointer border-0 bg-transparent p-0 text-left"
              onClick={() => onSelect(m)}
            >
              <FoodImage src={m.imagePath} className="meal-photo" alt="" />
              <div className="min-w-0">
                <p className="meal-name">{m.name}</p>
                <p className="meal-calories">{m.calories} kcal</p>
              </div>
            </button>

            <div className="meal-actions">
              <button type="button" className="swap-btn" onClick={() => onSwap(m)}>
                Swap
              </button>
              <button type="button" className="regen-btn" onClick={() => onRegenerate(m)}>
                Regenerate
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
