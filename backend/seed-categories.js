const mongoose = require('mongoose');
require('dotenv').config();

const Category = require('./models/Category');

const targetCategories = [
  {
    name: "Desi Bhabhi Web Series",
    slug: "desi-bhabhi-web-series-clips"
  },
  {
    name: "Regional Aunty Videos",
    slug: "regional-aunty-video-dramas"
  },
  {
    name: "Village Romance Stories",
    slug: "desi-village-romance-stories"
  },
  {
    name: "Khilona Part 2 OTT Clips",
    slug: "khilona-part-2-ott-clips"
  },
  {
    name: "Raakh Series Highlights",
    slug: "raakh-series-highlights"
  },
  {
    name: "Hinglish Bold Romance",
    slug: "hinglish-bold-romance-clips"
  },
  {
    name: "Desi Couples POV",
    slug: "desi-couples-pov-videos"
  },
  {
    name: "Bhojpuri Bold Drama",
    slug: "bhojpuri-bold-drama-clips"
  },
  {
    name: "Bengali Short Films",
    slug: "bengali-romantic-short-films"
  },
  {
    name: "Tamil Bold Romance",
    slug: "tamil-bold-romance-films"
  },
  {
    name: "Telugu Web Series Clips",
    slug: "telugu-webseries-bold-clips"
  },
  {
    name: "Ullu Style OTT Drama",
    slug: "ullu-style-ott-dramas"
  },
  {
    name: "Mona Ki Kahaniyan Series",
    slug: "mona-ki-kahaniyan-episodes"
  },
  {
    name: "Super Subbu Educational Clips",
    slug: "super-subbu-educational-clips"
  },
  {
    name: "Urban Desi Nightlife",
    slug: "urban-desi-nightlife-series"
  }
];

async function seed() {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb+srv://usaomega1_db_user:Masdt2qYlJfXs20N@cluster0.zpedlcp.mongodb.net/netflix_db?retryWrites=true&w=majority&appName=Cluster0";
    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("Connected successfully.");

    let addedCount = 0;
    let updatedCount = 0;

    for (const cat of targetCategories) {
      const existing = await Category.findOne({ name: cat.name });
      if (existing) {
        existing.slug = cat.slug;
        await existing.save();
        updatedCount++;
      } else {
        const newCat = new Category({
          name: cat.name,
          slug: cat.slug
        });
        await newCat.save();
        addedCount++;
      }
    }

    console.log(`Seed completed: Added ${addedCount} and updated ${updatedCount} categories.`);
  } catch (error) {
    console.error("Seeding failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

seed();
