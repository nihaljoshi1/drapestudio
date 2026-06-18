import { supabase } from '../config/supabase.js'
import { sendSuccess, sendError } from '../utils/apiResponse.js'

// ─── Register ─────────────────────────────────────────────
export const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, phone }
      }
    })

    if (error) return sendError(res, error.message, 400)

    return sendSuccess(res, 'Registration successful. Please verify your email.', {
      user: {
        id: data.user.id,
        email: data.user.email,
        name,
      }
    }, 201)
  } catch (err) {
    return sendError(res, 'Registration failed', 500)
  }
}

// ─── Login ────────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) return sendError(res, 'Invalid email or password', 401)

    // Fetch profile for role
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()

    return sendSuccess(res, 'Login successful', {
      token: data.session.access_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: profile?.name,
        phone: profile?.phone,
        role: profile?.role,
      }
    })
  } catch (err) {
    return sendError(res, 'Login failed', 500)
  }
}

// ─── Logout ───────────────────────────────────────────────
export const logout = async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (authHeader) {
      const token = authHeader.split(' ')[1]
      await supabase.auth.admin.signOut(token)
    }
    return sendSuccess(res, 'Logged out successfully')
  } catch (err) {
    return sendError(res, 'Logout failed', 500)
  }
}

// ─── Forgot Password ──────────────────────────────────────
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL}/reset-password`,
    })

    if (error) return sendError(res, error.message, 400)

    // Always return success — don't leak whether email exists
    return sendSuccess(res, 'If that email exists, a reset link has been sent.')
  } catch (err) {
    return sendError(res, 'Failed to send reset email', 500)
  }
}

// ─── Reset Password ───────────────────────────────────────
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body

    const { error } = await supabase.auth.updateUser({ password })

    if (error) return sendError(res, error.message, 400)

    return sendSuccess(res, 'Password reset successful')
  } catch (err) {
    return sendError(res, 'Password reset failed', 500)
  }
}

// ─── Get Current User ─────────────────────────────────────
export const getMe = async (req, res) => {
  try {
    return sendSuccess(res, 'User fetched', {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      phone: req.user.phone,
      role: req.user.role,
    })
  } catch (err) {
    return sendError(res, 'Failed to fetch user', 500)
  }
}