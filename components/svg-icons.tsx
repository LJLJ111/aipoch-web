import { cn } from '@/lib/utils'

interface IconProps {
  className?: string
}

/**
 * Logo Preview:
 *
 * ![Logo](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxNSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utb3BhY2l0eT0iMC40IiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiLz48Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIyIiBmaWxsPSIjMDAwIi8+PC9zdmc+)
 *
 */
export function LogoIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Outer circle with border */}
      <circle
        cx="16"
        cy="16"
        r="15"
        stroke="currentColor"
        strokeOpacity="0.4"
        strokeWidth="1"
        fill="none"
      />
      {/* Center dot */}
      <circle cx="16" cy="16" r="2" fill="currentColor" />
    </svg>
  )
}

/**
 * Web Radar Preview:
 *
 * ![WebRadar](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCAyMDAgMjAwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iOTUiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLW9wYWNpdHk9IjAuMiIgc3Ryb2tlLXdpZHRoPSIwLjUiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjY1IiBzdHJva2U9IiMwMDAiIHN0cm9rZS1vcGFjaXR5PSIwLjMiIHN0cm9rZS13aWR0aD0iMC41Ii8+PGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSIzNSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utb3BhY2l0eT0iMC40IiBzdHJva2Utd2lkdGg9IjAuNSIvPjxsaW5lIHgxPSIxMDAiIHkxPSIxMDAiIHgyPSIxMDAiIHkyPSI1IiBzdHJva2U9IiMwMDAiIHN0cm9rZS1vcGFjaXR5PSIwLjMiIHN0cm9rZS13aWR0aD0iMC41Ii8+PGxpbmUgeDE9IjEwMCIgeTE9IjEwMCIgeDI9IjE0MSIgeTI9IjI5IiBzdHJva2U9IiMwMDAiIHN0cm9rZS1vcGFjaXR5PSIwLjMiIHN0cm9rZS13aWR0aD0iMC41Ii8+PGxpbmUgeDE9IjEwMCIgeTE9IjEwMCIgeDI9IjE3MSIgeTI9IjcxIiBzdHJva2U9IiMwMDAiIHN0cm9rZS1vcGFjaXR5PSIwLjMiIHN0cm9rZS13aWR0aD0iMC41Ii8+PGxpbmUgeDE9IjEwMCIgeTE9IjEwMCIgeDI9IjE3MSIgeTI9IjEyOSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utb3BhY2l0eT0iMC4zIiBzdHJva2Utd2lkdGg9IjAuNSIvPjxsaW5lIHgxPSIxMDAiIHkxPSIxMDAiIHgyPSIxNDEiIHkyPSIxNzEiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLW9wYWNpdHk9IjAuMyIgc3Ryb2tlLXdpZHRoPSIwLjUiLz48bGluZSB4MT0iMTAwIiB5MT0iMTAwIiB4Mj0iMTAwIiB5Mj0iMTk1IiBzdHJva2U9IiMwMDAiIHN0cm9rZS1vcGFjaXR5PSIwLjMiIHN0cm9rZS13aWR0aD0iMC41Ii8+PGxpbmUgeDE9IjEwMCIgeTE9IjEwMCIgeDI9IjU5IiB5Mj0iMTcxIiBzdHJva2U9IiMwMDAiIHN0cm9rZS1vcGFjaXR5PSIwLjMiIHN0cm9rZS13aWR0aD0iMC41Ii8+PGxpbmUgeDE9IjEwMCIgeTE9IjEwMCIgeDI9IjI5IiB5Mj0iMTI5IiBzdHJva2U9IiMwMDAiIHN0cm9rZS1vcGFjaXR5PSIwLjMiIHN0cm9rZS13aWR0aD0iMC41Ii8+PGxpbmUgeDE9IjEwMCIgeTE9IjEwMCIgeDI9IjI5IiB5Mj0iNzEiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLW9wYWNpdHk9IjAuMyIgc3Ryb2tlLXdpZHRoPSIwLjUiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjQiIGZpbGw9IiMwMDAiLz48L3N2Zz4=)
 *
 */
