export class AppError extends Error {
  public readonly statusCode: number
  public readonly code: string
  public readonly details: object

  constructor(message: string, statusCode = 400, code = "GENERIC_ERROR", details= {}) {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.details = details
    this.name = 'AppError'

    Error.captureStackTrace(this, this.constructor)
  }
}
