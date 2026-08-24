import * as React from "react"

type MaybePromise<T> = T | Promise<T>

export function useDebouncedCallback<TArgs extends Array<unknown>, TResult>(
  callback: (...args: TArgs) => MaybePromise<TResult>,
  delay = 300
) {
  const callbackRef = React.useRef(callback)
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  React.useEffect(() => {
    return () => {
      const { current } = timeoutRef
      if (current) clearTimeout(current)
    }
  }, [timeoutRef])

  return React.useCallback(
    (...args: TArgs) =>
      new Promise<TResult>((resolve, reject) => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }

        timeoutRef.current = setTimeout(() => {
          Promise.resolve(callbackRef.current(...args)).then(resolve).catch(reject)
        }, delay)
      }),
    [delay]
  )
}
