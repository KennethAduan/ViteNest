import * as React from "react"

export function useDataTablePanel() {
  const id = React.useId()
  const labelId = React.useId()
  const descriptionId = React.useId()
  const [open, setOpen] = React.useState(false)
  const addButtonRef = React.useRef<HTMLButtonElement>(null)
  return { id, labelId, descriptionId, open, setOpen, addButtonRef }
}
