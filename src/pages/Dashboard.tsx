import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PlansService } from "../services/plans.service";
import { FoodService } from "../services/food.service";
import { ProfileService } from "../services/profile.service";
import { httpErrorMessage } from "../utils/httpErrorMessage";
import DashboardCharts from "../components/dashboard/DashboardCharts";

import type {
  FoodDto,
  DailyMealSummaryDto,
  ProfileDto,
  MealSummaryDto,
  PlanSummaryDto,
} from "../Types/global-types";
import { asArray } from "../utils/normalize";
import {
  pickPlanDayForToday,
  countMealsOnDay,
  formatGoalCode,
  dayDateKey,
  localDateKey,
} from "../utils/dashboard-helpers";
import FoodImage from "../components/media/FoodImage";
import ProfileImage from "../components/media/ProfileImage";
import { applyProfileToSession } from "../utils/profileSession";
import DashboardSkeleton from "../components/ui/DashboardSkeleton";
import AnimatedNumber from "../components/ui/AnimatedNumber";

function savedPlansChipLabel(count: number): string {
  if (count === 0) return "No saved plans";
  if (count === 1) return "1 saved plan";
  return `${count} saved plans`;
}

function savedPlansSentence(count: number): string {
  if (count === 0) return "You do not have any saved plans yet.";
  if (count === 1) return "You have one saved plan.";
  return `You have ${count} saved plans.`;
}

