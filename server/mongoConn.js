const { MongoClient } = require('mongodb');

require('dotenv').config();
const dbName = 'Blogify';

class MongoConnection {
  constructor() {
    this.client = new MongoClient(process.env.MONGODB_URL);
  }

  async connect() {
    try {
      await this.client.connect();
      console.log('Connected successfully to MongoDB server');
      this.db = this.client.db(dbName);
    } catch (error) {
      console.error('Error connecting to MongoDB:', error);
      throw error;
    }
  }

  async disconnect() {
    try {
      await this.client.close();
      console.log('Disconnected from MongoDB server');
    } catch (error) {
      console.error('Error disconnecting from MongoDB:', error);
      throw error;
    }
  }

  getCollection(collectionName) {
    return this.db.collection(collectionName);
  }
}

module.exports = new MongoConnection();
