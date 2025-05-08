const { migrate } = require('drizzle-orm/postgres-js/migrator');
const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const path = require('path');
const { schema } = require('./shared/schema');

async function main() {
  console.log('Starting database migration...');
  
  // Get database URL from environment
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    console.error('DATABASE_URL environment variable is not set');
    process.exit(1);
  }
  
  const client = postgres(DATABASE_URL);
  const db = drizzle(client, { schema });
  
  try {
    console.log('Running SQL queries to ensure tables exist...');
    
    // Create emotion_reference_images table if it doesn't exist
    await client.unsafe(`
      CREATE TABLE IF NOT EXISTS emotion_reference_images (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        emotion TEXT NOT NULL,
        image_data TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      );
    `);
    
    console.log('Database migration completed successfully');
  } catch (error) {
    console.error('Database migration failed:', error);
  } finally {
    await client.end();
  }
}

main();