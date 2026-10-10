const mongoose = require('mongoose');

async function dropUsernameIndex() {
  try {
    await mongoose.connect('mongodb://localhost:27017/EventHub');
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('profiles');

    // Drop the username_1 index
    await collection.dropIndex('username_1');
    console.log('Dropped username_1 index successfully');

    mongoose.connection.close();
  } catch (error) {
    console.error('Error dropping index:', error);
    mongoose.connection.close();
  }
}

dropUsernameIndex();
