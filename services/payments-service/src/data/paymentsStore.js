const payments = new Map();

function createPayment(payment) {
  payments.set(payment.id, payment);
  return payment;
}

function getPayment(paymentId) {
  return payments.get(paymentId) || null;
}

function updatePaymentStatus(paymentId, status) {
  const payment = payments.get(paymentId);
  if (!payment) {
    return null;
  }
  payment.status = status;
  payment.updatedAt = new Date().toISOString();
  payments.set(paymentId, payment);
  return payment;
}

function listPayments() {
  return Array.from(payments.values());
}

module.exports = {
  createPayment,
  getPayment,
  updatePaymentStatus,
  listPayments
};
