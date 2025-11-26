export class AppError extends Error {
  public readonly statusCode: number

  constructor(message: string, statusCode = 400) {
    super(message)
    this.statusCode = statusCode
    this.name = 'AppError'

    // Mantém o stack trace limpo
    Error.captureStackTrace(this, this.constructor)
  }
}
