
/**
 * The ApiError class extends the native Error class to provide a standardized structure
 * for API error handling. It includes:
 * - `statusCode`: The HTTP status code of the error.
 * - `status`: A string indicating the error type (default: "error").
 * - `errors`: Optional array of additional error details.
 * This class ensures consistent error responses and supports enhanced error metadata.
 */
 
export class ApiError extends Error implements IApiError {
  statusCode: number
  status: string
  errors?: ApiErrorDetail[]

  constructor(statusCode: number, message: string, status: string = 'error') {
    super(message)
    this.statusCode = statusCode
    this.status = status
    Object.setPrototypeOf(this, new.target.prototype)
  }
}
  
export default ApiError