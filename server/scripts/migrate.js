const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Config = require('../models/Config');

// Data to migrate (your triggers)
const initialConfigData = [
  { key: 'GITHUB_TOKEN', value: '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' },
  { key: 'STATS_GITHUB_TOKEN', value: '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' },
  { key: 'PAGE_ACCESS_TOKEN', value: 'EAAJED0hZAl8MBO22WmxYDnGkT2zGAfQWGxW0ZAfz1dIKsahCJefZC0necWv64uN9RMhfjW5rlZBO2qLG1zipHsRez0ylGdRbu21PNjZCVV5aUSMGlcB6UIje4jZCWZBvOtQMNeLCxKFCqJWss7nih2Yk7KclrOSyKrVeeB6Edr1KRBwDD5AKFor3lVuzmHH7AVLQGiRCahI4dRH0vUZB0yx8QVIlE9o8OwZCxZCsbI92L7RN5lPtpRwpA4' },
  { key: 'VERIFY_TOKEN', value: 'my_verify_token' },
  { key: 'API_KEY', value: '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' },
  { key: 'LEMONFOX_API_KEY', value: 'uC5qDdJYS6kykj4ofPsu7Z2IMuH4IvTC' },
  { key: 'MONGO_URI', value: 'mongodb+srv://hsnshehata:WdwwFpt81BcqDqsk@cluster0.wj85owu.mongodb.net/ghazal_bot_db?retryWrites=true&w=majority&appName=Cluster0' },
  { key: 'JWT_SECRET', value: 'my_jwt_secret_123' }, // Added for JWT authentication
];

const migrateData = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Migrate each config item
    for (const config of initialConfigData) {
      const existingConfig = await Config.findOne({ key: config.key });
      if (!existingConfig) {
        // Insert only if it doesn't exist to avoid overwriting manual changes
        await Config.create(config);
        console.log(`✅ Migrated ${config.key}`);
      } else {
        console.log(`ℹ️ Skipped ${config.key} - already exists`);
      }
    }

    console.log('✅ Migration completed successfully');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
};

// Run the migration
migrateData();