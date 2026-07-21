import { supabase } from '../config/supabase.js'

export const optionalAuth = async (req, res, next) => {
  req.user = null
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) return next()

    const token = authHeader.split(' ')[1]
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) return next()

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profile) req.user = { ...user, ...profile }
  } catch (err) {
    // swallow — must never block the request
  }
  next()
}