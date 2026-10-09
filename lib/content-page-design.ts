/** Pages using the shared editorial Figma navigation and footer styles. */
export function usesContentPageDesign(pathname: string): boolean {
  return (
    pathname === '/leaderboard' ||
    pathname === '/medskillaudit' ||
    /^\/leaderboard\/items\/[^/]+$/.test(pathname) ||
    /^\/guides\/[^/]+$/.test(pathname) ||
    /^\/agent-skills\/(?!list$)[^/]+$/.test(pathname)
  )
}
