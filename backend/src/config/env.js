import dotenv from 'dotenv'
dotenv.config()

export const ENV = {
  PORT: process.env.PORT || 5000,
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  NODE_ENV: process.env.NODE_ENV || 'development',
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
}

// Fail fast — if critical env vars are missing, crash immediately
const required = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY']
required.forEach((key) => {
  if (!process.env[key]) {
    console.error(`❌ Missing required env var: ${key}`)
    process.exit(1)
  }
})