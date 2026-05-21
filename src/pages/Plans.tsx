import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PlansService } from "../services/plans.service";
import type { PlanSummaryDto } from "../Types/global-types";
import { asArray } from "../utils/normalize";
import { exportPlan, type PlanExportFormat } from "../utils/planExport";
import PlanExportButtons from "../components/plans/PlanExportButtons";
import PlansSkeleton from "../components/ui/PlansSkeleton";
import { useToast } from "../components/ui/ToastProvider";
import type { CSSProperties } from "react";

function sortPlansByDate(list: PlanSummaryDto[]) {
  return [...list].sort((a, b) => {
    const ta = a.generatedAt ? new Date(a.generatedAt).getTime() : 0;
    const tb = b.generatedAt ? new Date(b.generatedAt).getTime() : 0;
    return tb - ta;
  });
}

function statusClass(status: string | undefined) {
  const s = (status ?? "").toLowerCase();
  if (s.includes("active") || s.includes("complete")) return "plans-badge plans-badge--ok";
  if (s.includes("draft") || s.includes("pending")) return "plans-badge plans-badge--warn";
  if (s.includes("fail") || s.includes("cancel")) return "plans-badge plans-badge--err";
  return "plans-badge";
}

export default function Plans() {
  const toast = useToast();
  const [plans, setPlans] = useState<PlanSummaryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState<{ planId: string; format: PlanExportFormat } | null>(null);

  const loadPlans = () => {
    setLoading(true);
    setError(null);

    PlansService.getAll()
      .then((res) => {
        const list = asArray<PlanSummaryDto>(res.data);
        setPlans(sortPlansByDate(list));
      })
      .catch(() => {
        setError("Unable to load plans. Check your connection and try again.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const generatePlan = async () => {
    try {
      setGenerating(true);
      setError(null);
      await PlansService.generate({
        startDate: new Date().toISOString().split("T")[0],
        numberOfDays: 7,
        notes: "",
      });
      await loadPlans();
      toast.success("New plan generated.");
    } catch {
      setError("Plan generation failed. Please try again.");
      toast.error("Plan generation failed.");
    } finally {
      setGenerating(false);
    }
  };

  const handleExport = async (plan: PlanSummaryDto, format: PlanExportFormat) => {
    try {
      setExporting({ planId: plan.planId, format });
      setError(null);
      await exportPlan(plan.planId, format, plan);
      toast.success(`Plan exported as ${format.toUpperCase()}.`);
    } catch {
      setError("Could not export the plan. Please try again.");
      toast.error("Export failed.");
    } finally {
      setExporting(null);
    }
  };

  const deletePlan = async (planId: string) => {
    if (!window.confirm("Delete this plan permanently?")) return;
    try {
      setError(null);
      await PlansService.delete(planId);
      loadPlans();
    } catch {
      setError("Could not delete the plan.");
    }
  };

  return (
    <div className="w-full max-w-[1100px]">
      <header className="mb-8 flex flex-col gap-4 border-b border-[var(--surface-strong)] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--accent-dark)] sm:text-3xl">Meal plans</h1>
          <p className="mt-1 max-w-2xl text-sm text-[var(--text-light)] sm:text-base">
            View and manage your nutrition plans. Export any plan as PDF or Word.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn btn-primary"
            onClick={generatePlan}
            disabled={generating}
          >
            {generating ? "Generating…" : "Generate new plan"}
          </button>
          <button type="button" className="btn btn-light" onClick={loadPlans} disabled={loading}>
            Refresh
          </button>
        </div>
      </header>

      {error && (
        <div className="app-status app-status--err mb-6" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <PlansSkeleton />
      ) : plans.length === 0 ? (
        <div className="card p-8 text-center sm:p-10">
          <p className="m-0 text-[var(--text)]">You don&apos;t have any plans yet.</p>
          <p className="mt-2 text-sm text-[var(--text-light)]">
            Generate a 7-day plan from your profile, then open it to adjust meals.
          </p>
          <button
            type="button"
            className="btn btn-primary mt-6"
            onClick={generatePlan}
            disabled={generating}
          >
            {generating ? "Generating…" : "Generate your first plan"}
          </button>
        </div>
      ) : (
        <div className="plans-list-stack">
          <ul className="plans-card-grid m-0 list-none p-0">
            {plans.map((plan, index) => (
              <li
                key={plan.planId}
                className="plan-list-card card interactive-card ng-reveal"
                style={{ "--ng-delay": `${index * 55}ms` } as CSSProperties}
              >
                <div className="plan-list-card__head">
                  <div>
                    <p className="plan-list-card__label">Goal</p>
                    <p className="plan-list-card__title">{plan.goal}</p>
                  </div>
                  <span className={statusClass(plan.status)}>{plan.status}</span>
                </div>
                <dl className="plan-list-card__meta">
                  <div>
                    <dt>Avg / day</dt>
                    <dd>{plan.averageCaloriesPerDay} kcal</dd>
                  </div>
                  <div>
                    <dt>Diet</dt>
                    <dd>{plan.dietStyle}</dd>
                  </div>
                  <div className="plan-list-card__meta--full">
                    <dt>Generated</dt>
                    <dd>
                      {plan.generatedAt
                        ? new Date(plan.generatedAt).toLocaleString()
                        : "—"}
                    </dd>
                  </div>
                </dl>
                <div className="plan-list-card__actions">
                  <Link to={`/dashboard/plans/${plan.planId}`} className="btn btn-sm btn-success">
                    Open
                  </Link>
                  <PlanExportButtons plan={plan} exporting={exporting} onExport={handleExport} />
                  <button type="button" className="btn btn-sm btn-danger" onClick={() => deletePlan(plan.planId)}>
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="table-scroll plans-table-wrap">
            <table className="table m-0">
              <thead>
                <tr>
                  <th>Goal</th>
                  <th>Avg kcal / day</th>
                  <th>Diet</th>
                  <th>Status</th>
                  <th>Generated</th>
                  <th style={{ minWidth: "18rem" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((plan) => (
                  <tr key={plan.planId}>
                    <td className="font-medium">{plan.goal}</td>
                    <td>{plan.averageCaloriesPerDay} kcal</td>
                    <td>{plan.dietStyle}</td>
                    <td>
                      <span className={statusClass(plan.status)}>{plan.status}</span>
                    </td>
                    <td className="text-sm whitespace-nowrap">
                      {plan.generatedAt ? new Date(plan.generatedAt).toLocaleString() : "—"}
                    </td>
                    <td>
                      <div className="plans-table-actions">
                        <Link to={`/dashboard/plans/${plan.planId}`} className="btn btn-sm btn-success">
                          Details
                        </Link>
                        <PlanExportButtons
                          plan={plan}
                          exporting={exporting}
                          onExport={handleExport}
                          compact
                        />
                        <button
                          type="button"
                          className="btn btn-sm btn-danger"
                          onClick={() => deletePlan(plan.planId)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
