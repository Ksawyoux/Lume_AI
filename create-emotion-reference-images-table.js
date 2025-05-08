// Create emotion reference images table
import { pool } from './server/db.js';

async function createTable() {
  try {
    const client = await pool.connect();
    
    console.log('Creating emotion_reference_images table...');
    
    // Create the table
    await client.query(`
      CREATE TABLE IF NOT EXISTS emotion_reference_images (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        emotion TEXT NOT NULL,
        image_data TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    
    console.log('Table emotion_reference_images created successfully');
    client.release();
    process.exit(0);
  } catch (error) {
    console.error('Error creating table:', error);
    process.exit(1);
  }
}

createTable();