import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { ENV } from './config/env.js'
import { supabase } from './config/supabase.js'
import { notFound, globalErrorHandler } from './middleware/errorHandler.js'

// Route imports (empty files for now — we'll fill these next)
import authRoutes from './routes/auth.routes.js'
import productRoutes from './routes/product.routes.js'
import cartRoutes from './routes/cart.routes.js'
import orderRoutes from './routes/order.routes.js'
import paymentRoutes from './routes/payment.routes.js'
import wishlistRoutes from './routes/wishlist.routes.js'
import adminRoutes from './routes/admin.routes.js'
import reviewRoutes from './routes/review.routes.js'

const app = express()

// ─── Middleware ───────────────────────────────────────────
app.use(helmet())
app.use(cors({
  origin: ENV.FRONTEND_URL,
  credentials: true,
}))
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ─── Health Check ─────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Server is running', data: null, error: null })
})


// ─── API Routes ───────────────────────────────────────────
app.use('/api/v1/auth',     authRoutes)
app.use('/api/v1/products', productRoutes)
app.use('/api/v1/cart',     cartRoutes)
app.use('/api/v1/orders',   orderRoutes)
app.use('/api/v1/payments', paymentRoutes)
app.use('/api/v1/wishlist', wishlistRoutes)
app.use('/api/v1/admin',    adminRoutes)
app.use('/api/v1', reviewRoutes)

// ─── Error Handling ───────────────────────────────────────
app.use(notFound)
app.use(globalErrorHandler)

// ─── Start ────────────────────────────────────────────────
app.listen(ENV.PORT, () => {
  console.log(`🚀 Server running on http://localhost:${ENV.PORT}`)
})

export default app