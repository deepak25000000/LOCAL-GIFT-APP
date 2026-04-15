const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const users = [
    { id: 'user_seed_1', name: 'John Doe', email: 'john@localgift.app', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John' },
    { id: 'user_seed_2', name: 'Alice Smith', email: 'alice@localgift.app', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice' }
];

const items = [];
const conditions = ['New', 'Like New', 'Good', 'Fair', 'Poor'];
const categories = ['Bicycles', 'Furniture', 'Electronics', 'Clothing', 'Books'];

// Generate 50 items around Wagholi/Anand Nagar area: Lat: 18.57, Lng: 73.97 (roughly Wagholi)
for (let i = 1; i <= 50; i++) {
    const isBicycle = i <= 20;
    let category = isBicycle ? 'Bicycles' : categories[i % categories.length];

    let latOffset = (Math.random() - 0.5) * 0.1; // ~5km radius
    let lngOffset = (Math.random() - 0.5) * 0.1;

    items.push({
        title: isBicycle ? `Mountain Bike Model ${i}` : `Used ${category} item ${i}`,
        description: `Great condition ${category}. Only used for a few months. Moving out so giving it away.`,
        category: category,
        condition: conditions[i % conditions.length],
        owner_id: i % 2 === 0 ? 'user_seed_1' : 'user_seed_2',
        owner_name: i % 2 === 0 ? 'John Doe' : 'Alice Smith',
        owner_email: i % 2 === 0 ? 'john@localgift.app' : 'alice@localgift.app',
        latitude: 18.57 + latOffset,
        longitude: 73.97 + lngOffset,
        status: 'available',
        attributes: isBicycle ? { brand: 'Hero', frame_size: 'Medium', wheel_size: '26 inch' } : { brand: 'Generic' }
    });
}

async function seed() {
    console.log('Seeding users...');
    for (const u of users) {
        await supabase.from('users').upsert(u, { onConflict: 'id' });
    }

    console.log('Seeding 50 items...');
    for (const item of items) {
        await supabase.from('items').insert(item);
    }
    console.log('Done!');
}

seed().catch(console.error);