function dashPlanStatusClass(status: string | undefined) {
  const s = (status ?? "").toLowerCase();
  if (s.includes("active") || s.includes("complete")) return "plans-badge plans-badge--ok";
  if (s.includes("draft") || s.includes("pending")) return "plans-badge plans-badge--warn";
  if (s.includes("fail") || s.includes("cancel")) return "plans-badge plans-badge--err";
  return "plans-badge";
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileDto | null>(null);
  const [today, setToday] = useState<DailyMealSummaryDto | null>(null);
  const [todayCalories, setTodayCalories] = useState(0);
  const [todayMatchesCalendar, setTodayMatchesCalendar] = useState(true);
  const [compatibleFoods, setCompatibleFoods] = useState<FoodDto[]>([]);
  const [summary, setSummary] = useState<PlanSummaryDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [plansCount, setPlansCount] = useState(0);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const sortedPlanDays = useMemo(() => {
    if (!summary?.days?.length) return [];
    return [...summary.days].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [summary?.days]);

  const planDateRange = useMemo(() => {
    if (!sortedPlanDays.length) return null;
    const a = new Date(sortedPlanDays[0].date);
    const b = new Date(sortedPlanDays[sortedPlanDays.length - 1].date);
    const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
    if (a.getFullYear() !== b.getFullYear()) {
      return `${a.toLocaleDateString(undefined, { ...opts, year: "numeric" })} — ${b.toLocaleDateString(undefined, { ...opts, year: "numeric" })}`;
    }
    return `${a.toLocaleDateString(undefined, opts)} — ${b.toLocaleDateString(undefined, opts)}`;
  }, [sortedPlanDays]);

  const maxDayCalories = useMemo(() => {
    if (!sortedPlanDays.length) return 1;
    return Math.max(...sortedPlanDays.map((d) => d.totalCalories ?? 0), 1);
  }, [sortedPlanDays]);

  const targetPerDay = summary?.averageCaloriesPerDay ?? 0;
  const progressPct =
    targetPerDay > 0 ? Math.min(100, Math.round((todayCalories / targetPerDay) * 100)) : todayCalories > 0 ? 100 : 0;
  const ringPct = targetPerDay > 0 ? Math.min(100, (todayCalories / targetPerDay) * 100) : 0;

  const mealsTodayCount = today ? countMealsOnDay(today) : 0;

  useEffect(() => {
    loadDashboard();
  }, []);

  async function getFoodById(meal: MealSummaryDto): Promise<void> {
    if (!meal.foodId) return;
    navigate(`/dashboard/foods/${meal.foodId}`, { state: { from: "/dashboard" } });
  }

  async function loadDashboard() {
    try {
      setLoading(true);
      setLoadError(null);

      const p = await ProfileService.getMe();
      setProfile(p.data);
      applyProfileToSession(p.data);

      const plansRes = await PlansService.getAll();
      const planList = asArray<PlanSummaryDto>(plansRes.data);
      const sorted = [...planList].sort((a, b) => {
        const ta = a.generatedAt ? new Date(a.generatedAt).getTime() : 0;
        const tb = b.generatedAt ? new Date(b.generatedAt).getTime() : 0;
        return tb - ta;
      });
      setPlansCount(sorted.length);
      const lastPlan = sorted[0];

      if (lastPlan?.planId) {
        const sum = await PlansService.summary(lastPlan.planId);
        setSummary(sum.data);
        const { day, matchesCalendar } = pickPlanDayForToday(sum.data.days);
        setToday(day);
        setTodayCalories(day?.totalCalories ?? 0);
        setTodayMatchesCalendar(matchesCalendar);
      } else {
        setSummary(null);
        setToday(null);
        setTodayCalories(0);
        setTodayMatchesCalendar(true);
      }

      const foods = await FoodService.getCompatible();
      setCompatibleFoods(asArray<FoodDto>(foods.data));
    } catch (error) {
      console.error("Error loading dashboard:", error);
      setLoadError(httpErrorMessage(error, "Unable to load dashboard data. Please try again."));
    } finally {
      setLoading(false);
    }
  }

  const renderMealSection = (title: string, meals: MealSummaryDto[] | undefined) => {
    if (!meals?.length) return null;

    return (
      <div className="dash-meal-block">
        <h4 className="dash-meal-block__title">{title}</h4>
        <ul className="dash-meal-list">
          {meals.map((meal) => (
            <li key={meal.id} className="dash-meal-list__item">
              <button
                type="button"
                className="dash-meal-row"
                onClick={() => void getFoodById(meal)}
              >
                <FoodImage src={meal.imagePath} alt="" className="dash-meal-row__img" />
                <div className="dash-meal-row__text">
                  <p className="dash-meal-row__name">{meal.name}</p>
                  <p className="dash-meal-row__meta">
                    <span>{meal.calories} kcal</span>
                    {meal.type ? <span className="dash-meal-row__type">{meal.type}</span> : null}
                  </p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  const firstName = profile?.fullName?.split(/\s+/)[0]?.trim();
  const displayName = firstName || profile?.fullName || "there";

  return (
    <main className="dashboard-page dashboard-page--rich">
      <div className="dashboard-page__inner dash-page-shell">
        <header className="dash-welcome dash-welcome--elevated ng-reveal" style={{ "--ng-delay": "0ms" } as CSSProperties}>
          <div className="dash-welcome__glow" aria-hidden />
          <div className="dash-welcome__main">
            <ProfileImage
              src={profile?.profileUrl}
              alt=""
              className="dash-welcome__photo"
              fallbackClassName="dash-welcome__photo dash-welcome__photo--fallback"
              initials={(profile?.fullName ?? "?")
                .split(/\s+/)
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)}
            />
            <div className="dash-welcome__copy">
              <p className="dash-welcome__kicker">{greeting}</p>
              <h1 className="dash-welcome__title">{displayName}</h1>
              <p className="dash-welcome__desc">
                {summary
                  ? `You’re on a ${summary.totalDays}-day plan aligned with ${formatGoalCode(summary.goal)}.`
                  : "Fill out your profile (body metrics, goal, diet, allergies), then open Plans to generate a meal plan tailored to you."}
              </p>
              <div className="dash-welcome__chips">
                <span className="dash-chip">{savedPlansChipLabel(plansCount)}</span>
                <span className="dash-chip">{compatibleFoods.length} compatible food{compatibleFoods.length !== 1 ? "s" : ""}</span>
                {profile?.dietType ? (
                  <span className="dash-chip dash-chip--accent">{formatGoalCode(profile.dietType)}</span>
                ) : null}
              </div>
            </div>
          </div>
          <div className="dash-welcome__toolbar">
            <div className="dash-welcome__toolbar-inner">
              <Link to="/profile" className="btn btn-light btn-sm">
                Edit profile
              </Link>
              <Link to="/dashboard/plans" className="btn btn-primary btn-sm">
                Plans
              </Link>
              <Link to="/dashboard/gallery" className="btn btn-secondary btn-sm">
                Gallery
              </Link>
              <Link to="/dashboard/notifications/inbox" className="btn btn-secondary btn-sm">
                Notifications
              </Link>
              <Link to="/dashboard/tracking" className="btn btn-secondary btn-sm">
                Tracking
              </Link>
            </div>
          </div>
        </header>

        {loadError && (
          <div className="dash-alert" role="alert">
            <p style={{ margin: "0 0 8px" }}>{loadError}</p>
            {/session expired|sign in again/i.test(loadError) ? (
              <p style={{ margin: "0 0 8px", fontSize: "0.9rem" }}>
                <Link to="/login" className="dash-alert__link">
                  Go to sign in
                </Link>
              </p>
            ) : null}
            <button type="button" className="btn btn-light btn-sm" onClick={() => loadDashboard()}>
              Retry
            </button>
          </div>
        )}

        {summary ? (
          <section
            className="dash-spotlight ng-reveal"
            aria-label="Today and targets"
            style={{ "--ng-delay": "60ms" } as CSSProperties}
          >
            <div className="dash-spotlight__energy">
              <div className="dash-spotlight__energy-head">
                <h2 className="dash-spotlight__h">Today&apos;s energy</h2>
                {today?.date ? (
                  <p className="dash-spotlight__sub">
                    {new Date(today.date).toLocaleDateString(undefined, {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}
                    {!todayMatchesCalendar ? (
                      <span className="dash-spotlight__note">
                        {" "}
                        · Showing plan start (calendar day not in this plan)
                      </span>
                    ) : null}
                  </p>
                ) : null}
              </div>
              <div className="dash-spotlight__energy-body">
                <div
                  className="dash-ring dash-ring--pulse"
                  style={{ "--ring-pct": String(Math.min(100, ringPct)) } as CSSProperties}
                  aria-hidden
                >
                  <div className="dash-ring__hole" />
                  <div className="dash-ring__text">
                    <span className="dash-ring__value">
                      <AnimatedNumber value={todayCalories} />
                    </span>
                    <span className="dash-ring__unit">kcal logged</span>
                  </div>
                </div>
                <div className="dash-spotlight__progress-block">
                  <div className="dash-spotlight__progress-labels">
                    <span>vs plan average</span>
                    <strong>
                      {targetPerDay > 0 ? (
                        <>
                          <AnimatedNumber value={progressPct} />%
                        </>
                      ) : (
                        "—"
                      )}
                      {targetPerDay > 0 ? ` · target ${targetPerDay} kcal/d` : ""}
                    </strong>
                  </div>
                  <div className="dash-progress" role="progressbar" aria-valuenow={progressPct} aria-valuemin={0} aria-valuemax={100}>
                    <div className="dash-progress__fill" style={{ width: `${progressPct}%` }} />
                  </div>
                  <ul className="dash-spotlight__facts">
                    <li className="dash-spotlight__fact-pill">
                      <span className="dash-spotlight__fact-label">Meals</span>
                      <span className="dash-spotlight__fact-value">{mealsTodayCount}</span>
                    </li>
                    <li className="dash-spotlight__fact-pill">
                      <span className="dash-spotlight__fact-label">Plan total</span>
                      <span className="dash-spotlight__fact-value">{summary.totalCalories.toLocaleString()} kcal</span>
                    </li>
                    <li className="dash-spotlight__fact-pill dash-spotlight__fact-pill--status">
                      <span className="dash-spotlight__fact-label">Status</span>
                      <span className={dashPlanStatusClass(summary.status)}>{summary.status}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="dash-spotlight__side">
              <article className="dash-mini-stat interactive-card">
                <p className="dash-mini-stat__label">Daily average (plan)</p>
                <p className="dash-mini-stat__value">
                  <AnimatedNumber value={summary.averageCaloriesPerDay ?? 0} />
                </p>
                <p className="dash-mini-stat__hint">kcal / day</p>
              </article>
              <article className="dash-mini-stat interactive-card">
                <p className="dash-mini-stat__label">Plan length</p>
                <p className="dash-mini-stat__value">
                  <AnimatedNumber value={summary.totalDays ?? 0} />
                </p>
                <p className="dash-mini-stat__hint">days</p>
              </article>
              <article className="dash-mini-stat">
                <p className="dash-mini-stat__label">Goal</p>
                <p className="dash-mini-stat__value dash-mini-stat__value--text">{formatGoalCode(summary.goal)}</p>
              </article>
              <article className="dash-mini-stat">
                <p className="dash-mini-stat__label">Diet style</p>
                <p className="dash-mini-stat__value dash-mini-stat__value--text">{summary.dietStyle}</p>
              </article>
            </div>
          </section>
        ) : (
          <section className="dash-empty-hero">
            <h2 className="dash-empty-hero__title">No active plan</h2>
            <p className="dash-empty-hero__text">
              {savedPlansSentence(plansCount)}{" "}
              <strong>Complete your profile</strong> (metrics, goal, diet type, allergies) so your plan and food
              suggestions are accurate — then open <strong>Plans</strong> to generate or pick one. Your dashboard will
              show calories, days, and meals here.
            </p>
            <div className="dash-empty-hero__actions">
              <Link to="/profile" className="btn btn-light btn-sm">
                Complete profile
              </Link>
              <Link to="/dashboard/plans" className="btn btn-primary btn-sm">
                Go to plans
              </Link>
            </div>
          </section>
        )}

        {sortedPlanDays.length > 0 ? (
          <section className="dash-plan-chart" aria-label="Calories by day">
            <div className="dash-plan-chart__head">
              <div>
                <h2 className="dash-plan-chart__title">Calories across your plan</h2>
                {planDateRange ? <p className="dash-plan-chart__range">{planDateRange}</p> : null}
              </div>
              {summary?.planId ? (
                <Link to={`/dashboard/plans/${summary.planId}`} className="btn btn-primary btn-sm">
                  Open full plan
                </Link>
              ) : null}
            </div>
            <div className="dash-bars-wrap">
              <div className="dash-bars" role="img" aria-label="Daily total calories">
              {sortedPlanDays.map((d) => {
                const h = Math.round(((d.totalCalories ?? 0) / maxDayCalories) * 100);
                const isToday = dayDateKey(d.date) === localDateKey(new Date());
                return (
                  <div key={d.dayId || d.date} className={`dash-bars__col${isToday ? " dash-bars__col--today" : ""}`}>
                    <div className="dash-bars__track">
                      <div
                        className="dash-bars__fill"
                        style={{ height: `${h}%` }}
                        title={`${new Date(d.date).toLocaleDateString()}: ${d.totalCalories ?? 0} kcal`}
                      />
                    </div>
                    <span className="dash-bars__label">{new Date(d.date).getDate()}</span>
                  </div>
                );
              })}
              </div>
            </div>
            <DashboardCharts planDays={sortedPlanDays} today={today} targetPerDay={targetPerDay} />
          </section>
        ) : summary ? (
          <section className="dash-plan-chart dash-plan-chart--empty" aria-label="Charts unavailable">
            <div className="dash-plan-chart__head">
              <div>
                <h2 className="dash-plan-chart__title">Charts for your plan</h2>
                <p className="dash-plan-chart__range muted">
                  Line and doughnut charts need at least one day with calorie totals in your latest plan. Open the plan
                  below and ensure days are generated, or create a new plan from <Link to="/dashboard/plans">Plans</Link>
                  .
                </p>
              </div>
              {summary.planId ? (
                <Link to={`/dashboard/plans/${summary.planId}`} className="btn btn-primary btn-sm">
                  Open plan
                </Link>
              ) : null}
            </div>
            <p className="muted text-sm m-0">
              For weight and adherence charts (even without a meal plan), use{" "}
              <Link to="/dashboard/tracking">Tracking</Link> — in dev, Vite proxies{" "}
              <code className="app-code">/api/tracking</code> to{" "}
              <code className="app-code">https://localhost:7073</code> by default (see{" "}
              <code className="app-code">VITE_DEV_TRACKING_ORIGIN</code>).
            </p>
          </section>
        ) : null}

        <div className="dash-layout dash-layout--rich">
          <div className="dash-layout__stack">
            <section className="dash-panel dash-panel--profile">
              <div className="dash-panel__head">
                <h2 className="dash-panel__title">Your profile</h2>
                <Link to="/profile" className="dash-panel__link">
                  Edit
                </Link>
              </div>
              <div className="dash-panel__body">
                {profile ? (
                  <div className="dash-mosaic">
                    {profile.email ? (
                      <div className="dash-mosaic__cell dash-mosaic__cell--wide">
                        <span className="dash-mosaic__k">Email</span>
                        <span className="dash-mosaic__v">{profile.email}</span>
                      </div>
                    ) : null}
                    {profile.age != null ? (
                      <div className="dash-mosaic__cell">
                        <span className="dash-mosaic__k">Age</span>
                        <span className="dash-mosaic__v">{profile.age}</span>
                      </div>
                    ) : null}
                    {profile.biologicalSex ? (
                      <div className="dash-mosaic__cell">
                        <span className="dash-mosaic__k">Sex</span>
                        <span className="dash-mosaic__v">{profile.biologicalSex}</span>
                      </div>
                    ) : null}
                    {profile.weightKg != null ? (
                      <div className="dash-mosaic__cell">
                        <span className="dash-mosaic__k">Weight</span>
                        <span className="dash-mosaic__v">{profile.weightKg} kg</span>
                      </div>
                    ) : null}
                    {profile.heightCm != null ? (
                      <div className="dash-mosaic__cell">
                        <span className="dash-mosaic__k">Height</span>
                        <span className="dash-mosaic__v">{profile.heightCm} cm</span>
                      </div>
                    ) : null}
                    {profile.bmi != null ? (
                      <div className="dash-mosaic__cell">
                        <span className="dash-mosaic__k">BMI</span>
                        <span className="dash-mosaic__v">{profile.bmi.toFixed(1)}</span>
                      </div>
                    ) : null}
                    {profile.activityLevel ? (
                      <div className="dash-mosaic__cell dash-mosaic__cell--wide">
                        <span className="dash-mosaic__k">Activity</span>
                        <span className="dash-mosaic__v">{profile.activityLevel}</span>
                      </div>
                    ) : null}
                    <div className="dash-mosaic__cell">
                      <span className="dash-mosaic__k">Goal</span>
                      <span className="dash-mosaic__v">{formatGoalCode(profile.goal)}</span>
                    </div>
                    <div className="dash-mosaic__cell">
                      <span className="dash-mosaic__k">Diet</span>
                      <span className="dash-mosaic__v">{formatGoalCode(profile.dietType)}</span>
                    </div>
                    <div className="dash-mosaic__cell dash-mosaic__cell--full">
                      <span className="dash-mosaic__k">Allergies</span>
                      <span className="dash-mosaic__v">
                        {profile.allergies?.length ? profile.allergies.join(", ") : "None listed"}
                      </span>
                    </div>
                    {profile.createdAt ? (
                      <div className="dash-mosaic__cell dash-mosaic__cell--wide">
                        <span className="dash-mosaic__k">Member since</span>
                        <span className="dash-mosaic__v">{new Date(profile.createdAt).toLocaleDateString()}</span>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <p className="dash-panel__empty">No profile loaded.</p>
                )}
              </div>
            </section>

            {summary ? (
              <section className="dash-panel">
                <div className="dash-panel__head">
                  <h2 className="dash-panel__title">Plan snapshot</h2>
                </div>
                <div className="dash-panel__body">
                  <dl className="dash-dl">
                    <div className="dash-dl--full">
                      <dt>Generated</dt>
                      <dd>
                        {summary.generatedAt
                          ? new Date(summary.generatedAt).toLocaleString(undefined, {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })
                          : "—"}
                      </dd>
                    </div>
                    <div>
                      <dt>Total energy</dt>
                      <dd>{summary.totalCalories.toLocaleString()} kcal</dd>
                    </div>
                    <div>
                      <dt>Days</dt>
                      <dd>{summary.totalDays}</dd>
                    </div>
                  </dl>
                  {summary.planId ? (
                    <div className="dash-panel__actions">
                      <Link to={`/dashboard/plans/${summary.planId}`} className="btn btn-primary btn-sm">
                        View plan details
                      </Link>
                    </div>
                  ) : null}
                </div>
              </section>
            ) : null}
          </div>

          <section className="dash-panel dash-panel--meals">
            <div className="dash-panel__head">
              <h2 className="dash-panel__title">Meals for selected day</h2>
              {today?.date ? (
                <p className="dash-panel__meta">
                  {new Date(today.date).toLocaleDateString(undefined, {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  })}
                  <span className="dash-panel__meta-sep">·</span>
                  {mealsTodayCount} item{mealsTodayCount !== 1 ? "s" : ""} · {todayCalories} kcal
                </p>
              ) : null}
            </div>
            <div className="dash-panel__body">
              {!today ? (
                <p className="dash-panel__empty">
                  No day in this plan yet. Generate a plan or open an existing one from Plans.
                </p>
              ) : (
                <>
                  {renderMealSection("Breakfast", today.breakfast)}
                  {renderMealSection("Lunch", today.lunch)}
                  {renderMealSection("Dinner", today.dinner)}
                  {renderMealSection("Snacks", today.snacks)}
                </>
              )}
            </div>
          </section>
        </div>

        <section className="dash-panel dash-panel--gallery">
          <div className="dash-panel__head">
            <h2 className="dash-panel__title">Compatible picks</h2>
            <Link to="/dashboard/gallery" className="dash-panel__link">
              Browse all
            </Link>
          </div>
          <div className="dash-panel__body">
            {compatibleFoods.length === 0 ? (
              <p className="dash-panel__empty">
                {!profile?.dietType?.trim() ? (
                  <>
                    Add your <strong>diet type</strong> (and allergies if any) in{" "}
                    <Link to="/profile">your profile</Link> so we can suggest compatible foods.
                  </>
                ) : (
                  <>
                    No foods matched your profile yet. You can refine allergies or diet style in{" "}
                    <Link to="/profile">your profile</Link>, or{" "}
                    <Link to="/dashboard/gallery">browse the gallery</Link>.
                  </>
                )}
              </p>
            ) : (
              <div className="dash-food-scroll">
                {compatibleFoods.map((food) => (
                  <Link
                    key={food.id}
                    to={`/dashboard/foods/${food.id}`}
                    state={{ from: "/dashboard" }}
                    className="dash-food-card"
                  >
                    <FoodImage src={food.imagePath} alt="" className="dash-food-card__img" />
                    <div className="dash-food-card__body">
                      <p className="dash-food-card__name">{food.name}</p>
                      <p className="dash-food-card__kcal">{food.calories} kcal</p>
                      <div className="dash-food-macros" aria-label="Macros per serving">
                        <span className="dash-food-macros__p">P {Math.round(food.protein)}g</span>
                        <span className="dash-food-macros__c">C {Math.round(food.carbs)}g</span>
                        <span className="dash-food-macros__f">F {Math.round(food.fat)}g</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
