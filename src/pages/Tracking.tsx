import { useCallback, useEffect, useMemo, useState } from "react";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import type { TooltipItem } from "chart.js";
import TrackingWeightSideData from "../components/tracking/TrackingWeightSideData";
import { TrackingService, type TrackingSummary, type WeightEntryDto } from "../services/tracking.service";
import { httpErrorMessage } from "../utils/httpErrorMessage";
import { buildWeightSideData } from "../utils/weightSideData";
import { useTheme } from "../theme/ThemeProvider";
import { useToast } from "../components/ui/ToastProvider";
import type { CSSProperties } from "react";

ChartJS.register(LineElement, BarElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, Filler);

function chartThemeColors() {
  const s = getComputedStyle(document.documentElement);
  const accent = s.getPropertyValue("--accent").trim() || "#2b8a3e";
  const accentLight = s.getPropertyValue("--accent-light").trim() || "#74c69d";
  const accentDark = s.getPropertyValue("--accent-dark").trim() || "#1f6a2f";
  const text = s.getPropertyValue("--text-light").trim() || "#555";
  const grid = s.getPropertyValue("--border").trim() || "#e0e0e0";
  return { accent, accentLight, accentDark, text, grid };
}

function isHttp404(e: unknown): boolean {
  return (
    typeof e === "object" &&
    e !== null &&
    "response" in e &&
    (e as { response?: { status?: number } }).response?.status === 404
  );
}

function measuredAtTime(iso: string): number {
  const t = new Date(iso).getTime();
  return Number.isNaN(t) ? 0 : t;
}

