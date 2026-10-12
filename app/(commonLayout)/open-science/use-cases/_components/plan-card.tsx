'use client'

// Static-replay port of the app's WorkspacePlanActivityRecord card body:
// task summary, numbered steps, and the feasibility footer. Read-only — the
// app's per-step expansion, annotations, and live status icons do not apply.

import type { PlanProjection } from './plan-projection'
import { PLAN_CONFIDENCE_LABELS } from './plan-projection'

export const PlanCard = ({ projection }: { projection: PlanProjection }) => {
  if (projection.kind !== 'content') return null
  return (
    <div className="overflow-hidden rounded-md border border-border-200 bg-bg-000 px-3.5 py-3">
      <p className="m-0 text-[13px] font-semibold leading-[1.45] text-text-000">
        {projection.taskSummary}
      </p>
      <ol className="mt-2.5 grid list-none gap-1.5 p-0">
        {projection.steps.map((step) => (
          <li
            key={step.number}
            className="grid grid-cols-[20px_minmax(0,1fr)] items-start text-[12px] text-text-100"
          >
            <span className="pt-0.5 text-[10px] font-semibold text-text-300 tabular-nums">
              {step.number}.
            </span>
            <div className="min-w-0">
              <p className="m-0 text-[12px] text-text-000">{step.title}</p>
              <p className="m-0 mt-0.5 text-[10.5px] leading-[1.5] text-text-300">
                {step.description}
              </p>
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-3 flex items-start gap-2 border-t border-border-200 pt-2.5 text-[11px] text-text-300">
        <span className="shrink-0 whitespace-nowrap rounded-[5px] bg-bg-200 px-1.5 py-0.5 text-[10px] text-text-100">
          {PLAN_CONFIDENCE_LABELS[projection.feasibility.confidence]}
        </span>
        <span>{projection.feasibility.summary}</span>
      </div>
    </div>
  )
}
