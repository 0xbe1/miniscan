import { useCallback, useEffect, useState } from 'react'

type UseLocalStorageResponse<T> = [
  item: T | null,
  setItem: (value: T) => void,
  remove: () => void
]

export const useLocalStorage = <T>(
  key: string,
  initialValue?: T
): UseLocalStorageResponse<T> => {
  const [state, setState] = useState<T | null>(null)

  const initialize = (key: string) => {
    try {
      const item = localStorage.getItem(key)
      if (item && item !== 'undefined') {
        return JSON.parse(item)
      }

      localStorage.setItem(key, JSON.stringify(initialValue))
      return initialValue
    } catch {
      return initialValue
    }
  }

  // Initialize state with local storage values on mount (CSR)
  useEffect(() => setState(initialize(key)), [])

  const setValue = useCallback(
    (value: T) => {
      try {
        setState(value)
        localStorage.setItem(key, JSON.stringify(value))
      } catch (error) {
        console.log(error)
      }
    },
    [key, setState]
  )

  const remove = useCallback(() => {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.log(error)
    }
  }, [key])

  return [state, setValue, remove]
}
