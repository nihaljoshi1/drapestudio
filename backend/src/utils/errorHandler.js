export const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`)

  const statusCode = err.statusCode || 500
  const message = err.message || 'Internal Server Error'

  return res.status(statusCode).json({
    success: false,
    message,
    data: null,
    error: process.env.NODE_ENV === 'development' ? err.stack : message,
  })
}