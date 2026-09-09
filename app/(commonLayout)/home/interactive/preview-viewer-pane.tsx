'use client'

export const previewTabs = ['data', 'docs', 'img', 'code', 'mol', 'nb'] as const
export type PreviewTab = (typeof previewTabs)[number]

export const previewLabels: Record<PreviewTab, string> = {
  data: 'Data',
  docs: 'Documents',
  img: 'Images',
  code: 'Source',
  mol: 'Structures',
  nb: 'Notebook'
}

export const previewChrome: Record<PreviewTab, { caption: string; metadata: readonly string[] }> = {
  data: {
    caption: 'summary.csv · 1,284 rows × 6 columns',
    metadata: ['tables', 'logged', 'open to review']
  },
  docs: {
    caption: 'plan.md · document preview',
    metadata: ['documents', 'gated by your approval']
  },
  img: {
    caption: 'forest-plot.svg · meta-analysis figure',
    metadata: ['images', 'generated artifact']
  },
  code: {
    caption: 'analysis.py · source preview',
    metadata: ['source code', 'run with your approval']
  },
  mol: {
    caption: 'structure.mol · 2D structure',
    metadata: ['molecular structures and reactions']
  },
  nb: {
    caption: 'notebook history · Python kernel',
    metadata: ['notebook history', 'persists across restarts']
  }
}

