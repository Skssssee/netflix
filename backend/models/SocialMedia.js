const mongoose = require('mongoose');

const socialMediaSchema = new mongoose.Schema({
  platform: { type: String, required: true },
  url: { type: String, required: true },
  iconUrl: { type: String, required: true },
  isActive: { type: Boolean, default: true },
});

module.exports = mongoose.model('SocialMedia', socialMediaSchema);