export function WebRadarIcon({ className }: IconProps) {
  return (
    <svg className={cn('h-full w-full', className)} viewBox="0 0 200 200">
      {/* Outermost thin circle - not connected by radial lines */}
      <circle
        cx="100"
        cy="100"
        r="98"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.5"
        opacity="0.15"
      />
      {/* Three main concentric circles */}
      <circle
        cx="100"
        cy="100"
        r="95"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.5"
        opacity="0.2"
      />
      <circle
        cx="100"
        cy="100"
        r="65"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.5"
        opacity="0.3"
      />
      <circle
        cx="100"
        cy="100"
        r="35"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.5"
        opacity="0.4"
      />
      {/* Eight radial lines from center to outer circle - lighter color */}
      {Array.from({ length: 8 }).map((_, i) => (
        <line
          key={`radial-${i}`}
          x1="100"
          y1="100"
          x2="100"
          y2="5"
          stroke="currentColor"
          strokeWidth="0.5"
          opacity="0.12"
          transform={`rotate(${i * 45} 100 100)`}
        />
      ))}
      {/* Center dot */}
      <circle cx="100" cy="100" r="4" fill="currentColor" />
    </svg>
  )
}

/**
 * Network Pattern Preview:
 *
 * ![NetworkPattern](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCAyMDAgMjAwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iOTUiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLW9wYWNpdHk9IjAuMTUiIHN0cm9rZS13aWR0aD0iMC41Ii8+PGxpbmUgeDE9IjEwMCIgeTE9IjU2IiB4Mj0iMTAwIiB5Mj0iMTAwIiBzdHJva2U9IiMwMDAiIHN0cm9rZS1vcGFjaXR5PSIwLjIiIHN0cm9rZS13aWR0aD0iMC41Ii8+PGxpbmUgeDE9IjEzOCIgeTE9Ijc4IiB4Mj0iMTAwIiB5Mj0iMTAwIiBzdHJva2U9IiMwMDAiIHN0cm9rZS1vcGFjaXR5PSIwLjIiIHN0cm9rZS13aWR0aD0iMC41Ii8+PGxpbmUgeDE9IjEzOCIgeTE9IjEyMiIgeDI9IjEwMCIgeTI9IjEwMCIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utb3BhY2l0eT0iMC4yIiBzdHJva2Utd2lkdGg9IjAuNSIvPjxsaW5lIHgxPSIxMDAiIHkxPSIxNDQiIHgyPSIxMDAiIHkyPSIxMDAiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLW9wYWNpdHk9IjAuMiIgc3Ryb2tlLXdpZHRoPSIwLjUiLz48bGluZSB4MT0iNjIiIHkxPSIxMjIiIHgyPSIxMDAiIHkyPSIxMDAiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLW9wYWNpdHk9IjAuMiIgc3Ryb2tlLXdpZHRoPSIwLjUiLz48bGluZSB4MT0iNjIiIHkxPSI3OCIgeDI9IjEwMCIgeTI9IjEwMCIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utb3BhY2l0eT0iMC4yIiBzdHJva2Utd2lkdGg9IjAuNSIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iMjIiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLW9wYWNpdHk9IjAuNCIgc3Ryb2tlLXdpZHRoPSIwLjUiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjIiIGZpbGw9IiMwMDAiIG9wYWNpdHk9IjAuNiIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjU2IiByPSIyMiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utb3BhY2l0eT0iMC40IiBzdHJva2Utd2lkdGg9IjAuNSIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjU2IiByPSIyIiBmaWxsPSIjMDAwIiBvcGFjaXR5PSIwLjYiLz48Y2lyY2xlIGN4PSIxMzgiIGN5PSI3OCIgcj0iMjIiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLW9wYWNpdHk9IjAuNCIgc3Ryb2tlLXdpZHRoPSIwLjUiLz48Y2lyY2xlIGN4PSIxMzgiIGN5PSI3OCIgcj0iMiIgZmlsbD0iIzAwMCIgb3BhY2l0eT0iMC42Ii8+PGNpcmNsZSBjeD0iMTM4IiBjeT0iMTIyIiByPSIyMiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utb3BhY2l0eT0iMC40IiBzdHJva2Utd2lkdGg9IjAuNSIvPjxjaXJjbGUgY3g9IjEzOCIgY3k9IjEyMiIgcj0iMiIgZmlsbD0iIzAwMCIgb3BhY2l0eT0iMC42Ii8+PGNpcmNsZSBjeD0iMTAwIiBjeT0iMTQ0IiByPSIyMiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utb3BhY2l0eT0iMC40IiBzdHJva2Utd2lkdGg9IjAuNSIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjE0NCIgcj0iMiIgZmlsbD0iIzAwMCIgb3BhY2l0eT0iMC42Ii8+PGNpcmNsZSBjeD0iNjIiIGN5PSIxMjIiIHI9IjIyIiBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAiIHN0cm9rZS1vcGFjaXR5PSIwLjQiIHN0cm9rZS13aWR0aD0iMC41Ii8+PGNpcmNsZSBjeD0iNjIiIGN5PSIxMjIiIHI9IjIiIGZpbGw9IiMwMDAiIG9wYWNpdHk9IjAuNiIvPjxjaXJjbGUgY3g9IjYyIiBjeT0iNzgiIHI9IjIyIiBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAiIHN0cm9rZS1vcGFjaXR5PSIwLjQiIHN0cm9rZS13aWR0aD0iMC41Ii8+PGNpcmNsZSBjeD0iNjIiIGN5PSI3OCIgcj0iMiIgZmlsbD0iIzAwMCIgb3BhY2l0eT0iMC42Ii8+PC9zdmc+)
 *
 */
