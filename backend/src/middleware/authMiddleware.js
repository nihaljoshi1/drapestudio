import { supabase } from '../config/supabase.js'
import { sendError } from '../utils/apiResponse.js'

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'No token provided', 401)
    }

    const token = authHeader.split(' ')[1]
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return sendError(res, 'Invalid or expired token', 401)
    }

    // Fetch profile to get role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return sendError(res, 'Profile not found', 401)
    }

    req.user = { ...user, ...profile }
    next()
  } catch (err) {
    return sendError(res, 'Authentication failed', 401)
  }
}