import { useCallback, useMemo, useRef, useState } from "react"

const useCallbackWithLoadingState = <Request extends Array<unknown>, Response>(
  callback: (...args: Request) => Promise<Response>,
) => {
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const isFirstFetch = useRef(true)

  const callbackWithLoading = useCallback(
    async (...args: Request) => {
      setIsFetching(true)

      if (isFirstFetch.current) {
        setIsLoading(true)
      }

      try {
        const result = await callback(...args)

        return result
      } finally {
        setIsFetching(false)
        if (isFirstFetch) {
          setIsLoading(false)
          isFirstFetch.current = false
        }
      }
    },
    [callback],
  )

  const result = useMemo(
    () => [callbackWithLoading, { isLoading, isFetching }] as const,
    [callbackWithLoading, isFetching, isLoading],
  )

  return result
}

export default useCallbackWithLoadingState