export function NetworkPatternIcon({ className }: IconProps) {
  const centerX = 100
  const centerY = 100
  const circleRadius = 22
  const distanceFromCenter = 44

  const surroundingCircles = [
    { x: centerX, y: centerY - distanceFromCenter },
    { x: centerX + distanceFromCenter * 0.866, y: centerY - distanceFromCenter * 0.5 },
    { x: centerX + distanceFromCenter * 0.866, y: centerY + distanceFromCenter * 0.5 },
    { x: centerX, y: centerY + distanceFromCenter },
    { x: centerX - distanceFromCenter * 0.866, y: centerY + distanceFromCenter * 0.5 },
    { x: centerX - distanceFromCenter * 0.866, y: centerY - distanceFromCenter * 0.5 }
  ]

  return (
    <svg className={cn('h-full w-full', className)} viewBox="0 0 200 200">
      {/* Large outer circle with light stroke */}
      <circle
        cx="100"
        cy="100"
        r="95"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.5"
        opacity="0.15"
      />

      {/* Connection lines from surrounding circles to center */}
      {surroundingCircles.map((circle, i) => (
        <line
          key={`line-${i}`}
          x1={circle.x}
          y1={circle.y}
          x2={centerX}
          y2={centerY}
          stroke="currentColor"
          strokeWidth="0.5"
          opacity="0.2"
        />
      ))}

      {/* Center circle */}
      <circle
        cx={centerX}
        cy={centerY}
        r={circleRadius}
        fill="none"
        stroke="currentColor"
        strokeWidth="0.5"
        opacity="0.4"
      />
      <circle cx={centerX} cy={centerY} r="2" fill="currentColor" opacity="0.6" />

      {/* 6 surrounding circles */}
      {surroundingCircles.map((circle, i) => (
        <g key={`circle-${i}`}>
          <circle
            cx={circle.x}
            cy={circle.y}
            r={circleRadius}
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            opacity="0.4"
          />
          <circle cx={circle.x} cy={circle.y} r="2" fill="currentColor" opacity="0.6" />
        </g>
      ))}
    </svg>
  )
}
