'use client'

import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import type { ComponentProps } from 'react'
import { DayPicker, getDefaultClassNames } from 'react-day-picker'
import { cn } from '@/lib/utils'
import { buttonVariants } from './button'

type CalendarProps = ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = 'label',
  formatters,
  ...props
}: CalendarProps) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString('default', { month: 'short' }),
        ...formatters,
      }}
      className={cn('p-3', className)}
      classNames={{
        months: cn('relative flex flex-col gap-4 sm:flex-row', defaultClassNames.months),
        month: cn('flex w-full flex-col gap-4', defaultClassNames.month),
        month_caption: cn(
          'flex h-8 w-full items-center justify-center px-8',
          defaultClassNames.month_caption
        ),
        caption_label: cn(
          'font-medium select-none',
          captionLayout === 'label'
            ? 'text-sm'
            : 'flex h-8 items-center gap-1 rounded-md pr-1 pl-2 text-sm [&>svg]:size-3.5 [&>svg]:text-muted-foreground',
          defaultClassNames.caption_label
        ),
        dropdowns: cn(
          'flex h-8 w-full items-center justify-center gap-1.5 text-sm font-medium',
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn(
          'relative rounded-md border border-input shadow-xs has-focus:border-ring has-focus:ring-[3px] has-focus:ring-ring/50',
          defaultClassNames.dropdown_root
        ),
        dropdown: cn(
          'absolute inset-0 cursor-pointer opacity-0',
          defaultClassNames.dropdown
        ),
        nav: cn(
          'absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1',
          defaultClassNames.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: 'outline' }),
          'size-7 bg-transparent p-0 opacity-50 hover:opacity-100',
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: 'outline' }),
          'size-7 bg-transparent p-0 opacity-50 hover:opacity-100',
          defaultClassNames.button_next
        ),
        month_grid: cn('w-full border-collapse space-x-1', defaultClassNames.month_grid),
        weekdays: cn('flex', defaultClassNames.weekdays),
        weekday: cn(
          'text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]',
          defaultClassNames.weekday
        ),
        weeks: cn('', defaultClassNames.weeks),
        week: cn('flex w-full mt-2', defaultClassNames.week),
        day: cn(
          'relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].outside)]:bg-accent/50 [&:has([aria-selected])]:rounded-md',
          defaultClassNames.day
        ),
        day_button: cn(
          buttonVariants({ variant: 'ghost' }),
          'size-8 p-0 font-normal aria-selected:opacity-100',
          defaultClassNames.day_button
        ),
        selected: cn(
          'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
          defaultClassNames.selected
        ),
        today: cn('bg-accent text-accent-foreground', defaultClassNames.today),
        outside: cn('text-muted-foreground opacity-50', defaultClassNames.outside),
        disabled: cn('text-muted-foreground opacity-50', defaultClassNames.disabled),
        range_middle: cn(
          'aria-selected:bg-accent aria-selected:text-accent-foreground',
          defaultClassNames.range_middle
        ),
        hidden: cn('invisible', defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === 'left') {
            return <ChevronLeftIcon className={cn('size-4', className)} {...props} />
          }
          if (orientation === 'right') {
            return <ChevronRightIcon className={cn('size-4', className)} {...props} />
          }
          return <ChevronDownIcon className={cn('size-4', className)} {...props} />
        },
      }}
      {...props}
    />
  )
}

export { Calendar }
export type { CalendarProps }
