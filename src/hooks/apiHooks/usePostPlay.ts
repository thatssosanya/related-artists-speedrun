import axios, { AxiosError } from "axios"

import useCallbackWithLoadingState from "@/hooks/useCallbackWithLoadingState"
import { PlayRequest, PlayResponse } from "@/types/nextApi"
import { CouldError } from "@/types/util"
import { showErrorNotification } from "@/utils/notifications"

const genericErrorMessage = "An error occurred while connecting to the server"

const usePostPlay = () => {
  const postPlayCallback = async (data: PlayRequest) => {
    try {
      const response = await axios.post<CouldError<PlayResponse>>(`${process.env.NEXT_PUBLIC_API_URL}/play`, data)

      const result = response.data

      if ("message" in result) {
        throw new Error(result.message)
      }

      return result
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<CouldError<PlayResponse>>
        if (axiosError.response) {
          const result = axiosError.response.data
          showErrorNotification({ message: "message" in result ? result.message : genericErrorMessage })
        } else {
          showErrorNotification({ message: axiosError.message })
        }
      } else {
        showErrorNotification({ message: (error as Error).message || genericErrorMessage })
      }
      throw error
    }
  }

  const [postPlay, { isLoading, isFetching }] = useCallbackWithLoadingState<[PlayRequest], PlayResponse>(
    postPlayCallback,
  )

  return [postPlay, { isLoading, isFetching }] as const
}

export default usePostPlay