export const ViewerPane = ({ active }: { active: PreviewTab }) => {
  if (active === 'docs')
    return (
      <div className="text-[12.5px] leading-[1.7] text-[#b7bcc6]">
        <p className="mb-[3px] text-sm font-bold text-white">Analysis plan — cohort comparison</p>
        <p className="mb-3 font-mono text-[10px] text-[#5f6470]">
          plan.md · drafted by the agent · awaiting your approval
        </p>
        <p className="mb-[11px]">
          Compare the treatment and control arms in{' '}
          <code className="bg-white/[.08] px-1 text-[#e7e9ee]">cohort.csv</code>, adjusting for
          baseline covariates, and export the tables and figures the report needs.
        </p>
        <ol className="flex list-decimal flex-col gap-1.5 pl-5 text-[#9aa0ab] marker:text-[#7d828d]">
          <li>
            <b className="font-semibold text-white">Load &amp; validate</b> — read{' '}
            <code className="bg-white/[.08] px-1 text-[#e7e9ee]">cohort.csv</code>, check the schema,
            flag missing values.
          </li>
          <li>
            <b className="font-semibold text-white">Summarise baseline</b> — describe each arm (age,
            sex, comorbidity) in one table.
          </li>
          <li>
            <b className="font-semibold text-white">Fit the outcome model</b> — regress outcome on arm
            with covariate adjustment.
          </li>
          <li>
            <b className="font-semibold text-white">Produce artifacts</b> — write summary tables and
            effect-size figures to the preview.
          </li>
        </ol>
      </div>
    )
  if (active === 'data')
    return (
      <table className="w-full border-collapse text-left font-mono text-[11px]">
        <thead>
          <tr>
            {['Column', 'Type', 'Distribution'].map((heading) => (
              <th
                className="border-b border-white/[.08] px-2 py-1.5 text-[9.5px] font-medium uppercase tracking-[0.08em] text-[#7d828d]"
                key={heading}
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[
            ['subject_id', 'string', '100%', '1,284 unique', false],
            ['arm', 'category', '50%', 'treat 642 / ctrl 642', false],
            ['age', 'float', '68%', 'mean 54.2 ± 11.6', false],
            ['baseline', 'float', '44%', 'mean 7.8', false],
            ['outcome', 'float', '57%', 'mean 9.1', true],
            ['adverse_evt', 'boolean', '12%', 'true 12%', false]
          ].map(([col, type, width, note, accent]) => (
            <tr className="border-b border-white/[.05] last:border-b-0" key={String(col)}>
              <td
                className={`px-2 py-[7px] ${accent ? 'text-[#ecd44c]' : 'text-[#e7e9ee]'}`}
              >
                {col}
              </td>
              <td className="px-2 py-[7px] text-[#7d828d]">{type}</td>
              <td className="px-2 py-[7px]">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-[42%] overflow-hidden rounded-full bg-white/10">
                    <i
                      className={`block h-full ${accent ? 'bg-[#ecd44c]' : 'bg-white/50'}`}
                      style={{ width: String(width) }}
                    />
                  </span>
                  <span className="whitespace-nowrap text-[10px] text-[#8b909b]">{note}</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )
  if (active === 'code')
    return (
      <pre className="overflow-auto p-0.5 font-mono text-[11.5px] leading-[1.75] whitespace-pre text-[#cfd3db]">
        <span className="text-[#5f6470]"># shared terminal · session state held</span>
        {'\n'}
        <span className="text-[#ecd44c]">import</span> pandas{' '}
        <span className="text-[#ecd44c]">as</span> pd{'\n\n'}df = pd.read_csv(
        <span className="text-[#7fd0a6]">&quot;cohort.csv&quot;</span>){'\n'}summary = df.groupby(
        <span className="text-[#7fd0a6]">&quot;arm&quot;</span>).describe()
        {'\n'}summary.to_csv(<span className="text-[#7fd0a6]">&quot;summary.csv&quot;</span>)
      </pre>
    )
  if (active === 'img')
    return (
      <div className="font-mono">
        <div className="mb-2 grid grid-cols-[88px_1fr_108px] gap-2.5 border-b border-white/[.08] px-0.5 pb-2 text-[9px] uppercase tracking-[0.08em] text-[#7d828d]">
          <span>Study</span>
          <span />
          <span className="text-right">OR (95% CI)</span>
        </div>
        <div className="relative">
          <i className="absolute top-1 bottom-1 left-[calc(50%-9px)] border-l border-dashed border-white/[.22]" />
          {[
            {
              name: 'Cohort A',
              ciLeft: '17.5%',
              ciWidth: '40.8%',
              pointLeft: '35%',
              value: '0.82 (0.61–1.10)',
              pooled: false
            },
            {
              name: 'Cohort B',
              ciLeft: '12.5%',
              ciWidth: '39.2%',
              pointLeft: '29.2%',
              value: '0.75 (0.55–1.02)',
              pooled: false
            },
            {
              name: 'Cohort C',
              ciLeft: '25%',
              ciWidth: '34.2%',
              pointLeft: '40%',
              value: '0.88 (0.70–1.11)',
              pooled: false
            },
            {
              name: 'Cohort D',
              ciLeft: '7.5%',
              ciWidth: '45%',
              pointLeft: '25.8%',
              value: '0.71 (0.49–1.03)',
              pooled: false
            },
            {
              name: 'Pooled',
              ciLeft: '0',
              ciWidth: '0',
              pointLeft: '32.5%',
              value: '0.79 (0.68–0.92)',
              pooled: true
            }
          ].map((row) => (
            <div
              className={`grid grid-cols-[88px_1fr_108px] items-center gap-2.5 px-0.5 py-[7px] ${row.pooled ? 'mt-0.5 border-t border-dashed border-white/[.12] pt-[9px]' : ''}`}
              key={row.name}
            >
              <span className={`text-[10.5px] ${row.pooled ? 'text-white' : 'text-[#c3c7d0]'}`}>
                {row.name}
              </span>
              <span className="relative h-3.5">
                {!row.pooled ? (
                  <>
                    <i
                      className="absolute top-1/2 h-px -translate-y-1/2 bg-white/40 before:absolute before:top-[-3px] before:left-0 before:h-1.5 before:w-px before:bg-white/40 after:absolute after:top-[-3px] after:right-0 after:h-1.5 after:w-px after:bg-white/40"
                      style={{ left: row.ciLeft, width: row.ciWidth }}
                    />
                    <i
                      className="absolute top-1/2 size-[7px] -translate-x-1/2 -translate-y-1/2 bg-[#e7e9ee]"
                      style={{ left: row.pointLeft }}
                    />
                  </>
                ) : (
                  <i
                    className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rotate-45 border border-[#caa93a] bg-[#ecd44c]"
                    style={{ left: row.pointLeft }}
                  />
                )}
              </span>
              <span className="text-right text-[9.5px] text-[#8b909b]">{row.value}</span>
            </div>
          ))}
        </div>
      </div>
    )
  if (active === 'mol')
    return (
      <div className="flex w-full flex-col items-center justify-center">
        <svg className="mx-auto w-full max-w-[280px]" viewBox="0 0 260 128" aria-hidden="true">
          <polygon
            className="fill-none stroke-[#e7e9ee] stroke-[1.5]"
            points="70,44 100,62 100,98 70,116 40,98 40,62"
          />
          <line className="stroke-white/30 stroke-[1.5]" x1="66" y1="52" x2="66" y2="90" />
          <line className="stroke-white/30 stroke-[1.5]" x1="96" y1="69" x2="74" y2="106" />
          <line className="stroke-white/30 stroke-[1.5]" x1="44" y1="69" x2="66" y2="52" />
          <line className="stroke-[#e7e9ee] stroke-[1.5]" x1="100" y1="62" x2="130" y2="44" />
          <line className="stroke-[#e7e9ee] stroke-[1.5]" x1="130" y1="44" x2="160" y2="62" />
          <line className="stroke-[#e7e9ee] stroke-[1.5]" x1="160" y1="62" x2="190" y2="44" />
          <line className="stroke-[#e7e9ee] stroke-[1.5]" x1="190" y1="44" x2="220" y2="62" />
          <circle className="fill-[#0f1013] stroke-[#e7e9ee] stroke-[1.5]" cx="130" cy="44" r="4" />
          <text className="fill-[#8b909b] font-mono text-[9px]" x="124" y="34">
            N
          </text>
          <circle
            className="fill-[#ecd44c] stroke-[#0f1013] stroke-[1]"
            cx="220"
            cy="62"
            r="4.4"
          />
          <text className="fill-[#8b909b] font-mono text-[9px]" x="228" y="66">
            OH
          </text>
        </svg>
        <div className="mt-1.5 flex justify-center gap-3.5 font-mono text-[10px] text-[#7d828d]">
          <span>
            <b className="text-[#e7e9ee]">C₉H₁₃NO</b>
          </span>
          <span>MW 151.21</span>
          <span>PubChem</span>
        </div>
      </div>
    )
  return (
    <div className="font-mono text-[11.5px] text-[#9aa0ab]">
      {[
        'kernel started · Python',
        'load project files referenced with @',
        'run analysis cell · output logged',
        'figure written to preview panel',
        'reviewer audit of completed turn',
        'kernel state held for the next turn'
      ].map((text, index) => (
        <div
          className="flex gap-3 border-b border-dashed border-white/[.08] py-1.5 last:border-b-0"
          key={text}
        >
          <b className="shrink-0 font-normal text-[#5f6470]">[{index + 1}]</b>
          {text}
        </div>
      ))}
    </div>
  )
}
