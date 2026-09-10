import { useCallback, useState } from 'react'

/**
 * Shared hook for managing file upload state.
 *
 * Responsibilities:
 * 1. Manage the local file queue.
 * 2. Manage ready / uploading / uploaded state transitions.
 * 3. Manage upload errors.
 *
 * The caller remains responsible for:
 * 1. Required-field validation.
 * 2. Choosing the upload endpoint.
 * 3. Interpreting application-specific responses.
 *
 * The caller must inject the upload operation through `uploadFile`.
 */

export type ManagedFileStatus = 'ready' | 'uploading' | 'uploaded'

/**
 * Minimal metadata that can be written to shared state after a successful upload.
 */
export interface UploadedFileMeta {
  /**
   * Server-side file identifier.
   * Populate this field in the mapping function when a later form submission needs the file ID.
   */
  serverId?: string
  /**
   * Display name after a successful upload.
   * Defaults to the original file name when omitted.
   */
  fileName?: string
}

/**
 * State of a single file managed by the hook.
 */
export interface ManagedFile {
  /** Stable local ID used as the render key and to remove the file. */
  localId: string
  fileName: string
  fileSize?: number
  status: ManagedFileStatus
  /** Retain the original File object only in the ready and uploading states. */
  file?: File
  /** Available only after a successful upload. */
  serverId?: string
}

/**
 * Configuration for the shared upload hook.
 */
export interface UseFileUploadOptions<TUploadResult> {
  /** Upload function supplied by the application. */
  uploadFile: (file: File) => Promise<TUploadResult>
  /**
   * Map the application-specific upload result to the minimal fields required by shared state.
   * Defaults to the original file name when no mapping is provided.
   */
  mapUploadedFile?: (result: TUploadResult, originalFile: File) => UploadedFileMeta
}

/**
 * Return value of the shared upload hook.
 */
export interface UseFileUploadReturn<TUploadResult> {
  files: ManagedFile[]
  isUploading: boolean
  uploadError: string | null
  /** Append one or more files to the upload queue. */
  addFiles: (files: File[]) => void
  /** Remove a file by its local ID. */
  removeFile: (localId: string) => void
  /** Clear all files and errors. */
  clearAll: () => void
  /**
   * Upload every file currently in the ready state.
   *
   * Behavior:
   * 1. Upload only ready files.
   * 2. Mark all selected files as uploading before starting.
   * 3. When all uploads succeed, mark them as uploaded and release their original File references.
   * 4. If any upload fails, revert this batch's uploading files to ready.
   * 5. Return results in queue order.
   */
  upload: () => Promise<TUploadResult[]>
}

type ReadyManagedFile = ManagedFile & {
  status: 'ready'
  file: File
}

let idCounter = 0

const nextId = () => `managed-${(++idCounter).toString()}`

const getRequiredItemAt = <T,>(items: T[], index: number, errorMessage: string): T => {
  if (!(index in items)) {
    throw new Error(errorMessage)
  }

  return items[index] as T
}

export const useFileUpload = <TUploadResult>({
  uploadFile,
  mapUploadedFile
}: UseFileUploadOptions<TUploadResult>): UseFileUploadReturn<TUploadResult> => {
  const [files, setFiles] = useState<ManagedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const addFiles = useCallback((incoming: File[]) => {
    if (incoming.length === 0) return

    setUploadError(null)
    setFiles((prev) => [
      ...prev,
      ...incoming.map((file) => ({
        localId: nextId(),
        fileName: file.name,
        fileSize: file.size,
        status: 'ready' as const,
        file
      }))
    ])
  }, [])

  const removeFile = useCallback((localId: string) => {
    setFiles((prev) => prev.filter((file) => file.localId !== localId))
  }, [])

  const clearAll = useCallback(() => {
    setFiles([])
    setUploadError(null)
  }, [])

  const upload = useCallback(async (): Promise<TUploadResult[]> => {
    const readyFiles = files.filter(
      (file): file is ReadyManagedFile => file.status === 'ready' && file.file instanceof File
    )
    const uploadTargets = readyFiles.map((file) => ({
      localId: file.localId,
      fileName: file.fileName,
      fileSize: file.fileSize,
      originalFile: file.file
    }))

    if (uploadTargets.length === 0) {
      return []
    }

    setIsUploading(true)
    setUploadError(null)

    setFiles((prev) =>
      prev.map((file) =>
        file.status === 'ready' ? { ...file, status: 'uploading' as const } : file
      )
    )

    try {
      const results = await Promise.all(
        uploadTargets.map(({ originalFile }) => uploadFile(originalFile))
      )

      setFiles((prev) =>
        prev.map((file) => {
          const readyFileIndex = uploadTargets.findIndex(
            (readyFile) => readyFile.localId === file.localId
          )

          if (readyFileIndex === -1) {
            return file
          }

          const uploadTarget = getRequiredItemAt(
            uploadTargets,
            readyFileIndex,
            'Upload target is missing for the current file.'
          )
          const result = getRequiredItemAt(
            results,
            readyFileIndex,
            'Upload result is missing for the current file.'
          )
          const originalFile = uploadTarget.originalFile
          const mappedFile = mapUploadedFile?.(result, originalFile)

          return {
            localId: file.localId,
            fileName: mappedFile?.fileName ?? originalFile.name,
            fileSize: file.fileSize,
            status: 'uploaded' as const,
            serverId: mappedFile?.serverId
          }
        })
      )

      return results
    } catch (error) {
      setFiles((prev) =>
        prev.map((file) =>
          file.status === 'uploading' ? { ...file, status: 'ready' as const } : file
        )
      )

      setUploadError(error instanceof Error ? error.message : 'Unable to upload file.')
      throw error
    } finally {
      setIsUploading(false)
    }
  }, [files, mapUploadedFile, uploadFile])

  return { files, isUploading, uploadError, addFiles, removeFile, clearAll, upload }
}

/**
 * Usage example (admin):
 *
 * ```ts
 * const fileUpload = useFileUpload<FileUploadResponse>({
 *   uploadFile,
 *   mapUploadedFile: (result) => ({
 *     serverId: result.id,
 *     fileName: result.file_name
 *   })
 * })
 * ```
 */
