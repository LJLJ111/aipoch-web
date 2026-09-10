import { scoreThresholds, scoreWeights } from '../benchmark-data'
import { BenchmarkSection } from './benchmark-section'

const thresholdToneClass = {
  production: 'border-green-200 bg-green-50 text-green-800',
  limited: 'border-amber-300 bg-amber-50 text-amber-800',
  beta: 'border-orange-300 bg-orange-50 text-orange-800',
  reject: 'border-red-200 bg-red-50 text-red-800'
} as const

export const BenchmarkScoreSection = () => (
  <BenchmarkSection
    id="score"
    eyebrow="05 / Final Score"
    title={
      <>
        One score, <span className="font-normal italic text-[#555555]">two stages</span>.
      </>
    }
    description="Skills that clear both veto gates receive a final quality score. MedSkillAudit uses a two-stage scoring system — static evaluation (design quality) and dynamic evaluation (runtime performance) — combined into one overall figure that maps directly to a deployment disposition."
  >
    <div className="grid gap-6 lg:grid-cols-[1.05fr_1fr]">
      <article className="bg-[#151515] p-6 text-white sm:p-8">
        <div className="grid gap-4 sm:grid-cols-2">
          {scoreWeights.map((weight) => (
            <div key={weight.label} className="border border-white/15 p-5">
              <div
                className={
                  weight.label === 'Static'
                    ? 'text-4xl font-bold text-primary'
                    : 'text-4xl font-bold text-[#7EAED5]'
                }
              >
                {weight.value}%
              </div>
              <div className="mt-2 text-xs font-bold uppercase tracking-[0.08em]">
                {weight.label}
              </div>
              <p className="mt-2 text-xs leading-5 text-white/60">
                {weight.label === 'Static'
                  ? 'Design quality — 8 dimensions, 25 criteria.'
                  : 'Runtime performance on generated medical-task inputs.'}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-6 border border-white/15 bg-white/5 p-5 font-mono text-sm leading-7 text-white/80">
          Final Score =
          <br />
          <span className="text-primary">Static Score × 40%</span>
          <br />+ <span className="text-[#7EAED5]">Dynamic Score × 60%</span>
        </div>
      </article>
      <div className="flex flex-col">
        <article
          aria-label="Release disposition thresholds"
          className="flex-1 overflow-hidden border border-[#DDDDDD] bg-white text-[13px]"
        >
          <div className="grid grid-cols-[24%_20%_1fr] border-b border-[#E4E4E4] bg-[#F3F3F3] px-[18px] py-3 text-[10.5px] font-bold uppercase tracking-[0.08em] text-[#777777]">
            <div>Score</div>
            <div>Grade</div>
            <div>Disposition</div>
          </div>
          <div>
            {scoreThresholds.map((threshold, index) => (
              <div
                key={threshold.range}
                className={`grid grid-cols-[24%_20%_1fr] px-[18px] py-3.5 leading-6 text-[#555555] ${
                  index === scoreThresholds.length - 1 ? '' : 'border-b border-[#E4E4E4]'
                }`}
              >
                <div className="whitespace-nowrap text-base font-bold text-[#111111]">
                  {threshold.range}
                </div>
                <div aria-hidden className="text-base leading-6">
                  {threshold.mark}
                </div>
                <div>
                  <span
                    className={`inline-flex items-center whitespace-nowrap border px-2.5 py-[3px] text-[11px] font-bold tracking-[0.02em] ${thresholdToneClass[threshold.tone]}`}
                  >
                    {threshold.grade}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </article>
        <p className="mt-3 text-[11.5px] leading-[1.6] text-[#707070]">
          Release thresholds map the combined score onto an ordinal disposition — the same scale
          used by expert reviewers in the validation study.
        </p>
      </div>
    </div>
  </BenchmarkSection>
)
