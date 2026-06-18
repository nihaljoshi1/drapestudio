import { logger } from '../utils/logger.js'

export const notFound = (req, res, next) => {
  const error = new Error(`Route not found — ${req.originalUrl}`)
  error.statusCode = 404
  next(error)
}

export const globalErrorHandler = (err, req, res, next) => {
  logger.error(err.message)
  const statusCode = err.statusCode || 500
  return res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    data: null,
    error: process.env.NODE_ENV === 'development' ? err.stack : null,
  })
}