const google = require('googlethis');
const { Pool } = require('pg');
const fs = require('fs');
const https = require('https');
const http = require('http');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function downloadImage(url, dest) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;
        client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
            if (res.statusCode === 200 || res.statusCode === 301 || res.statusCode === 302) {
                // handle redirects lazily by just failing and moving to next, but let's just accept 200
                if (res.statusCode !== 200) {
                    res.resume();
                    return resolve(false);
                }
                res.pipe(fs.createWriteStream(dest))
                    .on('error', reject)
                    .once('close', () => resolve(true));
            } else {
                res.resume();
                resolve(false);
            }
        }).on('error', reject).setTimeout(5000, () => reject(new Error('Timeout')));
    });
}

function refineQuery(title) {
    const l = title.toLowerCase();
    if (l.includes('playstation')) return 'PlayStation 5 console product photography high quality';
    if (l.includes('macbook')) return 'Apple MacBook Air M1 silver open laptop';
    if (l.includes('ios') || l.includes('iphone')) return 'iPhone product photography';
    if (l.includes('sofa') || l.includes('chesterfield')) return 'Vintage leather chesterfield sofa living room';
    if (l.includes('camera') || l.includes('sony a7iii')) return 'Sony A7III Mirrorless Camera Body front view';
    if (l.includes('speaker') || l.includes('bose soundlink')) return 'Bose SoundLink Revolve+ Speaker product image';
    if (l.includes('stroller')) return 'UPPAbaby Vista V2 Stroller standing';
    if (l.includes('yoga mat')) return 'Lululemon Reversible Yoga Mat rolled up';
    if (l.includes('tent')) return 'Coleman 4-Person Camping Tent pitched outside';
    if (l.includes('nintendo switch')) return 'Nintendo Switch Lite Turquoise console lying flat';
    if (l.includes('monstera')) return 'Monstera Deliciosa large potted indoor plant';

    return title + ' object photography white background';
}

async function main() {
    try {
        const res = await pool.query('SELECT id, title FROM items');
        const items = res.rows;

        if (!fs.existsSync('public/uploads')) {
            fs.mkdirSync('public/uploads', { recursive: true });
        }

        console.log(`Found ${items.length} items to process.`);

        for (const item of items) {
            const query = refineQuery(item.title);
            console.log(`Searching: ${query}`);

            try {
                const images = await google.image(query, { safe: true });
                if (images && images.length > 0) {
                    let saved = false;
                    for (let img of images) {
                        const url = img.url;
                        if (!url.endsWith('.jpg') && !url.endsWith('.png') && !url.endsWith('.jpeg')) continue;

                        const ext = url.match(/\.png$/i) ? '.png' : '.jpg';
                        const dest = `public/uploads/item_${item.id}${ext}`;

                        const success = await downloadImage(url, dest).catch(() => false);
                        if (success) {
                            await pool.query('DELETE FROM item_images WHERE item_id = $1', [item.id]);
                            await pool.query('INSERT INTO item_images (item_id, image_url) VALUES ($1, $2)', [item.id, `/uploads/item_${item.id}${ext}`]);
                            console.log(` -> Saved: ${url}`);
                            saved = true;
                            break;
                        }
                    }
                    if (!saved) console.log(' -> Failed to download any of the found images.');
                } else {
                    console.log(' -> No images found.');
                }
            } catch (e) {
                console.error(` -> API Error: ${e.message}`);
            }

            await new Promise(r => setTimeout(r, 1000));
        }
    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
        console.log("Done!");
    }
}

main();
