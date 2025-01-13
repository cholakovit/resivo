
export class ApiError extends Error implements IApiError {
  statusCode: number
  status: string
  errors?: any

  constructor(statusCode: number, message: string, status: string = 'error') {
    super(message)
    this.statusCode = statusCode
    this.status = status
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export default ApiError