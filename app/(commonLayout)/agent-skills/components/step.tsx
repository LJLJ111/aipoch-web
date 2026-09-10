'use client'

interface StepProps {
  index: string
  name: string
  className?: string
}

export function Step({ index, name, className = '' }: StepProps) {
  return (
    <span className={`text-xs font-light uppercase tracking-wider text-black/40 ${className}`}>
      {index} / {name}
    </span>
  )
}
