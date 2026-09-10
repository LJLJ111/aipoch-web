import { CalendarDays } from 'lucide-react'
import type { StaticImageFileName } from '@/lib/static-assets'
import { OpenScienceImage } from './open-science-image'
import { OpenScienceSectionHeading, openScienceContainer } from './open-science-section'

const featuredModels = [
  {
    provider: 'OpenAI',
    title: 'Codex subscription',
    access: 'API · Codex Subscription',
    note: 'Available models vary by account'
  },
  {
    provider: 'xAI (Grok)',
    title: 'xAI (Grok) OAuth',
    access: 'API · OAuth',
    note: 'Available models vary by account'
  },
  {
    provider: 'Compatible API',
    title: 'Compatible models',
    access: 'Custom gateway',
    note: 'Self-hosted or third-party'
  },
  {
    provider: 'Anthropic',
    title: 'Anthropic',
    access: 'API · Claude Subscription',
    note: 'Available models vary by account'
  }
]
const providers: { name: string; access: string; icon: StaticImageFileName }[] = [
  { name: 'DeepSeek', access: 'API', icon: 'open-science-deepseek-fd515caf.webp' },
  { name: 'Bailian', access: 'API · Plan', icon: 'open-science-bailian-fe2dbefa.webp' },
  { name: 'Zhipu AI (GLM)', access: 'API · Coding Plan', icon: 'open-science-zhipu-63d0e7d0.webp' },
  { name: 'Kimi (Moonshot)', access: 'API · For Coding', icon: 'open-science-kimi-3257a67f.webp' },
  { name: 'MiniMax', access: 'API', icon: 'open-science-minimax-9fbdddf5.webp' },
  { name: 'StepFun', access: 'API · Step Plan', icon: 'open-science-stepfun-3cd51f05.svg' },
  { name: 'Xiaomi MIMO', access: 'API', icon: 'open-science-xiaomi-5cfca3f4.webp' },
  { name: 'SenseNova', access: 'API', icon: 'open-science-sensenova-80f4ed45.webp' },
  { name: 'Volcengine Ark', access: 'API', icon: 'open-science-volcengine-386151d7.webp' },
  {
    name: 'Tencent',
    access: 'TokenHub · Coding Plan · Token Plan',
    icon: 'open-science-tencent-5bb16b63.webp'
  },
  { name: 'NVIDIA', access: 'API', icon: 'open-science-nvidia-0b35490c.webp' },
  { name: 'OpenCode', access: 'Go · Zen', icon: 'open-science-opencode-c758aa5b.webp' },
  {
    name: 'OpenRouter',
    access: 'Aggregation Gateway',
    icon: 'open-science-openrouter-35ecbca9.webp'
  },
  { name: 'Apodex', access: 'API', icon: 'open-science-apodex-d1af886c.svg' }
]

export function OpenScienceModels() {
  return (
    <section className={`${openScienceContainer} py-16 lg:py-24`}>
      <OpenScienceSectionHeading
        eyebrow="Model agnostic"
        title="Can Open-Science use the latest AI models?"
      >
        Open-Science supports multiple model providers and agent backends. Connect a built-in
        provider, a compatible custom gateway, or an eligible Claude, Codex, or xAI subscription.
        Available models depend on your account, selected agent backend, API protocol, region, and
        installed Open-Science version.
      </OpenScienceSectionHeading>
      <div className="grid gap-4 md:grid-cols-2">
        {featuredModels.map((model, index) => (
          <article
            key={model.provider}
            data-open-science-reveal={(index % 2) * 0.08}
            className="bg-white p-7"
          >
            <p className="font-mono text-[10px] leading-4 tracking-normal text-[#6b6b66] uppercase">
              {model.provider}
            </p>
            <h3 className="mt-4 font-[Georgia,serif] text-[32px] leading-[1.15] tracking-normal sm:text-[38px]">
              {model.title}
            </h3>
            <p className="mt-4 text-sm leading-5">{model.access}</p>
            <p className="mt-1 flex items-center gap-2 text-sm leading-5 text-[#6b6b66]">
              <CalendarDays className="size-3.5 shrink-0" aria-hidden="true" />
              {model.note}
            </p>
          </article>
        ))}
      </div>
      <h3
        data-open-science-reveal=""
        className="mt-12 mb-4 text-center text-sm font-normal text-[#6b6b66] uppercase"
      >
        Also available
      </h3>
      <ul className="grid grid-cols-2 gap-x-5 gap-y-5 sm:px-6 lg:grid-cols-4 lg:px-10">
        {providers.map((provider, index) => (
          <li
            key={provider.name}
            data-open-science-reveal={(index % 4) * 0.04}
            className="flex items-start gap-3"
          >
            <OpenScienceImage
              asset={provider.icon}
              sizes="24px"
              className="mt-0.5 size-6 shrink-0 object-contain"
            />
            <div className="min-w-0">
              <p className="text-sm font-medium leading-5">{provider.name}</p>
              <p className="mt-1 text-xs leading-[18px] text-[#6b6b66]">{provider.access}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
