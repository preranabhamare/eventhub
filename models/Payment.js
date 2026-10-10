const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  registration_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Registration',
    required: true,
  },
  stripe_payment_intent_id: {
    type: String,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    enum: ['INR', 'USD'],
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'succeeded', 'failed'],
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Payment', PaymentSchema);
