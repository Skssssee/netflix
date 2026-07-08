const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: 'No description provided.' },
  thumbnailUrl: { type: String, required: true },
  telegramFileId: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  duration: { type: String, default: '0m' },
  views: { type: Number, default: 0 },
  sourceChannelId: { type: String, default: '' }, // which channel this video came from
}, { timestamps: true });

module.exports = mongoose.model('Movie', movieSchema);
