import { sendError } from '../utils/apiResponse.js'

export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return sendError(res, 'Admin access required', 403)
  }
  next()
}