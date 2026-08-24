
import React, { useCallback, useRef, useState, type Ref } from "react"
import { Input } from "./ui/input"
import { cn } from "@/lib/utils"
import { useComposedRefs } from "@/lib/compose-refs"


export interface CustomInputNumberProps extends Omit<
  React.ComponentProps<"input">,
  "type" | "value" | "onChange"
> {
  value?: number | string
  onChange?: (value: number | undefined) => void
  min?: number
  max?: number
  step?: number
  allowDecimals?: boolean
  allowNegative?: boolean
}

const NAVIGATION_KEYS = new Set([
  "Backspace",
  "Delete",
  "Tab",
  "Escape",
  "Enter",
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "Home",
  "End",
])

function isIncompleteNumericInput(v: string) {
  return v === "-" || v === "." || v === "-."
}

// fallow-ignore-next-line complexity
function buildValidInputPattern(
  allowDecimals: boolean,
  allowNegative: boolean
) {
  if (allowDecimals && allowNegative) return /^-?\d*\.?\d*$/
  if (allowDecimals) return /^\d*\.?\d*$/
  if (allowNegative) return /^-?\d*$/
  return /^\d*$/
}

function isInvalidInput(
  next: string,
  allowDecimals: boolean,
  allowNegative: boolean
) {
  const pattern = buildValidInputPattern(allowDecimals, allowNegative)
  return !pattern.test(next) || (next.match(/\./g)?.length ?? 0) > 1
}

// fallow-ignore-next-line complexity
function applyNumericConstraints(
  value: number,
  min: number | undefined,
  max: number | undefined,
  step: number,
  allowDecimals: boolean
) {
  let v = value
  if (min !== undefined && v < min) v = min
  if (max !== undefined && v > max) v = max
  if (step < 1 && allowDecimals) {
    const decimals = step.toString().split(".")[1]?.length ?? 0
    v = Number(v.toFixed(decimals))
  }
  return v
}

function isNegativeKeyAllowed(
  e: React.KeyboardEvent<HTMLInputElement>,
  allowNegative: boolean
) {
  return (
    allowNegative &&
    e.currentTarget.selectionStart === 0 &&
    !e.currentTarget.value.includes("-")
  )
}

// fallow-ignore-next-line complexity
function isDecimalKeyAllowed(
  e: React.KeyboardEvent<HTMLInputElement>,
  allowDecimals: boolean
) {
  if (!allowDecimals) return false
  const { value, selectionStart, selectionEnd } = e.currentTarget
  const selected = value.substring(selectionStart ?? 0, selectionEnd ?? 0)
  return !value.includes(".") || selected.includes(".")
}

const CLIPBOARD_KEYS = ["a", "c", "v", "x"]

// fallow-ignore-next-line complexity
function shouldAllowKey(
  e: React.KeyboardEvent<HTMLInputElement>,
  allowDecimals: boolean,
  allowNegative: boolean
): boolean {
  if (NAVIGATION_KEYS.has(e.key)) return true
  if ((e.ctrlKey || e.metaKey) && CLIPBOARD_KEYS.includes(e.key.toLowerCase()))
    return true
  if (e.key === "-") return isNegativeKeyAllowed(e, allowNegative)
  if (e.key === ".") return isDecimalKeyAllowed(e, allowDecimals)
  return /^\d$/.test(e.key)
}

function CustomInputNumber({
  value,
  onChange,
  min,
  max,
  step = 1,
  allowDecimals = true,
  allowNegative = false,
  className,
  onFocus,
  onBlur,
  onKeyDown,
  ref,
  ...props
}: CustomInputNumberProps & { ref?: Ref<HTMLInputElement> }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const composedRef = useComposedRefs(ref, inputRef)
  const isFocusedRef = useRef(false)
  const [isFocused, setIsFocused] = useState(false)

  const formatValue = useCallback((rawValue: number | string | undefined) => {
    if (rawValue === undefined || rawValue === null || rawValue === "")
      return ""
    return String(rawValue)
  }, [])

  const [inputValue, setInputValue] = useState(() => formatValue(value))
  const displayValue = isFocused ? inputValue : formatValue(value)

  const updateNumericValue = useCallback(
    // fallow-ignore-next-line complexity
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const next = e.target.value
      if (next === "") {
        setInputValue("")
        onChange?.(undefined)
        return
      }
      if (isInvalidInput(next, allowDecimals, allowNegative)) return
      setInputValue(next)
      if (isIncompleteNumericInput(next)) {
        onChange?.(undefined)
        return
      }
      const num = parseFloat(next)
      if (!isNaN(num)) onChange?.(num)
    },
    [onChange, allowDecimals, allowNegative]
  )

  const commitNumericValue = useCallback(
    // fallow-ignore-next-line complexity
    (e: React.FocusEvent<HTMLInputElement>) => {
      isFocusedRef.current = false
      setIsFocused(false)
      const next = e.target.value.trim()
      if (!next || isIncompleteNumericInput(next)) {
        setInputValue("")
        onChange?.(undefined)
        onBlur?.(e)
        return
      }
      const num = parseFloat(next)
      if (isNaN(num)) {
        setInputValue("")
        onChange?.(undefined)
      } else {
        const final = applyNumericConstraints(
          num,
          min,
          max,
          step,
          allowDecimals
        )
        setInputValue(String(final))
        onChange?.(final)
      }
      onBlur?.(e)
    },
    [onChange, onBlur, min, max, step, allowDecimals]
  )

  const startEditingNumber = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      isFocusedRef.current = true
      setIsFocused(true)
      setInputValue(formatValue(value))
      onFocus?.(e)
    },
    [onFocus, formatValue, value]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      onKeyDown?.(e)
      if (e.defaultPrevented) return
      if (!shouldAllowKey(e, allowDecimals, allowNegative)) e.preventDefault()
    },
    [allowDecimals, allowNegative, onKeyDown]
  )

  return (
    <Input
      {...props}
      ref={composedRef}
      type="text"
      inputMode={allowDecimals ? "decimal" : "numeric"}
      value={displayValue}
      onChange={updateNumericValue}
      onFocus={startEditingNumber}
      onBlur={commitNumericValue}
      onKeyDown={handleKeyDown}
      className={cn(className)}
    />
  )
}

export default CustomInputNumber
