const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function seedImages() {
    const { data: items } = await supabase.from('items').select('id, category');
    const imageRows = [];

    for (const item of items) {
        let imageUrl = '';
        if (item.category === 'Bicycles') imageUrl = 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&q=80&w=800';
        else if (item.category === 'Furniture') imageUrl = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800';
        else if (item.category === 'Electronics') imageUrl = 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=800';
        else if (item.category === 'Clothing') imageUrl = 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&q=80&w=800';
        else imageUrl = 'https://images.unsplash.com/photo-1544644181-1484b3f8c8b4?auto=format&fit=crop&q=80&w=800';

        imageRows.push({ item_id: item.id, image_url: imageUrl });
    }

    console.log('Clearing old images...');
    await supabase.from('item_images').delete().neq('id', 0);
    console.log('Inserting', imageRows.length, 'images...');
    await supabase.from('item_images').insert(imageRows);
    console.log('Images seeded!');
}
seedImages().catch(console.error);
