require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const { WebSocketServer } = require('ws');
const http = require('http');
const nodemailer = require('nodemailer');
const { pool } = require('./database');
const admin = require('firebase-admin');

if (process.env.FIREBASE_PROJECT_ID) {
    admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID,
    });
}

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'public/uploads/'),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});
const upload = multer({ storage });

const emailTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: process.env.SMTP_USER && process.env.SMTP_PASS ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    } : undefined
});

async function verifyFirebaseToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'No auth token provided' });
    try {
        const decoded = await admin.auth().verifyIdToken(authHeader.split('Bearer ')[1]);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid auth token' });
    }
}

async function requireAdmin(req, res, next) {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    try {
        const { rows } = await pool.query('SELECT role FROM users WHERE id = $1', [req.user.uid]);
        if (!rows.length || rows[0].role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
        next();
    } catch {
        return res.status(403).json({ error: 'Admin check failed' });
    }
}

app.post('/api/auth/sync', verifyFirebaseToken, async (req, res) => {
    try {
        const { uid, name, email, picture } = req.user;
        const displayName = name || email?.split('@')[0] || 'User';
        const avatar = picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email || uid)}`;
        const { rows } = await pool.query(`
            INSERT INTO users (id, name, email, avatar) VALUES ($1, $2, $3, $4)
            ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email, avatar = EXCLUDED.avatar RETURNING *
        `, [uid, displayName, email || '', avatar]);
        res.json(rows[0]);
    } catch {
        res.status(500).json({ error: 'Failed to sync user' });
    }
});

app.get('/api/items', async (req, res) => {
    try {
        const { minLat, maxLat, minLng, maxLng, category, search, limit = 50, offset = 0 } = req.query;
        let query = 'SELECT * FROM items WHERE status = $1';
        let params = ['available'];
        let paramIndex = 2;

        if (minLat && maxLat) { query += ` AND latitude >= $${paramIndex++} AND latitude <= $${paramIndex++}`; params.push(minLat, maxLat); }
        if (minLng && maxLng) { query += ` AND longitude >= $${paramIndex++} AND longitude <= $${paramIndex++}`; params.push(minLng, maxLng); }
        if (category && category !== 'All') { query += ` AND category = $${paramIndex++}`; params.push(category); }
        if (search) { query += ` AND title ILIKE $${paramIndex++}`; params.push(`%${search}%`); }

        query += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
        params.push(limit, offset);

        const { rows: items } = await pool.query(query, params);
        if (items.length === 0) return res.json([]);

        const itemIds = items.map(i => i.id);
        const { rows: images } = await pool.query('SELECT * FROM item_images WHERE item_id = ANY($1)', [itemIds]);

        const imageMap = images.reduce((acc, img) => {
            if (!acc[img.item_id]) acc[img.item_id] = [];
            acc[img.item_id].push(img.image_url); return acc;
        }, {});

        res.json(items.map(item => ({ ...item, images: imageMap[item.id] || [] })));
    } catch {
        res.status(500).json({ error: 'Failed to fetch items' });
    }
});

app.get('/api/items/:id', async (req, res) => {
    try {
        const { rows: itemRows } = await pool.query('SELECT * FROM items WHERE id = $1', [req.params.id]);
        if (!itemRows.length) return res.status(404).json({ error: 'Item not found' });
        const item = itemRows[0];
        const { rows: images } = await pool.query('SELECT image_url FROM item_images WHERE item_id = $1', [item.id]);
        item.images = images.map(img => img.image_url);
        const { rows: counts } = await pool.query('SELECT COUNT(*) FROM requests WHERE item_id = $1', [item.id]);
        item.requestCount = parseInt(counts[0].count) || 0;
        res.json(item);
    } catch {
        res.status(500).json({ error: 'Failed to fetch item' });
    }
});

app.post('/api/items', verifyFirebaseToken, upload.array('images', 5), async (req, res) => {
    try {
        const { title, description, category, condition, latitude, longitude, attributes } = req.body;
        const uid = req.user.uid;
        let parsedAttrs = {};
        if (attributes) { try { parsedAttrs = typeof attributes === 'string' ? JSON.parse(attributes) : attributes; } catch (e) { } }

        const { rows: users } = await pool.query('SELECT name, avatar, email FROM users WHERE id = $1', [uid]);
        const userData = users[0] || {};
        const { rows: inserted } = await pool.query(`
            INSERT INTO items (title, description, category, condition, owner_id, owner_name, owner_avatar, owner_email, latitude, longitude, attributes, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb, 'available') RETURNING id
        `, [
            title, description || '', category || 'Other', condition || 'Good', uid,
            userData.name || req.user.name || 'Anonymous', userData.avatar || '',
            userData.email || req.user.email || '', Number(latitude) || 0, Number(longitude) || 0,
            parsedAttrs
        ]);
        const newId = inserted[0].id;
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                await pool.query('INSERT INTO item_images (item_id, image_url) VALUES ($1, $2)', [newId, `/uploads/${file.filename}`]);
            }
        }
        res.status(201).json({ id: newId, message: 'Item created successfully' });
    } catch {
        res.status(500).json({ error: 'Failed to create item' });
    }
});

app.delete('/api/items/:id', verifyFirebaseToken, async (req, res) => {
    try {
        const { rows: items } = await pool.query('SELECT owner_id FROM items WHERE id = $1', [req.params.id]);
        if (!items.length) return res.status(404).json({ error: 'Item not found' });
        const { rows: users } = await pool.query('SELECT role FROM users WHERE id = $1', [req.user.uid]);
        if (items[0].owner_id !== req.user.uid && (users.length && users[0].role !== 'admin')) return res.status(403).json({ error: 'Not authorized' });
        await pool.query('DELETE FROM items WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch {
        res.status(500).json({ error: 'Failed' });
    }
});

app.get('/api/users/:userId/items', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM items WHERE owner_id = $1 ORDER BY created_at DESC', [req.params.userId]);
        res.json(rows);
    } catch { res.status(500).json({}); }
});

app.get('/api/users/:userId/saved', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT i.* FROM items i INNER JOIN saved_items s ON i.id = s.item_id WHERE s.user_id = $1 ORDER BY s.timestamp DESC', [req.params.userId]);
        res.json(rows);
    } catch { res.status(500).json({}); }
});

app.post('/api/users/:userId/saved/:itemId', verifyFirebaseToken, async (req, res) => {
    try {
        await pool.query('INSERT INTO saved_items (user_id, item_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [req.params.userId, req.params.itemId]);
        res.json({ success: true });
    } catch { res.status(500).json({}); }
});

app.delete('/api/users/:userId/saved/:itemId', verifyFirebaseToken, async (req, res) => {
    try {
        await pool.query('DELETE FROM saved_items WHERE user_id = $1 AND item_id = $2', [req.params.userId, req.params.itemId]);
        res.json({ success: true });
    } catch { res.status(500).json({}); }
});

app.get('/api/users/:userId/profile', async (req, res) => {
    try {
        const { rows: users } = await pool.query('SELECT * FROM users WHERE id = $1', [req.params.userId]);
        if (!users.length) return res.status(404).json({ error: 'Not found' });
        const { rows: given } = await pool.query("SELECT COUNT(*) FROM items WHERE owner_id = $1 AND status = 'claimed'", [req.params.userId]);
        const { rows: active } = await pool.query("SELECT COUNT(*) FROM items WHERE owner_id = $1 AND status = 'available'", [req.params.userId]);
        res.json({ ...users[0], itemsGiven: parseInt(given[0].count), activeListings: parseInt(active[0].count) });
    } catch { res.status(500).json({}); }
});

app.put('/api/users/:userId/profile', verifyFirebaseToken, async (req, res) => {
    try {
        if (req.user.uid !== req.params.userId) return res.status(403).json({});
        const { name, avatar, location_lat, location_lng } = req.body;
        const updates = []; const params = []; let i = 1;
        if (name !== undefined) { updates.push(`name = $${i++}`); params.push(name); }
        if (avatar !== undefined) { updates.push(`avatar = $${i++}`); params.push(avatar); }
        if (location_lat !== undefined) { updates.push(`location_lat = $${i++}`); params.push(location_lat); }
        if (location_lng !== undefined) { updates.push(`location_lng = $${i++}`); params.push(location_lng); }
        updates.push(`updated_at = CURRENT_TIMESTAMP`);
        params.push(req.params.userId);
        const { rows } = await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = $${i} RETURNING *`, params);
        res.json(rows[0]);
    } catch { res.status(500).json({}); }
});

module.exports = app;
