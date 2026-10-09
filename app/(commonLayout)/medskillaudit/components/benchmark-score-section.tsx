import { scoreThresholds, scoreWeights } from '../benchmark-data'
import { BenchmarkSection } from './benchmark-section'

export const BenchmarkScoreSection = () => (
  <BenchmarkSection
    id="score"
    eyebrow="05 / Final Score"
    title={
      <>
        One score, <span className="font-normal italic text-[#61615c]">two stages</span>.
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
                    ? 'font-[Georgia] text-4xl font-normal text-[#ffbd2e]'
                    : 'font-[Georgia] text-4xl font-normal text-[#7EAED5]'
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
        <div className="mt-6 border border-white/15 bg-white/5 p-5 text-sm leading-5 text-white/80">
          Final Score =
          <br />
          <span className="text-primary">Static Score × 40%</span>
          <br />+ <span className="text-[#7EAED5]">Dynamic Score × 60%</span>
        </div>
      </article>
      <div className="flex flex-col">
        <article
          aria-label="Release disposition thresholds"
          className="flex-1 overflow-hidden border border-[#e7e5de] bg-[#f7f7f5] text-[13px]"
        >
          <div className="grid grid-cols-[64px_76px_minmax(0,1fr)] gap-x-2 border-b border-[#e7e5de] bg-[#f7f7f5] px-[18px] py-3 text-[10.5px] font-bold uppercase tracking-[0.08em] text-[#777777] sm:grid-cols-[24%_22%_1fr]">
            <div>Score</div>
            <div>Grade</div>
            <div>Disposition</div>
          </div>
          <div>
            {scoreThresholds.map((threshold, index) => (
              <div
                key={threshold.range}
                className={`grid grid-cols-[64px_76px_minmax(0,1fr)] gap-x-2 px-[18px] py-3.5 leading-6 text-[#61615c] sm:grid-cols-[24%_22%_1fr] ${
                  index === scoreThresholds.length - 1 ? '' : 'border-b border-[#e7e5de]'
                }`}
              >
                <div className="whitespace-nowrap text-base font-bold text-[#111111]">
                  {threshold.range}
                </div>
                <div aria-hidden className="flex items-center gap-1 text-base leading-6">
                  {threshold.mark}
                  <span className="flex gap-1">
                    {[0, 1, 2, 3].map((mark) => (
                      <span
                        key={mark}
                        className={mark < 4 - index ? 'size-2 bg-[#ffbd2e]' : 'size-2 bg-[#e7e5de]'}
                      />
                    ))}
                  </span>
                </div>
                <div>
                  <span className="inline-flex items-center text-[13px] font-semibold text-[#171717]">
                    {threshold.grade}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </article>
        <p className="mt-3 text-[11.5px] leading-[1.6] text-[#61615c]">
          Release thresholds map the combined score onto an ordinal disposition — the same scale
          used by expert reviewers in the validation study.
        </p>
      </div>
    </div>
  </BenchmarkSection>
)
