'use client'

import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import type * as React from 'react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from './button'
import { Calendar } from './calendar'
import { Popover, PopoverContent, PopoverTrigger } from './popover'

interface DateTimePickerProps {
  value?: Date | null
  onChange?: (date: Date | null) => void
  disabled?: boolean
  placeholder?: string
  className?: string
}

function DateTimePicker({
  value,
  onChange,
  disabled,
  placeholder = 'Pick a date & time',
  className,
}: DateTimePickerProps) {
  const [open, setOpen] = useState(false)

  const [timeInput, setTimeInput] = useState(() => {
    if (value) return format(value, 'HH:mm')
    return '00:00'
  })

  function handleDaySelect(day: Date | undefined) {
    if (!day) {
      onChange?.(null)
      return
    }
    const [hours, minutes] = timeInput.split(':').map(Number)
    const next = new Date(day)
    next.setHours(hours ?? 0, minutes ?? 0, 0, 0)
    onChange?.(next)
  }

  function handleTimeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const t = e.target.value
    setTimeInput(t)
    if (value) {
      const [hours, minutes] = t.split(':').map(Number)
      const next = new Date(value)
      next.setHours(hours ?? 0, minutes ?? 0, 0, 0)
      onChange?.(next)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            'w-full justify-start text-left font-normal',
            !value && 'text-muted-foreground',
            className
          )}
        >
          <CalendarIcon className="mr-2 size-4" />
          {value ? format(value, 'yyyy-MM-dd HH:mm') : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value ?? undefined}
          defaultMonth={value ?? undefined}
          captionLayout="dropdown"
          onSelect={handleDaySelect}
          initialFocus
        />
        <div className="border-t p-3">
          <label htmlFor="date-time-picker-time" className="mb-1.5 block text-xs font-medium text-muted-foreground">Time</label>
          <input
            id="date-time-picker-time"
            type="time"
            value={timeInput}
            onChange={handleTimeChange}
            className="border-input focus:border-ring focus:ring-ring/50 w-full rounded-md border px-2 py-1 text-sm outline-none focus:ring-[3px]"
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}

export { DateTimePicker }
export type { DateTimePickerProps }
