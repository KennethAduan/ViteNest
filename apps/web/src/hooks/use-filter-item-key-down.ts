import * as React from "react"

const REMOVE_SHORTCUTS = ["backspace", "delete"]

export function useFilterItemKeyDown(
  filterId: string,
  showFieldSelector: boolean,
  showOperatorSelector: boolean,
  showValueSelector: boolean,
  onFilterRemove: (filterId: string) => void
) {
  return React.useCallback(
    // fallow-ignore-next-line complexity
    (event: React.KeyboardEvent<HTMLElement>) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return
      }

      if (showFieldSelector || showOperatorSelector || showValueSelector) {
        return
      }

      if (REMOVE_SHORTCUTS.includes(event.key.toLowerCase())) {
        event.preventDefault()
        onFilterRemove(filterId)
      }
    },
    [filterId, showFieldSelector, showOperatorSelector, showValueSelector, onFilterRemove]
  )
}
