'use client'

const ANALYTICS_COOKIE_NAMES = ['_ga', '_gid', '_gat', '_gcl_au', '_clck', '_clsk']
const ANALYTICS_COOKIE_PREFIXES = ['_ga_']

const cookieDomains = () => {
  const host = window.location.hostname.toLowerCase()
  const domains = ['']
  const isIpAddress = /^\d+\.\d+\.\d+\.\d+$/.test(host)

  if (host && host !== 'localhost' && !isIpAddress) {
    domains.push(host)
    domains.push(`.${host}`)

    const parts = host.split('.')
    if (parts.length > 2) {
      // Try common cookie domain scopes; the browser ignores attempts that target a public suffix.
      domains.push(`.${parts.slice(-2).join('.')}`)
    }
  }

  return Array.from(new Set(domains))
}

const deleteCookie = (name: string, domain: string) => {
  const domainPart = domain ? `; domain=${domain}` : ''
  // After consent is withdrawn, expire analytics cookies visible on the current domain through document.cookie.
  // biome-ignore lint/suspicious/noDocumentCookie: Required to expire current-domain analytics cookies after consent is withdrawn.
  document.cookie = `${encodeURIComponent(name)}=; Max-Age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domainPart}`
}

export const clearCurrentDomainAnalyticsCookies = () => {
  if (typeof document === 'undefined') return

  // Clear only known analytics cookies readable by this page; third-party domain cookies remain governed by browser and provider policies.
  const cookieNames = document.cookie
    .split(';')
    .map((cookie) => cookie.trim().split('=')[0])
    .filter(Boolean)

  cookieNames.forEach((name) => {
    const isAnalyticsCookie =
      ANALYTICS_COOKIE_NAMES.includes(name) ||
      ANALYTICS_COOKIE_PREFIXES.some((prefix) => name.startsWith(prefix))

    if (!isAnalyticsCookie) return

    cookieDomains().forEach((domain) => {
      deleteCookie(name, domain)
    })
  })
}
