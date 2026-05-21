import type { PlanSummaryDto } from "../../Types/global-types";
import type { PlanExportFormat } from "../../utils/planExport";

type Props = {
  plan: PlanSummaryDto;
  exporting: { planId: string; format: PlanExportFormat } | null;
  onExport: (plan: PlanSummaryDto, format: PlanExportFormat) => void;
  compact?: boolean;
};

const FORMATS: { format: PlanExportFormat; label: string }[] = [
  { format: "pdf", label: "PDF" },
  { format: "docx", label: "Word" },
];

export default function PlanExportButtons({ plan, exporting, onExport, compact }: Props) {
  const busy = exporting?.planId === plan.planId;

  return (
    <div
      className={`plan-export-actions${compact ? " plan-export-actions--compact" : ""}`}
      role="group"
      aria-label="Export plan"
    >
      {FORMATS.map(({ format, label }) => {
        const active = busy && exporting?.format === format;
        return (
          <button
            key={format}
            type="button"
            className="btn btn-sm btn-light"
            disabled={!!exporting}
            title={`Export as ${label}`}
            onClick={() => void onExport(plan, format)}
          >
            {active ? "…" : label}
          </button>
        );
      })}
    </div>
  );
}
