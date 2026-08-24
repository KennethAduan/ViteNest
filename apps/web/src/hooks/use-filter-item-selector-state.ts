import * as React from "react"

export function useFilterItemSelectorState() {
  const [showFieldSelector, setShowFieldSelector] = React.useState(false)
  const [showOperatorSelector, setShowOperatorSelector] = React.useState(false)
  const [showValueSelector, setShowValueSelector] = React.useState(false)
  return {
    showFieldSelector, setShowFieldSelector,
    showOperatorSelector, setShowOperatorSelector,
    showValueSelector, setShowValueSelector,
  }
}
