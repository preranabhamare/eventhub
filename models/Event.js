const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  organizer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  banner_url: {
    type: String,
  },
  photo_urls: [{
    type: String,
  }],
  event_date: {
    type: Date,
    required: true,
  },
  event_time: {
    type: String,
  },
  duration: {
    type: String, // e.g., "2 hours", "3 days"
  },
  location_type: {
    type: String,
    enum: ['online', 'offline'],
    required: true,
  },
  location_address: {
    type: String,
  },
  online_link: {
    type: String,
  },
  organizer_name: {
    type: String,
  },
  organizer_email: {
    type: String,
  },
  organizer_phone: {
    type: String,
  },
  team_required: {
    type: Boolean,
  },
  min_team_size: {
    type: Number,
  },
  max_team_size: {
    type: Number,
  },
  is_paid: {
    type: Boolean,
  },
  ticket_price: {
    type: Number,
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'draft'],
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Event', EventSchema);
