'use client'

import { AlertCircle } from 'lucide-react'
import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class MarkdownErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="rounded-lg border border-red-200 bg-red-50/70 p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
            <div className="space-y-2">
              <h3 className="font-medium text-red-800">Markdonw Render Error</h3>
              <p className="text-sm text-red-600">
                Skill markdown preview render faild, you can download to view source file.
              </p>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
