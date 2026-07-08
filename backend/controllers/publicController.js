const Category = require('../models/Category');
const Movie = require('../models/Movie');
const Slider = require('../models/Slider');
const SocialMedia = require('../models/SocialMedia');

exports.getHomeData = async (req, res) => {
  try {
    const sliders = await Slider.find().populate('movieId').sort('order').limit(5);
    
    // Get categories with their movies populated
    const categories = await Category.aggregate([
      {
        $lookup: {
          from: 'movies',
          localField: '_id',
          foreignField: 'category',
          as: 'movies'
        }
      }
    ]);
    
    const socials = await SocialMedia.find({ isActive: true });
    
    res.json({ sliders, categories, socials });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id).populate('category');
    if (!movie) return res.status(404).json({ error: 'Movie not found' });
    
    // Increment views
    movie.views += 1;
    await movie.save();
    
    res.json(movie);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCategoryMovies = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const movies = await Movie.find({ category: categoryId })
      .skip(skip)
      .limit(limit);

    const total = await Movie.countDocuments({ category: categoryId });

    res.json({
      movies,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + movies.length < total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const ADULT_KEYWORDS = ['porn', 'sex', 'xxx', 'nsfw', 'erotica', 'milf', 'cougar', 'hentai', 'webcam', 'audio erotica', 'threesome', 'adult'];

exports.getMovies = async (req, res) => {
  try {
    const { categoryId, search } = req.query;
    const safeSearch = req.query.safeSearch === 'true'; // Set default or check parameter
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;

    // If SafeSearch is enabled and search query contains restricted keywords, block search
    if (safeSearch && search && search.trim() !== '') {
      const lowerSearch = search.toLowerCase();
      const hasBlockedKeyword = ADULT_KEYWORDS.some(kw => lowerSearch.includes(kw));
      if (hasBlockedKeyword) {
        return res.json({
          movies: [],
          page: 1,
          limit,
          total: 0,
          totalPages: 0,
          hasMore: false,
          blocked: true,
          message: 'This search query has been filtered by SafeSearch restrictions.'
        });
      }
    }

    const query = {};
    if (categoryId && categoryId !== 'all') {
      query.category = categoryId;
    }
    
    if (search && search.trim() !== '') {
      query.$or = [
        { title: new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
        { description: new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') }
      ];
    }

    // Exclude any mature content matching adult keywords if SafeSearch is active
    if (safeSearch) {
      const exclusionPattern = ADULT_KEYWORDS.join('|');
      const exclusionRegex = new RegExp(exclusionPattern, 'i');
      
      // Merge with search constraints or apply globally
      query.title = { ...query.title, $not: exclusionRegex };
      query.description = { ...query.description, $not: exclusionRegex };
    }

    const movies = await Movie.find(query)
      .populate('category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Movie.countDocuments(query);

    res.json({
      movies,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + movies.length < total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
