const mongoose = require('mongoose');

const TeamMemberSchema = new mongoose.Schema({
  registration_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Registration',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
  },
}, { timestamps: true });

module.exports = mongoose.model('TeamMember', TeamMemberSchema);
