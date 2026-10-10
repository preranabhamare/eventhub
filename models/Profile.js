const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  full_name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
  },
  avatar_url: {
    type: String,
  },
  profile_photo: {
    type: String,
  },
  password_hash: {
    type: String,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Profile', ProfileSchema);
