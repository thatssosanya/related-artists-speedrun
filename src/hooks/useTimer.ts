import { useCallback, useEffect, useMemo, useRef, useState } from "react"

interface TimerEntry {
  timestamp: number
  status: "play" | "pause"
}

interface UseTimerOptions {
  pause?: boolean
}

interface UseTimerResult {
  time: number
  formattedTime: string
  reset: () => void
}

const useTimer = (options?: UseTimerOptions): UseTimerResult => {
  const { pause = false } = options || {}

  const [time, setTime] = useState(0)
  const timerStack = useRef<TimerEntry[]>([])

  useEffect(() => {
    if (!timerStack.current.length && pause) {
      return
    }
    timerStack.current.push({
      timestamp: Date.now(),
      status: pause ? "pause" : "play",
    })
  }, [pause])

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (!pause) {
      interval = setInterval(() => {
        const now = Date.now()
        let totalTime = 0
        let prevStatus: "play" | "pause" = "pause"
        let prevTimestamp = 0

        for (const entry of timerStack.current) {
          if (entry.status === "play" && prevStatus === "play") {
            continue
          } else if (entry.status === "pause") {
            totalTime += entry.timestamp - prevTimestamp
          }
          prevStatus = entry.status
          prevTimestamp = entry.timestamp
        }

        if (prevStatus === "play") {
          totalTime += now - prevTimestamp
        }

        setTime(totalTime / 1000)
      }, 10)
    }

    return () => {
      clearInterval(interval)
    }
  }, [pause])

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    const milliseconds = Math.floor((time % 1) * 100)

    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}.${milliseconds.toString().padStart(2, "0")}`
  }

  const reset = useCallback(() => {
    timerStack.current = []
    setTime(0)
  }, [])

  const result = useMemo(
    () => ({
      time,
      formattedTime: formatTime(time),
      reset,
    }),
    [reset, time],
  )

  return result
}

export default useTimer
