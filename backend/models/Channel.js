const mongoose = require('mongoose');

const ChannelSchema = new mongoose.Schema({
  channelId: { type: String, required: true, unique: true }, // e.g. -1004368459674
  name: { type: String, required: true }, // Display name / category name
  active: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Channel', ChannelSchema);
