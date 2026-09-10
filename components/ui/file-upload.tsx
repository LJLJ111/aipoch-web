'use client'

import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { CheckCircle2, Clock, CloudUpload, FileArchive, Loader2, Trash2 } from 'lucide-react'
import { useCallback } from 'react'
import type { Accept, FileRejection } from 'react-dropzone'
import { useDropzone } from 'react-dropzone'

// ─── Types ────────────────────────────────────────────────────────────────────

export type UploadFileStatus = 'ready' | 'uploading' | 'uploaded'

export interface UploadFileEntry {
  /** Stable ID used as React key and for onRemove callback */
  id: string
  name: string
  /** File size in bytes; only available before upload completes */
  size?: number
  status: UploadFileStatus
  /** Raw File object; only available in ready/uploading status */
  file?: File
}

export interface FileUploadProps {
  /** Max number of files allowed; defaults to 1 */
  maxFiles?: number
  /** Accepted extensions, comma-separated (e.g. ".zip" or ".jpg,.png") */
  accept?: string
  files: UploadFileEntry[]
  onAdd: (files: File[]) => void
  onRemove: (id: string) => void
  onReject?: (rejections: FileRejection[]) => void
  disabled?: boolean
  /** Highlight dropzone border in error color */
  invalid?: boolean
  /** id forwarded to the hidden <input> for external <label htmlFor="..."> */
  inputId?: string
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

const MIME_MAP: Record<string, string[]> = {
  '.zip': ['application/zip', 'application/x-zip-compressed', 'application/octet-stream'],
  '.pdf': ['application/pdf'],
  '.png': ['image/png'],
  '.jpg': ['image/jpeg'],
  '.jpeg': ['image/jpeg'],
  '.gif': ['image/gif'],
  '.svg': ['image/svg+xml'],
  '.webp': ['image/webp'],
  '.json': ['application/json', 'application/octet-stream']
}

function buildAccept(accept: string): Accept {
  const exts = accept.split(',').map((s) => s.trim().toLowerCase())
  const result: Record<string, string[]> = {}
  for (const ext of exts) {
    const mimes = MIME_MAP[ext]
    if (mimes) {
      for (const mime of mimes) {
        if (!result[mime]) result[mime] = []
        result[mime].push(ext)
      }
    } else if (ext.startsWith('.')) {
      if (!result['application/octet-stream']) result['application/octet-stream'] = []
      result['application/octet-stream'].push(ext)
    }
  }
  return result as Accept
}

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  UploadFileStatus,
  { label: string; badgeClass: string; Icon: React.ElementType; iconClass?: string }
> = {
  ready: { label: 'Ready', badgeClass: 'bg-amber-100 text-amber-700', Icon: Clock },
  uploading: {
    label: 'Uploading',
    badgeClass: 'bg-blue-100 text-blue-700',
    Icon: Loader2,
    iconClass: 'animate-spin'
  },
  uploaded: { label: 'Uploaded', badgeClass: 'bg-emerald-100 text-emerald-700', Icon: CheckCircle2 }
}

function StatusBadge({ status }: { status: UploadFileStatus }) {
  const { label, badgeClass, Icon, iconClass } = STATUS_CONFIG[status]
  return (
    <span
      className={cn(
        'flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        badgeClass
      )}
    >
      <Icon className={cn('size-3', iconClass)} />
      {label}
    </span>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function FileUpload({
  maxFiles = 1,
  accept = '.zip',
  files,
  onAdd,
  onRemove,
  onReject,
  disabled,
  invalid,
  inputId = 'file-upload-input'
}: FileUploadProps) {
  const total = files.length
  const remaining = maxFiles - total
  const atLimit = remaining <= 0

  const addAcceptedFiles = useCallback(
    (selectedFiles: File[]) => {
      if (selectedFiles.length === 0) {
        return
      }

      const acceptedFiles = selectedFiles.slice(0, remaining)
      if (acceptedFiles.length === 0) {
        return
      }

      onAdd(acceptedFiles)
    },
    [onAdd, remaining]
  )

  const onDrop = useCallback(
    (accepted: File[], rejected: FileRejection[]) => {
      if (rejected.length > 0) {
        onReject?.(rejected)
      }

      addAcceptedFiles(accepted)
    },
    [addAcceptedFiles, onReject]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: buildAccept(accept),
    maxFiles: remaining,
    disabled: disabled || atLimit,
    multiple: maxFiles > 1
  })

  return (
    <div className="flex min-w-0 flex-col gap-2">
      {/* Drop zone, hidden when the file limit is reached. */}
      {!atLimit && (
        <div
          {...getRootProps()}
          className={cn(
            'flex cursor-pointer flex-row items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 transition-colors select-none',
            isDragActive
              ? 'border-primary bg-primary/5'
              : invalid
                ? 'border-destructive/60 bg-destructive/5 hover:border-destructive/80'
                : 'border-border/60 bg-muted/20 hover:border-primary/50 hover:bg-muted/40',
            disabled && 'cursor-not-allowed opacity-50'
          )}
        >
          <input {...getInputProps({ id: inputId })} />
          <CloudUpload
            className={cn(
              'size-8',
              isDragActive
                ? 'text-primary'
                : invalid
                  ? 'text-destructive/60'
                  : 'text-muted-foreground'
            )}
          />
          <div className="text-center">
            <p className="text-sm font-medium">
              {isDragActive ? 'Drop files here' : 'Drag & drop or click to select'}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Accepted: <span className="font-mono">{accept}</span>
              <span> · </span>
              <span className="text-xs text-muted-foreground">
                <span className={cn('font-medium', atLimit ? 'text-foreground' : 'text-primary')}>
                  {total}
                </span>
                <span>
                  {' '}
                  / {maxFiles} {maxFiles === 1 ? 'file' : 'files'}
                </span>
              </span>
            </p>
          </div>
        </div>
      )}

      {/* File list. */}
      {files.length > 0 && (
        <ul className="flex min-w-0 flex-col gap-1.5">
          {files.map((entry) => (
            <li
              key={entry.id}
              aria-label={entry.name}
              className="flex min-w-0 items-center gap-2.5 overflow-hidden rounded-md border border-border/50 bg-background px-3 py-2"
            >
              <FileArchive className="size-4 shrink-0 text-muted-foreground" />
              {/* Allow the file name to shrink in narrow containers and expose the full name in a tooltip. */}
              <div className="flex min-w-0 flex-1 items-baseline gap-2 overflow-hidden">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="w-0 min-w-0 flex-1 truncate text-sm" title={entry.name}>
                        {entry.name}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-80 break-all">
                      {entry.name}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                {entry.size !== undefined && (
                  <span className="flex-none text-xs text-muted-foreground">
                    {formatSize(entry.size)}
                  </span>
                )}
              </div>
              <StatusBadge status={entry.status} />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled={disabled || entry.status === 'uploading'}
                aria-label="Remove file"
                onClick={() => onRemove(entry.id)}
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
