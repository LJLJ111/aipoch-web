/** Exact Figma exports retain their native SVG dimensions. */
export function DesignIcon({
  name,
  size = 20,
  className
}: {
  name: string
  size?: 10 | 12 | 14 | 16 | 20
  className?: string
}) {
  return (
    // biome-ignore lint/performance/noImgElement: These SVG exports must retain their original geometry.
    <img src={`/figma/audit/${name}.svg`} alt="" width={size} height={size} className={className} />
  )
}
