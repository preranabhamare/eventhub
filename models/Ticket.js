const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
  registration_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Registration',
    required: true,
  },
  ticket_number: {
    type: String,
    unique: true,
    required: true,
  },
  qr_code_data: {
    type: String,
    required: true,
  },
  qr_code_image: {
    type: String,
    required: true,
  },
  event_title: {
    type: String,
    required: true,
  },
  attendee_name: {
    type: String,
    required: true,
  },
  event_date: {
    type: Date,
    required: true,
  },
  event_time: {
    type: String,
  },
  location: {
    type: String,
  },
  ticket_type: {
    type: String,
    enum: ['individual', 'team'],
    required: true,
  },
  team_name: {
    type: String,
  },
  price: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['active', 'used', 'cancelled'],
    default: 'active',
  },
}, { timestamps: true });

module.exports = mongoose.model('Ticket', TicketSchema);
