import { supabase } from '../config/supabase.js'
import { sendSuccess, sendError } from '../utils/apiResponse.js'
import { randomInt } from 'crypto'
import { sendOtpEmail } from '../services/emailService.js'

const OTP_EXPIRY_MINUTES = 10
const MAX_ATTEMPTS = 5
const RESEND_COOLDOWN_SECONDS = 30

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

function generateCode() {
  return String(randomInt(0, 1000000)).padStart(6, '0')
}

async function createOtp(email, purpose, payload) {
  const { data: existing } = await supabase
    .from('otp_codes')
    .select('*')
    .eq('email', email)
    .eq('purpose', purpose)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (existing) {
    const secondsSince = (Date.now() - new Date(existing.created_at).getTime()) / 1000
    if (secondsSince < RESEND_COOLDOWN_SECONDS) {
      throw new Error(`Please wait ${Math.ceil(RESEND_COOLDOWN_SECONDS - secondsSince)}s before requesting another code`)
    }
    await supabase.from('otp_codes').delete().eq('id', existing.id)
  }

  const code = generateCode()
  const expires_at = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000).toISOString()

  const { error } = await supabase.from('otp_codes').insert({ email, code, purpose, payload, expires_at })
  if (error) throw new Error(error.message)

  await sendOtpEmail(email, code, purpose)
}

async function verifyOtpCode(email, purpose, code) {
  const { data: row, error } = await supabase
    .from('otp_codes')
    .select('*')
    .eq('email', email)
    .eq('purpose', purpose)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error || !row) return { valid: false, reason: 'No pending code found. Please request a new one.' }

  if (new Date(row.expires_at) < new Date()) {
    await supabase.from('otp_codes').delete().eq('id', row.id)
    return { valid: false, reason: 'Code expired. Please request a new one.' }
  }

  if (row.attempts >= MAX_ATTEMPTS) {
    await supabase.from('otp_codes').delete().eq('id', row.id)
    return { valid: false, reason: 'Too many incorrect attempts. Please request a new code.' }
  }

  if (row.code !== code) {
    await supabase.from('otp_codes').update({ attempts: row.attempts + 1 }).eq('id', row.id)
    return { valid: false, reason: `Incorrect code. ${MAX_ATTEMPTS - row.attempts - 1} attempts remaining.` }
  }

  return { valid: true, row }
}

// ─── Register: request OTP ────────────────────────────────
export const requestRegisterOtp = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body

    if (!name || !email || !password) return sendError(res, 'Name, email and password are required', 400)
    if (!address?.line1 || !address?.city || !address?.state || !address?.pincode) {
      return sendError(res, 'Complete address is required', 400)
    }

    await createOtp(email, 'register', { name, email, password, phone, address })

    return sendSuccess(res, 'OTP sent to your email')
  } catch (err) {
    return sendError(res, err.message || 'Failed to send OTP', 400)
  }
}

// ─── Register: verify OTP, actually create the account ────
export const verifyRegisterOtp = async (req, res) => {
  try {
    const { email, code } = req.body
    const result = await verifyOtpCode(email, 'register', code)
    if (!result.valid) return sendError(res, result.reason, 400)

    const { name, password, phone, address } = result.row.payload

    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { name, phone } },
    })

    if (error) {
      await supabase.from('otp_codes').delete().eq('id', result.row.id)
      return sendError(res, error.message, 400)
    }

    await supabase.from('addresses').insert({
      user_id: data.user.id,
      label: address.label || 'Home',
      line1: address.line1,
      line2: address.line2 || null,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      is_default: true,
    })

    await supabase.from('otp_codes').delete().eq('id', result.row.id)

    return sendSuccess(res, 'Registration successful', {
      user: { id: data.user.id, email: data.user.email, name },
    }, 201)
  } catch (err) {
    return sendError(res, 'Verification failed', 500)
  }
}

// ─── Login: request OTP (password checked here) ───────────
export const requestLoginOtp = async (req, res) => {
  try {
    const { email, password } = req.body

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return sendError(res, 'Invalid email or password', 401)

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()

    const sessionPayload = {
      token: data.session.access_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: profile?.name,
        phone: profile?.phone,
        role: profile?.role,
      },
    }

    await createOtp(email, 'login', sessionPayload)

    return sendSuccess(res, 'OTP sent to your email')
  } catch (err) {
    return sendError(res, err.message || 'Failed to send OTP', 400)
  }
}

// ─── Login: verify OTP, release the session ────────────────
export const verifyLoginOtp = async (req, res) => {
  try {
    const { email, code } = req.body
    const result = await verifyOtpCode(email, 'login', code)
    if (!result.valid) return sendError(res, result.reason, 400)

    await supabase.from('otp_codes').delete().eq('id', result.row.id)

    return sendSuccess(res, 'Login successful', result.row.payload)
  } catch (err) {
    return sendError(res, 'Verification failed', 500)
  }
}

// ─── Resend (either purpose) ────────────────────────────────
export const resendOtp = async (req, res) => {
  try {
    const { email, purpose } = req.body
    const { data: row } = await supabase
      .from('otp_codes')
      .select('*')
      .eq('email', email)
      .eq('purpose', purpose)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!row) return sendError(res, 'No pending request found. Please start again.', 400)

    await createOtp(email, purpose, row.payload)
    return sendSuccess(res, 'OTP resent')
  } catch (err) {
    return sendError(res, err.message || 'Failed to resend OTP', 400)
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