function todayDateInput(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function Tracking() {
  const { mode, palette } = useTheme();
  const toast = useToast();
  const [summary, setSummary] = useState<TrackingSummary | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [mealsLogged, setMealsLogged] = useState(2);
  const [mealsGoal, setMealsGoal] = useState(3);
  const [metricKey, setMetricKey] = useState("WeightKg");
  const [target, setTarget] = useState("");
  const [current, setCurrent] = useState("");

  const [weightEntries, setWeightEntries] = useState<WeightEntryDto[]>([]);
  const [weightLoadErr, setWeightLoadErr] = useState<string | null>(null);
  const [weightsEndpointMissing, setWeightsEndpointMissing] = useState(false);

  const [logWeightKg, setLogWeightKg] = useState("");
  const [logWeightDate, setLogWeightDate] = useState(todayDateInput);
  const [logWeightNote, setLogWeightNote] = useState("");

  const colors = useMemo(() => chartThemeColors(), [mode, palette]);

  const load = useCallback(async () => {
    setLoadError(null);
    setWeightLoadErr(null);
    setWeightsEndpointMissing(false);
    setLoading(true);
    try {
      const { data } = await TrackingService.getSummary();
      setSummary(data);
      const snap = data.goalSnapshot;
      if (snap) {
        setMetricKey(snap.metricKey || "WeightKg");
        setTarget(snap.target != null ? String(snap.target) : "");
        setCurrent(snap.current != null ? String(snap.current) : "");
      }

      let list: WeightEntryDto[] = [];
      try {
        const res = await TrackingService.getWeights({ days: 365 });
        list = Array.isArray(res.data) ? res.data : [];
      } catch (e) {
        if (isHttp404(e)) {
          if (data.weightSeries?.length) {
            list = data.weightSeries.map((p, i) => ({
              id: p.id ?? `embedded-${i}-${p.recordedUtc}`,
              weightKg: p.weightKg,
              measuredAt: p.recordedUtc,
              recordedUtc: p.recordedUtc,
            }));
          } else {
            setWeightsEndpointMissing(true);
          }
        } else {
          setWeightLoadErr(httpErrorMessage(e, "Could not load weight history."));
        }
      }
      setWeightEntries(list);
    } catch (e) {
      setSummary(null);
      setLoadError(httpErrorMessage(e, "Could not load tracking data."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: colors.text, boxWidth: 12 },
        },
      },
      scales: {
        y: {
          min: 0,
          max: 100,
          ticks: { color: colors.text },
          grid: { color: colors.grid },
        },
        x: {
          ticks: { color: colors.text },
          grid: { color: colors.grid },
        },
      },
    }),
    [colors],
  );

  const weightChartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: colors.text, boxWidth: 12 },
        },
        tooltip: {
          callbacks: {
            label: (ctx: TooltipItem<"line">) => {
              const y = ctx.parsed.y;
              return y != null ? `${Number(y).toFixed(1)} kg` : "";
            },
          },
        },
      },
      scales: {
        y: {
          title: { display: true, text: "kg", color: colors.text },
          ticks: { color: colors.text },
          grid: { color: colors.grid },
        },
        x: {
          ticks: { color: colors.text, maxRotation: 45 },
          grid: { color: colors.grid },
        },
      },
    }),
    [colors],
  );

  const sortedWeightAscending = useMemo(() => {
    return [...weightEntries].sort((a, b) => measuredAtTime(a.measuredAt) - measuredAtTime(b.measuredAt));
  }, [weightEntries]);

  const weightLineData = useMemo(() => {
    const series = sortedWeightAscending;
    const labels = series.map((p) => {
      const d = new Date(p.measuredAt);
      return Number.isNaN(d.getTime())
        ? p.measuredAt
        : d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    });
    return {
      labels,
      datasets: [
        {
          label: "Weight (kg)",
          data: series.map((p) => p.weightKg),
          borderColor: colors.accentDark,
          backgroundColor: colors.accentLight + "44",
          tension: 0.3,
          spanGaps: true,
          fill: true,
        },
      ],
    };
  }, [sortedWeightAscending, colors]);

  const recentWeightsDesc = useMemo(() => {
    return [...weightEntries].sort((a, b) => measuredAtTime(b.measuredAt) - measuredAtTime(a.measuredAt)).slice(0, 12);
  }, [weightEntries]);

  const weightSideData = useMemo(() => {
    const targetNum = target.trim() === "" ? null : Number(target.replace(",", "."));
    const currentNum = current.trim() === "" ? null : Number(current.replace(",", "."));
    const goalTarget = summary?.goalSnapshot?.target ?? (Number.isFinite(targetNum) ? targetNum : null);
    const goalCurrent = summary?.goalSnapshot?.current ?? (Number.isFinite(currentNum) ? currentNum : null);
    return buildWeightSideData(weightEntries, goalTarget, goalCurrent);
  }, [weightEntries, summary?.goalSnapshot, target, current]);

  const weekLineData = useMemo(() => {
    const series = summary?.weekSeries ?? [];
    const labels = series.map((p) => {
      const d = new Date(p.date + "T12:00:00");
      return d.toLocaleDateString(undefined, { weekday: "short", day: "numeric" });
    });
    return {
      labels,
      datasets: [
        {
          label: "Adherence %",
          data: series.map((p) => (p.adherencePercent == null ? null : p.adherencePercent)),
          borderColor: colors.accent,
          backgroundColor: colors.accentLight + "55",
          tension: 0.25,
          spanGaps: true,
          fill: true,
        },
      ],
    };
  }, [summary?.weekSeries, colors]);

  const layerBarData = useMemo(() => {
    if (!summary) return null;
    return {
      labels: ["Daily", "Weekly avg", "Goal fit"],
      datasets: [
        {
          label: "Score",
          data: [summary.layer1Daily.score, summary.layer2Weekly.score, summary.layer3Goal.score],
          backgroundColor: [colors.accent, colors.accentLight, colors.accentDark],
          borderRadius: 6,
        },
      ],
    };
  }, [summary, colors]);

  const logToday = async () => {
    setMsg(null);
    setBusy(true);
    try {
      await TrackingService.logDaily({ mealsLogged, mealsGoal });
      setMsg("Daily progress saved.");
      toast.success("Daily progress saved.");
      await load();
    } catch (e) {
      const m = httpErrorMessage(e, "Could not save daily log.");
      setMsg(m);
      toast.error(m);
    } finally {
      setBusy(false);
    }
  };

  const saveWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    const kg = Number(logWeightKg.replace(",", ".").trim());
    if (Number.isNaN(kg) || kg <= 0 || kg > 500) {
      setMsg("Enter a valid weight between 0 and 500 kg.");
      return;
    }
    setBusy(true);
    try {
      await TrackingService.logWeight({
        weightKg: kg,
        measuredAt: logWeightDate ? `${logWeightDate}T12:00:00Z` : undefined,
        note: logWeightNote.trim() || undefined,
      });
      setMsg("Weight recorded.");
      toast.success("Weight recorded.");
      setLogWeightKg("");
      setLogWeightNote("");
      setLogWeightDate(todayDateInput());
      await load();
    } catch (err) {
      if (isHttp404(err)) {
        const m =
          "Weight API not available (404). Start the tracking service and gateway route POST /api/tracking/weight-entries.";
        setMsg(m);
        toast.error(m);
      } else {
        const m = httpErrorMessage(err, "Could not save weight.");
        setMsg(m);
        toast.error(m);
      }
    } finally {
      setBusy(false);
    }
  };

  const removeWeight = async (id: string) => {
    if (id.startsWith("embedded-")) return;
    setMsg(null);
    setBusy(true);
    try {
      await TrackingService.deleteWeight(id);
      setMsg("Entry removed.");
      await load();
    } catch (err) {
      if (isHttp404(err)) {
        setMsg("Delete not supported by the API yet.");
      } else {
        setMsg(httpErrorMessage(err, "Could not remove entry."));
      }
    } finally {
      setBusy(false);
    }
  };

  const saveGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setBusy(true);
    try {
      await TrackingService.upsertGoal({
        metricKey,
        target: target.trim() === "" ? null : Number(target.replace(",", ".")),
        current: current.trim() === "" ? null : Number(current.replace(",", ".")),
      });
      setMsg("Goal saved.");
      toast.success("Goal saved.");
      await load();
    } catch (e) {
      const m = httpErrorMessage(e, "Could not save goal.");
      setMsg(m);
      toast.error(m);
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <main className="tracking-page app-page">
        <p className="tracking-page__loading">Loading tracking…</p>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="tracking-page app-page">
        <header className="app-page__header">
          <p className="app-page__kicker">Progress</p>
          <h1 className="app-page__title">Tracking</h1>
        </header>
        <p className="app-status app-status--err" role="alert">
          {loadError}
        </p>
        <button type="button" className="btn btn-secondary" onClick={() => void load()}>
          Retry
        </button>
      </main>
    );
  }

  return (
    <main className="tracking-page app-page">
      <header className="app-page__header">
        <p className="app-page__kicker">Progress</p>
        <h1 className="app-page__title">Tracking</h1>
        <p className="app-page__subtitle">
          Log meals, record body weight over time, follow adherence, and set an optional goal (e.g. target weight).
        </p>
      </header>

      {msg && (
        <p
          className={`app-status ${msg.endsWith(".") && !/could not|error|sign in|not available|not supported/i.test(msg) ? "app-status--ok" : "app-status--err"}`}
          role="status"
        >
          {msg}
        </p>
      )}

      {summary && (
        <section className="tracking-page__layers ng-reveal" aria-label="Summary scores" style={{ "--ng-delay": "40ms" } as CSSProperties}>
          {[summary.layer1Daily, summary.layer2Weekly, summary.layer3Goal].map((layer, i) => (
            <article
              key={layer.title}
              className="tracking-layer-card interactive-card ng-reveal"
              style={{ "--ng-delay": `${80 + i * 50}ms` } as CSSProperties}
            >
              <p className="tracking-layer-card__period">{layer.period}</p>
              <h2 className="tracking-layer-card__title">{layer.title}</h2>
              <p className="tracking-layer-card__score">{layer.score}%</p>
              <p className="tracking-layer-card__detail">{layer.detail}</p>
            </article>
          ))}
        </section>
      )}

      <section className="tracking-section">
        <h2 className="tracking-section__title">Week adherence</h2>
        <p className="tracking-section__desc">
          Percent of meal goal reached per day (empty days show as gaps).
        </p>
        <div className="tracking-chart-wrap">
          <Line data={weekLineData} options={chartOptions} />
        </div>
      </section>

      {layerBarData && (
        <section className="tracking-section">
          <h2 className="tracking-section__title">Three-layer scores</h2>
          <p className="tracking-section__desc">Daily, weekly average, and goal alignment.</p>
          <div className="tracking-chart-wrap tracking-chart-wrap--bar">
            <Bar
              data={layerBarData}
              options={{
                ...chartOptions,
                plugins: { legend: { display: false } },
              }}
            />
          </div>
        </section>
      )}

      <section className="tracking-section">
        <h2 className="tracking-section__title">Log today</h2>
        <p className="tracking-section__desc">Record how many meals you logged versus your daily goal.</p>
        <div className="tracking-form-row">
          <label className="tracking-field">
            <span className="tracking-field__label">Meals logged</span>
            <input
              type="number"
              min={0}
              value={mealsLogged}
              onChange={(e) => setMealsLogged(Number(e.target.value))}
            />
          </label>
          <label className="tracking-field">
            <span className="tracking-field__label">Meal goal</span>
            <input
              type="number"
              min={1}
              value={mealsGoal}
              onChange={(e) => setMealsGoal(Number(e.target.value))}
            />
          </label>
          <button type="button" className="btn btn-primary" disabled={busy} onClick={() => void logToday()}>
            {busy ? "Saving…" : "Save daily log"}
          </button>
        </div>
      </section>

      <section className="tracking-section">
        <h2 className="tracking-section__title">Body weight</h2>
        <p className="tracking-section__desc">
          Track weight over time (per user, stored by your tracking API). Chart and table update after each save.
        </p>
        {weightsEndpointMissing && (
          <p className="tracking-section__hint">
            Impossible de joindre <code className="app-code">GET /api/tracking/weight-entries</code>. Vérifiez le
            service Tracking (port 5073) et le gateway Ocelot, ou utilisez le proxy Vite vers le gateway.
          </p>
        )}
        {weightLoadErr && (
          <p className="app-status app-status--err" role="alert">
            {weightLoadErr}
          </p>
        )}

        <div className="tracking-weight-layout">
          {sortedWeightAscending.length > 0 ? (
            <div className="tracking-chart-wrap tracking-chart-wrap--weight">
              <Line data={weightLineData} options={weightChartOptions} />
            </div>
          ) : (
            !weightsEndpointMissing &&
            !weightLoadErr && (
              <p className="tracking-section__hint">Aucune pesée — ajoutez une mesure ci-dessous.</p>
            )
          )}
          <TrackingWeightSideData data={weightSideData} />
        </div>

        {recentWeightsDesc.length > 0 && (
          <table className="tracking-weight-recent">
            <thead>
              <tr>
                <th>Date</th>
                <th>Weight</th>
                <th>Note</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {recentWeightsDesc.map((row) => (
                <tr key={row.id}>
                  <td>
                    {new Date(row.measuredAt).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </td>
                  <td>{row.weightKg.toFixed(1)} kg</td>
                  <td className="tracking-weight-recent__note">{row.note ?? "—"}</td>
                  <td>
                    {!row.id.startsWith("embedded-") ? (
                      <button
                        type="button"
                        className="btn btn-light btn-sm"
                        disabled={busy}
                        onClick={() => void removeWeight(row.id)}
                      >
                        Remove
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <form className="tracking-form-row tracking-form-row--weight" onSubmit={(e) => void saveWeight(e)}>
          <label className="tracking-field">
            <span className="tracking-field__label">Weight (kg)</span>
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              min={0}
              max={500}
              required
              value={logWeightKg}
              onChange={(e) => setLogWeightKg(e.target.value)}
              placeholder="e.g. 72.4"
            />
          </label>
          <label className="tracking-field">
            <span className="tracking-field__label">Date</span>
            <input type="date" value={logWeightDate} onChange={(e) => setLogWeightDate(e.target.value)} />
          </label>
          <label className="tracking-field" style={{ minWidth: "12rem", flex: 1 }}>
            <span className="tracking-field__label">Note (optional)</span>
            <input
              value={logWeightNote}
              onChange={(e) => setLogWeightNote(e.target.value)}
              placeholder="e.g. morning, fasted"
            />
          </label>
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? "Saving…" : "Save weight"}
          </button>
        </form>
      </section>

      <section className="tracking-section">
        <h2 className="tracking-section__title">Goal metric (optional)</h2>
        <p className="tracking-section__desc">
          Target vs current for scoring (e.g. <strong>WeightKg</strong> alongside the series above).
        </p>
        <form className="tracking-form-stack" onSubmit={(e) => void saveGoal(e)}>
          <label className="tracking-field">
            <span className="tracking-field__label">Metric key</span>
            <input value={metricKey} onChange={(e) => setMetricKey(e.target.value)} />
          </label>
          <label className="tracking-field">
            <span className="tracking-field__label">Target (optional)</span>
            <input
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="e.g. 72"
            />
          </label>
          <label className="tracking-field">
            <span className="tracking-field__label">Current (optional)</span>
            <input
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              placeholder="e.g. 75"
            />
          </label>
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? "Saving…" : "Save goal"}
          </button>
        </form>
      </section>
    </main>
  );
}
