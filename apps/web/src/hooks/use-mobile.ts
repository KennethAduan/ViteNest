import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const isMobile = React.useSyncExternalStore(
    (callback) => {
      const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
      mql.addEventListener("change", callback)
      return () => mql.removeEventListener("change", callback)
    },
    () => window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`).matches,
    () => false // Server snapshot
  )

  return !!isMobile
}
