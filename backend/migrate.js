const fs = require('fs');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function runMigration() {
    try {
        console.log('Connecting to Neon...');
        // 1. Execute SQL Schema
        console.log('Running Schema Migration...');
        const schema = fs.readFileSync('supabase_schema.sql', 'utf8');
        await pool.query(schema);
        console.log('Schema successfully applied to Neon!');

        // 2. Generate Seed Users and Items
        console.log('Seeding Database with 50 Items...');

        // Insert users manually
        await pool.query(`INSERT INTO users (id, name, email, avatar) VALUES 
         ('user_seed_1', 'John Doe', 'john@localgift.app', 'https://api.dicebear.com/7.x/avataaars/svg?seed=John'),
         ('user_seed_2', 'Alice Smith', 'alice@localgift.app', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice')
         ON CONFLICT (id) DO NOTHING;`);

        const conditions = ['New', 'Like New', 'Good', 'Fair', 'Poor'];
        const categories = ['Bicycles', 'Furniture', 'Electronics', 'Clothing', 'Books'];

        for (let i = 1; i <= 50; i++) {
            const isBicycle = i <= 20;
            const category = isBicycle ? 'Bicycles' : categories[i % categories.length];
            const latOffset = (Math.random() - 0.5) * 0.1;
            const lngOffset = (Math.random() - 0.5) * 0.1;

            let imageUrl = '';
            if (category === 'Bicycles') imageUrl = 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&q=80&w=800';
            else if (category === 'Furniture') imageUrl = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800';
            else if (category === 'Electronics') imageUrl = 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=800';
            else if (category === 'Clothing') imageUrl = 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&q=80&w=800';
            else imageUrl = 'https://images.unsplash.com/photo-1544644181-1484b3f8c8b4?auto=format&fit=crop&q=80&w=800';

            const attributes = isBicycle ? JSON.stringify({ brand: 'Hero', frame_size: 'Medium', wheel_size: '26 inch' }) : JSON.stringify({ brand: 'Generic' });

            // Insert item and retrieve its BIGSERIAL ID
            const res = await pool.query(`
                INSERT INTO items (title, description, category, condition, owner_id, owner_name, owner_email, latitude, longitude, status, attributes)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'available', $10::jsonb)
                RETURNING id;
            `, [
                isBicycle ? `Mountain Bike Model ${i}` : `Used ${category} item ${i}`,
                `Great condition ${category}. Only used for a few months. Moving out so giving it away.`,
                category,
                conditions[i % conditions.length],
                i % 2 === 0 ? 'user_seed_1' : 'user_seed_2',
                i % 2 === 0 ? 'John Doe' : 'Alice Smith',
                i % 2 === 0 ? 'john@localgift.app' : 'alice@localgift.app',
                18.57 + latOffset,
                73.97 + lngOffset,
                attributes
            ]);

            const newId = res.rows[0].id;

            // Insert corresponding image
            await pool.query('INSERT INTO item_images (item_id, image_url) VALUES ($1, $2)', [newId, imageUrl]);
        }

        console.log('✅ Migration and Data Seeding complete!');
    } catch (e) {
        console.error('Migration failed:', e);
    } finally {
        await pool.end();
    }
}

runMigration();
