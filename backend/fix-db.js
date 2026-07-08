const mongoose = require('mongoose');
require('dotenv').config();
const Movie = require('./models/Movie');

async function fixDb() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");
    
    const movies = await Movie.find({});
    let fixedCount = 0;
    
    for (const movie of movies) {
      if (movie.thumbnailUrl && movie.thumbnailUrl.length > 100000) {
        console.log(`Fixing movie ${movie.title} - thumbnail length: ${movie.thumbnailUrl.length}`);
        movie.thumbnailUrl = "https://images.unsplash.com/photo-1616530940355-351fabd9524b?q=80&w=1974&auto=format&fit=crop";
        await movie.save();
        fixedCount++;
      }
    }
    
    console.log(`Fixed ${fixedCount} movies.`);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

fixDb();
