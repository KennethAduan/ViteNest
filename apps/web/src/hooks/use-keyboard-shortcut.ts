import * as React from "react"

export function useKeyboardShortcut(key: string, onTrigger: () => void) {
  React.useEffect(() => {
    // fallow-ignore-next-line complexity
    function onKeyDown(event: KeyboardEvent) {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        (event.target instanceof HTMLElement &&
          event.target.contentEditable === "true")
      ) {
        return
      }

      if (
        event.key.toLowerCase() === key &&
        (event.ctrlKey || event.metaKey) &&
        event.shiftKey
      ) {
        event.preventDefault()
        onTrigger()
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [key, onTrigger])
}
