const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const paymentsRouter = require('./routes/payments');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/payments', paymentsRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'payments-service' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

app.listen(port, () => {
  console.log(`Payments service running on http://localhost:${port}`);
});
