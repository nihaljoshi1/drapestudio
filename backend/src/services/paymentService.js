import { v4 as uuidv4 } from 'uuid'

// Fake card details that will be accepted
const VALID_TEST_CARDS = [
  '4111111111111111',
  '4242424242424242',
]

export const createFakeOrder = (amount) => {
  return {
    id: `fake_order_${uuidv4().split('-')[0]}`,
    amount,
    currency: 'INR',
    status: 'created',
  }
}

export const verifyFakePayment = ({ card_number, expiry, cvv, name }) => {
  const cleaned = card_number?.replace(/\s/g, '')

  if (!VALID_TEST_CARDS.includes(cleaned)) {
    return { success: false, message: 'Invalid card number' }
  }

  if (!expiry || !cvv || !name) {
    return { success: false, message: 'Missing card details' }
  }

  // Simulate payment ID
  return {
    success: true,
    payment_id: `pay_fake_${uuidv4().split('-')[0]}`,
    message: 'Payment successful',
  }
}