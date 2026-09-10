import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

interface ErrorStateProps {
  onRetry?: () => void
}

export function ErrorState({ onRetry }: ErrorStateProps) {
  return (
    <div className="py-16 flex justify-center">
      <Alert variant="destructive" className="max-w-md border-red-200 bg-red-100">
        <AlertCircle className="size-4" />
        <AlertTitle>Error loading skills</AlertTitle>
        <AlertDescription className="mt-2">
          <p className="mb-4">
            Failed to load skills data. Please check your connection and try again.
          </p>
          <Button variant="outline" size="sm" onClick={onRetry} className="px-4">
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  )
}
