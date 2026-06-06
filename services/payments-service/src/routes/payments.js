const express = require('express');
const { v4: uuidv4 } = require('uuid');
const paymentsStore = require('../data/paymentsStore');
const { generateClabe } = require('../utils/clabeGenerator');

const router = express.Router();

function validateRequestBody(req, res, next) {
  const { amount, currency, userId } = req.body;
  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ error: 'amount must be a positive number' });
  }
  if (!currency || typeof currency !== 'string') {
    return res.status(400).json({ error: 'currency is required' });
  }
  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'userId is required' });
  }
  next();
}

router.post('/spei', validateRequestBody, (req, res) => {
  const payment = {
    id: uuidv4(),
    type: 'SPEI',
    amount: req.body.amount,
    currency: req.body.currency,
    userId: req.body.userId,
    clabe: generateClabe(),
    status: 'pending',
    createdAt: new Date().toISOString(),
    metadata: req.body.metadata || {}
  };

  paymentsStore.createPayment(payment);
  res.status(201).json({ payment });
});

router.post('/oxxo', validateRequestBody, (req, res) => {
  const payment = {
    id: uuidv4(),
    type: 'OXXO',
    amount: req.body.amount,
    currency: req.body.currency,
    userId: req.body.userId,
    reference: `OXXO-${Math.floor(100000000 + Math.random() * 900000000)}`,
    status: 'pending',
    expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    metadata: req.body.metadata || {}
  };

  paymentsStore.createPayment(payment);
  res.status(201).json({ payment });
});

router.get('/:id', (req, res) => {
  const payment = paymentsStore.getPayment(req.params.id);
  if (!payment) {
    return res.status(404).json({ error: 'Payment not found' });
  }
  res.json({ payment });
});

router.post('/webhook', (req, res) => {
  const { paymentId, status, provider } = req.body;
  if (!paymentId || !status) {
    return res.status(400).json({ error: 'paymentId and status are required' });
  }

  const payment = paymentsStore.getPayment(paymentId);
  if (!payment) {
    return res.status(404).json({ error: 'Payment not found' });
  }

  paymentsStore.updatePaymentStatus(paymentId, status);
  res.json({ payment: paymentsStore.getPayment(paymentId), provider: provider || 'unknown' });
});

router.get('/clabe', (req, res) => {
  res.json({ clabe: generateClabe() });
});

module.exports = router;
