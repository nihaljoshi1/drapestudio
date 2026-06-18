import { createFakeOrder, verifyFakePayment } from '../services/paymentService.js'
import { sendSuccess, sendError } from '../utils/apiResponse.js'

// ─── Create Payment Order ─────────────────────────────────
export const createOrder = async (req, res) => {
  try {
    const { amount } = req.body

    if (!amount || amount <= 0) {
      return sendError(res, 'Invalid amount', 400)
    }

    const order = createFakeOrder(amount)

    return sendSuccess(res, 'Payment order created', { order })
  } catch (err) {
    return sendError(res, 'Failed to create payment order', 500)
  }
}

// ─── Verify Payment ───────────────────────────────────────
export const verifyPayment = async (req, res) => {
  try {
    const { card_number, expiry, cvv, name } = req.body

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const result = verifyFakePayment({ card_number, expiry, cvv, name })

    if (!result.success) {
      return sendError(res, result.message, 400)
    }

    return sendSuccess(res, result.message, {
      payment_id: result.payment_id,
      status: 'paid',
    })
  } catch (err) {
    return sendError(res, 'Payment verification failed', 500)
  }
}