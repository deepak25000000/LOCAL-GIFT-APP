const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const puneAreas = [
    { name: "Shivajinagar", baseLat: 18.5204, baseLng: 73.8567 },
    { name: "Kothrud", baseLat: 18.5074, baseLng: 73.8077 },
    { name: "Deccan Gymkhana", baseLat: 18.5308, baseLng: 73.8475 },
    { name: "Hinjewadi", baseLat: 18.5800, baseLng: 73.7383 },
    { name: "Sinhagad Road", baseLat: 18.4879, baseLng: 73.8137 },
    { name: "Viman Nagar", baseLat: 18.5612, baseLng: 73.9170 },
    { name: "Koregaon Park", baseLat: 18.5362, baseLng: 73.8939 },
    { name: "Baner", baseLat: 18.5590, baseLng: 73.7868 },
    { name: "Kalyani Nagar", baseLat: 18.5482, baseLng: 73.9033 },
    { name: "Magarpatta", baseLat: 18.5157, baseLng: 73.9272 },
    { name: "Wakad", baseLat: 18.5987, baseLng: 73.7687 },
    { name: "Camp", baseLat: 18.5135, baseLng: 73.8790 }
];

async function updateLocations() {
    try {
        const res = await pool.query('SELECT id FROM items');
        const items = res.rows;

        console.log('🔗 Connecting to DB...');
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const area = puneAreas[i % puneAreas.length];
            // Adding a small random offset within the area (~1.5 km radius)
            const lat = area.baseLat + (Math.random() - 0.5) * 0.02;
            const lng = area.baseLng + (Math.random() - 0.5) * 0.02;

            await pool.query(
                `UPDATE items SET latitude = $1, longitude = $2, attributes = $3::jsonb WHERE id = $4`,
                [lat, lng, JSON.stringify({ city: "Pune", area: area.name }), item.id]
            );
        }
        console.log(`✅ Successfully updated ${items.length} items to be locally distributed across Pune!`);
    } catch (e) {
        console.error('❌ Error updating locations:', e);
    } finally {
        pool.end();
    }
}

updateLocations();
