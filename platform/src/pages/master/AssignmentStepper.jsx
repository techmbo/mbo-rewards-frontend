import { ASSIGN_STEPS } from "./masterCampaignHelpers";

export function AssignmentStepper({ current, selectedCount = 0 }) {
  const currentIndex = Math.max(
    0,
    ASSIGN_STEPS.findIndex((step) => step.id === current),
  );

  return (
    <ol className="mb-5 grid gap-2 sm:grid-cols-3">
      {ASSIGN_STEPS.map((step, index) => {
        const done = index < currentIndex;
        const active = index === currentIndex;
        return (
          <li
            key={step.id}
            className={`rounded-xl border px-4 py-3 ${
              active
                ? "border-brand-500 bg-brand-50 shadow-[inset_0_0_0_1px_rgba(31,107,184,0.25)]"
                : done
                  ? "border-emerald-200 bg-emerald-50/70"
                  : "border-slate-200 bg-white"
            }`}
          >
            <p
              className={`text-[11px] font-semibold uppercase tracking-wide ${
                active ? "text-brand-700" : done ? "text-emerald-700" : "text-slate-400"
              }`}
            >
              Step {index + 1}
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{step.label}</p>
            <p className="mt-0.5 text-xs text-slate-500">
              {step.id === "select" && selectedCount
                ? `${selectedCount} Master Campaign${selectedCount === 1 ? "" : "s"} selected.`
                : step.id === "review" && selectedCount
                  ? `${selectedCount} draft${selectedCount === 1 ? "" : "s"} in queue.`
                  : step.hint}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
