'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'
import type * as React from 'react'

interface DialogModalProps {
  isOpen: boolean
  title: string
  onClose: () => void
  closeOnOverlayClick?: boolean
  className?: string
  children: React.ReactNode
}

export function DialogModal({
  isOpen,
  title,
  onClose,
  closeOnOverlayClick = true,
  className,
  children
}: DialogModalProps) {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent
        className={cn(
          'sm:max-w-lg sm:mx-4 rounded-none border border-black p-0 gap-0 overflow-hidden',
          className
        )}
        onInteractOutside={(e) => {
          if (!closeOnOverlayClick) {
            e.preventDefault()
          }
        }}
        showCloseButton={false}
      >
        <DialogHeader className="flex flex-row border-y border-b-black items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-zinc-100">
          <DialogTitle className="text-xs font-bold font-mono uppercase tracking-wider text-black">
            {title}
          </DialogTitle>
          <button
            type="button"
            onClick={onClose}
            className="text-black/40 cursor-pointer hover:text-black/80 transition-colors"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </DialogHeader>

        {/* Content */}
        <div className="p-4 sm:p-6">{children}</div>
      </DialogContent>
    </Dialog>
  )
}
