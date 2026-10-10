const mongoose = require('mongoose');

const RegistrationSchema = new mongoose.Schema({
  event_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
    required: true,
  },
  registration_type: {
    type: String,
    enum: ['individual', 'team'],
    required: true,
  },
  team_name: {
    type: String,
  },
  team_size: {
    type: Number,
  },
  payment_status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    required: true,
  },
  payment_amount: {
    type: Number,
  },

  checked_in: {
    type: Boolean,
    default: false,
  },
  checked_in_at: {
    type: Date,
  },
}, { timestamps: true });

module.exports = mongoose.model('Registration', RegistrationSchema);
