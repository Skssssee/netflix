const Category = require('../models/Category');
const Movie = require('../models/Movie');
const Slider = require('../models/Slider');
const SocialMedia = require('../models/SocialMedia');

function cleanTitleForSEO(title, categoryName) {
  if (!title) return 'Untitled Video';
  let clean = title.replace(/\.(mp4|mkv|avi|mov|wmv|flv|webm|3gp)$/i, '');
  clean = clean.replace(/[\._\-]/g, ' ');
  const ripTags = [
    /\b\d{3,4}p\b/gi,
    /\bx26[45]\b/gi,
    /\bh26[45]\b/gi,
    /\bhevc\b/gi,
    /\bweb[- ]?dl\b/gi,
    /\bweb[- ]?rip\b/gi,
    /\bhd[- ]?rip\b/gi,
    /\bvd[- ]?rip\b/gi,
    /\bbluray\b/gi,
    /\bbrrip\b/gi,
    /\bdvd\b/gi,
    /\bdvdrip\b/gi,
    /\b[12]\d{3}\b/gi
  ];
  ripTags.forEach(regex => {
    clean = clean.replace(regex, '');
  });
  clean = clean.replace(/\s+/g, ' ').trim();
  clean = clean.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
  if (categoryName && categoryName !== 'Uncategorized') {
    const cleanCat = categoryName.replace(/Videos|Clips|Stories|Highlights/gi, '').trim();
    if (clean && !clean.toLowerCase().includes(cleanCat.toLowerCase())) {
      clean = `${clean} - ${categoryName}`;
    }
  }
  return clean;
}

// Categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const category = new Category(req.body);
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Movies
exports.getMovies = async (req, res) => {
  try {
    const movies = await Movie.find().populate('category');
    res.json(movies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createMovie = async (req, res) => {
  try {
    const payload = { ...req.body };
    if (payload.title) {
      const category = await Category.findById(payload.category);
      payload.title = cleanTitleForSEO(payload.title, category?.name);
    }
    const movie = new Movie(payload);
    await movie.save();
    res.status(201).json(movie);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateMovie = async (req, res) => {
  try {
    const payload = { ...req.body };
    if (payload.title) {
      const category = await Category.findById(payload.category);
      payload.title = cleanTitleForSEO(payload.title, category?.name);
    }
    const movie = await Movie.findByIdAndUpdate(req.params.id, payload, { new: true });
    res.json(movie);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteMovie = async (req, res) => {
  try {
    await Movie.findByIdAndDelete(req.params.id);
    res.json({ message: 'Movie deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Sliders
exports.getSliders = async (req, res) => {
  try {
    const sliders = await Slider.find().populate('movieId').sort('order');
    res.json(sliders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createSlider = async (req, res) => {
  try {
    const count = await Slider.countDocuments();
    if (count >= 5) {
      return res.status(400).json({ error: 'Maximum 5 sliders allowed' });
    }
    const slider = new Slider(req.body);
    await slider.save();
    res.status(201).json(slider);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateSlider = async (req, res) => {
  try {
    const slider = await Slider.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(slider);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteSlider = async (req, res) => {
  try {
    await Slider.findByIdAndDelete(req.params.id);
    res.json({ message: 'Slider deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Social Media
exports.getSocialMedia = async (req, res) => {
  try {
    const socials = await SocialMedia.find();
    res.json(socials);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createSocialMedia = async (req, res) => {
  try {
    const social = new SocialMedia(req.body);
    await social.save();
    res.status(201).json(social);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateSocialMedia = async (req, res) => {
  try {
    const social = await SocialMedia.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(social);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteSocialMedia = async (req, res) => {
  try {
    await SocialMedia.findByIdAndDelete(req.params.id);
    res.json({ message: 'Social Media link deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── Channels ──────────────────────────────────────────────────────────────────
const Channel = require('../models/Channel');

exports.getChannels = async (req, res) => {
  try {
    const channels = await Channel.find().sort({ createdAt: -1 });
    res.json(channels);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createChannel = async (req, res) => {
  try {
    const { channelId, name } = req.body;
    if (!channelId || !name) return res.status(400).json({ error: 'channelId and name are required' });
    const channel = new Channel({ channelId: channelId.toString().trim(), name: name.trim() });
    await channel.save();
    res.status(201).json(channel);
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ error: 'Channel ID already exists' });
    res.status(500).json({ error: error.message });
  }
};

exports.updateChannel = async (req, res) => {
  try {
    const channel = await Channel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(channel);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteChannel = async (req, res) => {
  try {
    await Channel.findByIdAndDelete(req.params.id);
    res.json({ message: 'Channel removed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.recategorizeMovies = async (req, res) => {
  try {
    const channels = await Channel.find({ active: true });
    if (!channels.length) return res.json({ updated: 0, message: 'No registered channels found' });

    let updated = 0;
    for (const ch of channels) {
      let category = await Category.findOne({
        name: new RegExp('^' + ch.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i')
      });
      if (!category) {
        category = new Category({ name: ch.name, slug: ch.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') });
        await category.save();
      }
      const result = await Movie.updateMany(
        { sourceChannelId: ch.channelId },
        { $set: { category: category._id } }
      );
      updated += result.modifiedCount || 0;
      console.log(`[Recategorize] Channel ${ch.channelId} → "${ch.name}": ${result.modifiedCount} updated`);
    }
    res.json({ updated, message: `Re-categorized ${updated} movie(s) across ${channels.length} channel(s)` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const [categoriesCount, moviesCount, slidersCount, socialsCount] = await Promise.all([
      Category.countDocuments(),
      Movie.countDocuments(),
      Slider.countDocuments(),
      SocialMedia.countDocuments(),
    ]);

    // Sum up the movie views to represent users/visitors
    const viewsAggregate = await Movie.aggregate([
      { $group: { _id: null, totalViews: { $sum: '$views' } } }
    ]);
    const totalViews = viewsAggregate[0]?.totalViews || 0;
    
    // We can simulate users based on views or return a static + views based logic
    const totalUsers = Math.max(12, Math.round(totalViews * 0.6) + 4);

    res.json({
      categories: categoriesCount,
      movies: moviesCount,
      sliders: slidersCount,
      socials: socialsCount,
      users: totalUsers
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
