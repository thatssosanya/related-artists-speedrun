interface ApiError {
  message: string
}

export type CouldError<T> = T | ApiError
