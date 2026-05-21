import { PlansService } from "../services/plans.service";
import type { PlanSummaryDto } from "../Types/global-types";
import { toPlanSummaryDto } from "./normalize";

export type PlanExportFormat = "pdf" | "docx";

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

export function planExportBasename(plan: Pick<PlanSummaryDto, "planId" | "goal" | "generatedAt">) {
  const datePart = plan.generatedAt
    ? new Date(plan.generatedAt).toISOString().slice(0, 10)
    : plan.planId.slice(0, 8);
  const goalPart = plan.goal ? slugify(plan.goal) : "plan";
  return `plan-${goalPart}-${datePart}`;
}

export async function fetchFullPlan(planId: string): Promise<PlanSummaryDto | null> {
  const res = await PlansService.getById(planId);
  return toPlanSummaryDto(res.data);
}

export async function exportPlanPdf(planId: string, basename?: string) {
  const { exportPlanPdfRich } = await import("./planPdfExport");
  await exportPlanPdfRich(planId, basename);
}

export async function exportPlanDocx(planId: string, basename?: string) {
  const { buildPlanDocxBlob } = await import("./planDocxExport");
  const plan = await fetchFullPlan(planId);
  if (!plan) throw new Error("Plan introuvable");
  const blob = await buildPlanDocxBlob(plan);
  downloadBlob(blob, `${basename ?? planExportBasename(plan)}.docx`);
}

export async function exportPlan(
  planId: string,
  format: PlanExportFormat,
  summary?: Pick<PlanSummaryDto, "planId" | "goal" | "generatedAt">,
): Promise<void> {
  const basename = summary ? planExportBasename(summary) : undefined;

  if (format === "pdf") {
    await exportPlanPdf(planId, basename);
    return;
  }

  await exportPlanDocx(planId, basename);
}
