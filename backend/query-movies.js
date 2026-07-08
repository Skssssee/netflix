const mongoose = require('mongoose');
require('dotenv').config();
const Movie = require('./models/Movie');

mongoose.connect(process.env.MONGO_URI, { family: 4 })
  .then(async () => {
    const movies = await Movie.find();
    console.log("All Movies in DB:", JSON.stringify(movies, null, 2));
    process.exit(0);
  })
  .catch(console.error);
