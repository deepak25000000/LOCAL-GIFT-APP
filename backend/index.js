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
const compression = require('compression');

if (process.env.FIREBASE_PROJECT_ID) {
    admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID,
    });
}

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const PORT = process.env.PORT || 3001;

// Performance: gzip compression for all responses
app.use(compression());

app.use(cors({
    origin: true,
    maxAge: 86400, // Cache CORS preflight for 24 hours
}));
app.use(express.json());
// Static files with long cache (images don't change)
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads'), {
    maxAge: '7d',
    immutable: true,
}));

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
        const reqRole = req.body.role === 'admin' ? 'admin' : null;

        let query = '';
        let params = [uid, displayName, email || '', avatar];
        if (reqRole) {
            query = `INSERT INTO users (id, name, email, avatar, role) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email, avatar = EXCLUDED.avatar, role = EXCLUDED.role RETURNING *`;
            params.push(reqRole);
        } else {
            query = `INSERT INTO users (id, name, email, avatar) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email, avatar = EXCLUDED.avatar RETURNING *`;
        }
        const { rows } = await pool.query(query, params);
        res.json(rows[0]);
    } catch {
        res.status(500).json({ error: 'Failed to sync user' });
    }
});

app.get('/api/items', async (req, res) => {
    try {
        const { minLat, maxLat, minLng, maxLng, category, search, limit = 100, offset = 0 } = req.query;
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

        res.json(items.map(item => ({
            ...item,
            ownerName: item.owner_name || 'Anonymous User',
            ownerAvatar: item.owner_avatar || '',
            requestCount: item.requestCount || 0,
            images: imageMap[item.id] || []
        })));
    } catch (e) {
        console.error('Fetch items error:', e);
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
app.post('/api/requests', verifyFirebaseToken, async (req, res) => {
    try {
        const { itemId, scheduledTime, message } = req.body;
        const uid = req.user.uid;
        const { rows: requesters } = await pool.query('SELECT name, email FROM users WHERE id = $1', [uid]);
        const requester = requesters[0];
        const { rows: items } = await pool.query('SELECT *, owner_id, owner_name, owner_email FROM items WHERE id = $1', [itemId]);
        const item = items[0];
        if (!item) return res.status(404).json({ error: 'Not found' });
        if (item.owner_id === uid) return res.status(400).json({ error: 'Cannot request' });

        const { rows: existing } = await pool.query('SELECT id FROM requests WHERE item_id = $1 AND requester_id = $2', [itemId, uid]);
        if (existing.length) return res.status(400).json({ error: 'Already requested' });

        const { rows: counts } = await pool.query('SELECT COUNT(*) FROM requests WHERE item_id = $1', [itemId]);
        const position = parseInt(counts[0].count) || 0;

        const { rows: newReqs } = await pool.query(`
            INSERT INTO requests (item_id, requester_id, requester_name, requester_email, owner_id, owner_email, scheduled_time, message, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending') RETURNING *
        `, [itemId, uid, requester?.name || 'User', requester?.email || '', item.owner_id, item.owner_email || '', scheduledTime || '', message || '']);
        const newReq = newReqs[0];

        try {
            if (requester?.email && process.env.SMTP_USER) {
                await emailTransporter.sendMail({
                    from: process.env.MAIL_FROM || '"LocalGift" <no-reply@localgift.app>',
                    to: requester.email,
                    subject: `✅ Request Submitted — "${item.title}"`,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
                                <h1 style="color: white; margin: 0; font-size: 24px;">🎁 LocalGift</h1>
                                <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0;">Your Request Has Been Submitted!</p>
                            </div>
                            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 15px;">
                                <h2 style="margin-top: 0; color: #333;">Request Details</h2>
                                <table style="width: 100%; border-collapse: collapse;">
                                    <tr><td style="padding: 8px 0; color: #666;">Request ID:</td><td style="padding: 8px 0; font-weight: bold;">#${newReq.id}</td></tr>
                                    <tr><td style="padding: 8px 0; color: #666;">Item:</td><td style="padding: 8px 0; font-weight: bold;">${item.title}</td></tr>
                                    <tr><td style="padding: 8px 0; color: #666;">Requester:</td><td style="padding: 8px 0; font-weight: bold;">${requester?.name}</td></tr>
                                    <tr><td style="padding: 8px 0; color: #666;">Queue Position:</td><td style="padding: 8px 0; font-weight: bold;">#${position + 1} (First Come First Serve)</td></tr>
                                    <tr><td style="padding: 8px 0; color: #666;">Scheduled Time:</td><td style="padding: 8px 0; font-weight: bold;">${scheduledTime || 'To be decided'}</td></tr>
                                </table>
                            </div>
                            <div style="text-align: center; margin-top: 15px; margin-bottom: 20px;">
                                <a href="http://localhost:3000/requests" style="background-color: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Track Your Request Status</a>
                            </div>
                            <p style="color: #666; font-size: 14px;">The owner <strong>${item.owner_name}</strong> has been notified. They will review your request and accept based on first-come-first-serve priority.</p>
                            <p style="color: #999; font-size: 12px; margin-top: 20px;">— LocalGift Team</p>
                        </div>
                    `
                });
            }
            if (item.owner_email && process.env.SMTP_USER) {
                await emailTransporter.sendMail({
                    from: process.env.MAIL_FROM || '"LocalGift" <no-reply@localgift.app>',
                    to: item.owner_email,
                    subject: `📬 New Request for "${item.title}"`,
                    html: `<p>Someone Wants Your Item!</p>`
                });
            }
        } catch (e) { console.error('Email error:', e); }

        broadcastToUser(item.owner_id, { type: 'new_request', payload: newReq });
        res.json({ success: true, request: newReq, position: position + 1 });
    } catch (e) { res.status(500).json({ error: 'Failed' }); }
});
app.get('/api/requests/incoming', verifyFirebaseToken, async (req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT r.*, i.title as item_title, i.category as item_category, i.condition as item_condition, i.status as item_status
            FROM requests r JOIN items i ON r.item_id = i.id WHERE r.owner_id = $1 ORDER BY r.created_at ASC
        `, [req.user.uid]);
        res.json(rows.map(row => {
            const { item_title, item_category, item_condition, item_status, ...rest } = row;
            return { ...rest, items: { title: item_title, category: item_category, condition: item_condition, status: item_status } };
        }));
    } catch { res.status(500).json({}); }
});

app.get('/api/requests/outgoing', verifyFirebaseToken, async (req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT r.*, i.title as item_title, i.category as item_category, i.condition as item_condition, i.status as item_status
            FROM requests r JOIN items i ON r.item_id = i.id WHERE r.requester_id = $1 ORDER BY r.created_at DESC
        `, [req.user.uid]);
        res.json(rows.map(row => {
            const { item_title, item_category, item_condition, item_status, ...rest } = row;
            return { ...rest, items: { title: item_title, category: item_category, condition: item_condition, status: item_status } };
        }));
    } catch { res.status(500).json({}); }
});

app.put('/api/requests/:id/accept', verifyFirebaseToken, async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { rows: reqs } = await client.query('SELECT * FROM requests WHERE id = $1', [req.params.id]);
        if (!reqs.length) return res.status(404).json({ error: 'Not found' });
        const request = reqs[0];
        if (request.owner_id !== req.user.uid) return res.status(403).json({ error: 'Not owner' });

        await client.query("UPDATE requests SET status = 'accepted', updated_at = CURRENT_TIMESTAMP WHERE id = $1", [req.params.id]);
        await client.query("UPDATE requests SET status = 'declined', updated_at = CURRENT_TIMESTAMP WHERE item_id = $1 AND id != $2 AND status = 'pending'", [request.item_id, req.params.id]);
        await client.query("UPDATE items SET status = 'claimed', updated_at = CURRENT_TIMESTAMP WHERE id = $1", [request.item_id]);

        await client.query('COMMIT');
        broadcastToUser(request.requester_id, { type: 'request_accepted', payload: { requestId: request.id } });
        res.json({ success: true });
    } catch (e) {
        await client.query('ROLLBACK');
        res.status(500).json({});
    } finally {
        client.release();
    }
});

app.put('/api/requests/:id/decline', verifyFirebaseToken, async (req, res) => {
    try {
        const { rows: reqs } = await pool.query('SELECT * FROM requests WHERE id = $1', [req.params.id]);
        if (!reqs.length || reqs[0].owner_id !== req.user.uid) return res.status(403).json({});
        await pool.query("UPDATE requests SET status = 'declined', updated_at = CURRENT_TIMESTAMP WHERE id = $1", [req.params.id]);
        broadcastToUser(reqs[0].requester_id, { type: 'request_declined', payload: { requestId: reqs[0].id } });
        res.json({ success: true });
    } catch { res.status(500).json({}); }
});

app.get('/api/conversations/:userId', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM conversations WHERE buyer_id = $1 OR seller_id = $1 ORDER BY updated_at DESC', [req.params.userId]);
        res.json(rows);
    } catch { res.status(500).json({}); }
});

app.get('/api/messages/:conversationId', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM messages WHERE conversation_id = $1 ORDER BY timestamp ASC', [req.params.conversationId]);
        res.json(rows);
    } catch { res.status(500).json({}); }
});

app.post('/api/conversations', verifyFirebaseToken, async (req, res) => {
    try {
        const { id, itemId, buyerId, buyerName, buyerAvatar, sellerId, sellerName, sellerAvatar, itemTitle } = req.body;
        await pool.query(`
            INSERT INTO conversations (id, item_id, buyer_id, buyer_name, buyer_avatar, seller_id, seller_name, seller_avatar, item_title)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            ON CONFLICT (id) DO NOTHING
        `, [id, itemId || '', buyerId, buyerName || '', buyerAvatar || '', sellerId, sellerName || '', sellerAvatar || '', itemTitle || '']);
        res.json({ success: true, conversationId: id });
    } catch { res.status(500).json({}); }
});

app.get('/api/admin/stats', verifyFirebaseToken, requireAdmin, async (req, res) => {
    try {
        const users = await pool.query('SELECT COUNT(*) FROM users');
        const items = await pool.query('SELECT COUNT(*) FROM items');
        const active = await pool.query("SELECT COUNT(*) FROM items WHERE status = 'available'");
        const requests = await pool.query('SELECT COUNT(*) FROM requests');
        const pending = await pool.query("SELECT COUNT(*) FROM requests WHERE status = 'pending'");
        const convos = await pool.query('SELECT COUNT(*) FROM conversations');
        res.json({
            totalUsers: parseInt(users.rows[0].count), totalItems: parseInt(items.rows[0].count),
            activeItems: parseInt(active.rows[0].count), totalRequests: parseInt(requests.rows[0].count),
            pendingRequests: parseInt(pending.rows[0].count), totalConversations: parseInt(convos.rows[0].count)
        });
    } catch { res.status(500).json({}); }
});

app.get('/api/admin/users', verifyFirebaseToken, requireAdmin, async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM users ORDER BY created_at DESC'); res.json(rows);
    } catch { res.status(500).json({}); }
});

app.get('/api/admin/items', verifyFirebaseToken, requireAdmin, async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM items ORDER BY created_at DESC'); res.json(rows);
    } catch { res.status(500).json({}); }
});

app.get('/api/admin/requests', verifyFirebaseToken, requireAdmin, async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT r.*, i.title as item_title FROM requests r JOIN items i ON r.item_id = i.id ORDER BY r.created_at DESC');
        res.json(rows.map(row => {
            const { item_title, ...rest } = row; return { ...rest, items: { title: item_title } };
        }));
    } catch { res.status(500).json({}); }
});

app.put('/api/admin/users/:userId/role', verifyFirebaseToken, requireAdmin, async (req, res) => {
    try {
        if (!['user', 'admin'].includes(req.body.role)) return res.status(400).json({});
        const { rows } = await pool.query('UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *', [req.body.role, req.params.userId]);
        res.json(rows[0]);
    } catch { res.status(500).json({}); }
});

app.delete('/api/admin/items/:id', verifyFirebaseToken, requireAdmin, async (req, res) => {
    try { await pool.query('DELETE FROM items WHERE id = $1', [req.params.id]); res.json({ success: true }); } catch { res.status(500).json({}); }
});

// ═══════════════════════════════════════════════════════════════
// GOOGLE MAPS SERVER-SIDE PROXY (all API key calls happen here)
// ═══════════════════════════════════════════════════════════════

app.get('/api/maps/reverse-geocode', async (req, res) => {
    try {
        const { lat, lng } = req.query;
        if (!lat || !lng) return res.status(400).json({ error: 'lat and lng required' });
        const apiKey = process.env.GOOGLE_MAPS_API_KEY;
        if (!apiKey) return res.status(500).json({ error: 'Maps API key not configured on server' });
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.status === 'OK' && data.results.length > 0) {
            res.json({ address: data.results[0].formatted_address, placeId: data.results[0].place_id, components: data.results[0].address_components });
        } else {
            res.json({ address: 'Address not found', placeId: null, components: [] });
        }
    } catch (e) { console.error('Geocode error:', e); res.status(500).json({ error: 'Geocoding failed' }); }
});

app.get('/api/maps/distance', async (req, res) => {
    try {
        const { originLat, originLng, destLat, destLng } = req.query;
        if (!originLat || !originLng || !destLat || !destLng) return res.status(400).json({ error: 'All coordinates required' });
        const apiKey = process.env.GOOGLE_MAPS_API_KEY;
        if (!apiKey) return res.status(500).json({ error: 'Maps API key not configured on server' });
        const origins = `${originLat},${originLng}`;
        const destinations = `${destLat},${destLng}`;
        const [drivingRes, walkingRes] = await Promise.all([
            fetch(`https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origins}&destinations=${destinations}&mode=driving&key=${apiKey}`).then(r => r.json()),
            fetch(`https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origins}&destinations=${destinations}&mode=walking&key=${apiKey}`).then(r => r.json())
        ]);
        res.json({
            driving: drivingRes.rows?.[0]?.elements?.[0] || null,
            walking: walkingRes.rows?.[0]?.elements?.[0] || null
        });
    } catch (e) { console.error('Distance error:', e); res.status(500).json({ error: 'Distance calculation failed' }); }
});

app.get('/api/maps/shops', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT id, title, latitude, longitude, owner_name, category, condition, created_at FROM items WHERE status = $1 AND latitude IS NOT NULL AND longitude IS NOT NULL', ['available']);
        const geojson = {
            type: 'FeatureCollection',
            features: rows.map(r => ({
                type: 'Feature',
                geometry: { type: 'Point', coordinates: [r.longitude, r.latitude] },
                properties: { id: r.id, name: r.title, owner: r.owner_name, category: r.category, condition: r.condition, createdAt: r.created_at }
            }))
        };
        res.json(geojson);
    } catch { res.status(500).json({}); }
});

// ═══════════════════════════════════════════════
// ENHANCED ADMIN ANALYTICS ENDPOINTS
// ═══════════════════════════════════════════════

app.get('/api/admin/analytics/overview', verifyFirebaseToken, requireAdmin, async (req, res) => {
    try {
        const [usersR, itemsR, activeR, reqsR, pendingR, convosR, acceptedR] = await Promise.all([
            pool.query('SELECT COUNT(*) FROM users'),
            pool.query('SELECT COUNT(*) FROM items'),
            pool.query("SELECT COUNT(*) FROM items WHERE status = 'available'"),
            pool.query('SELECT COUNT(*) FROM requests'),
            pool.query("SELECT COUNT(*) FROM requests WHERE status = 'pending'"),
            pool.query('SELECT COUNT(*) FROM conversations'),
            pool.query("SELECT COUNT(*) FROM requests WHERE status = 'accepted'")
        ]);
        const todayReqs = await pool.query("SELECT COUNT(*) FROM requests WHERE created_at >= CURRENT_DATE");
        const weekReqs = await pool.query("SELECT COUNT(*) FROM requests WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'");
        const monthReqs = await pool.query("SELECT COUNT(*) FROM requests WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'");
        res.json({
            totalUsers: parseInt(usersR.rows[0].count),
            totalItems: parseInt(itemsR.rows[0].count),
            activeItems: parseInt(activeR.rows[0].count),
            totalRequests: parseInt(reqsR.rows[0].count),
            pendingRequests: parseInt(pendingR.rows[0].count),
            acceptedRequests: parseInt(acceptedR.rows[0].count),
            totalConversations: parseInt(convosR.rows[0].count),
            requestsToday: parseInt(todayReqs.rows[0].count),
            requestsThisWeek: parseInt(weekReqs.rows[0].count),
            requestsThisMonth: parseInt(monthReqs.rows[0].count)
        });
    } catch (e) { console.error(e); res.status(500).json({}); }
});

app.get('/api/admin/analytics/categories', verifyFirebaseToken, requireAdmin, async (req, res) => {
    try {
        const { rows } = await pool.query("SELECT category, COUNT(*) as count FROM items GROUP BY category ORDER BY count DESC");
        res.json(rows);
    } catch { res.status(500).json([]); }
});

app.get('/api/admin/analytics/request-trends', verifyFirebaseToken, requireAdmin, async (req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT DATE(created_at) as date, COUNT(*) as count 
            FROM requests 
            WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
            GROUP BY DATE(created_at) ORDER BY date ASC
        `);
        res.json(rows);
    } catch { res.status(500).json([]); }
});

app.get('/api/admin/analytics/user-growth', verifyFirebaseToken, requireAdmin, async (req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT DATE(created_at) as date, COUNT(*) as count 
            FROM users 
            WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
            GROUP BY DATE(created_at) ORDER BY date ASC
        `);
        res.json(rows);
    } catch { res.status(500).json([]); }
});

app.get('/api/admin/analytics/top-items', verifyFirebaseToken, requireAdmin, async (req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT i.id, i.title, i.category, i.owner_name, COUNT(r.id) as request_count
            FROM items i LEFT JOIN requests r ON i.id = r.item_id
            GROUP BY i.id, i.title, i.category, i.owner_name
            ORDER BY request_count DESC LIMIT 10
        `);
        res.json(rows);
    } catch { res.status(500).json([]); }
});

app.get('/api/admin/analytics/item-trends', verifyFirebaseToken, requireAdmin, async (req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT DATE(created_at) as date, COUNT(*) as count 
            FROM items 
            WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
            GROUP BY DATE(created_at) ORDER BY date ASC
        `);
        res.json(rows);
    } catch { res.status(500).json([]); }
});

app.put('/api/admin/items/:id/visibility', verifyFirebaseToken, requireAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        if (!['available', 'hidden'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
        const { rows } = await pool.query('UPDATE items SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *', [status, req.params.id]);
        res.json(rows[0]);
    } catch { res.status(500).json({}); }
});

app.get('/api/admin/requests-full', verifyFirebaseToken, requireAdmin, async (req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT r.*, i.title as item_title, i.category as item_category, 
                   u.name as requester_display_name, u.email as requester_display_email, u.avatar as requester_avatar
            FROM requests r 
            JOIN items i ON r.item_id = i.id 
            LEFT JOIN users u ON r.requester_id = u.id
            ORDER BY r.created_at DESC
        `);
        res.json(rows);
    } catch { res.status(500).json([]); }
});

// WEBSOCKET
const connectedClients = new Map();
function broadcastToUser(userId, message) {
    const clients = connectedClients.get(userId);
    if (clients) {
        const msg = JSON.stringify(message);
        clients.forEach(ws => { if (ws.readyState === 1) ws.send(msg); });
    }
}

wss.on('connection', (ws) => {
    let userId = null;
    ws.on('message', async (messageAsString) => {
        try {
            const data = JSON.parse(messageAsString);
            if (data.type === 'register') {
                userId = data.userId;
                if (!connectedClients.has(userId)) connectedClients.set(userId, new Set());
                connectedClients.get(userId).add(ws);
                return;
            }
            if (data.type === 'chat_message') {
                const { conversationId, senderId, text } = data.payload;
                const { rows: msgs } = await pool.query('INSERT INTO messages (conversation_id, sender_id, text) VALUES ($1, $2, $3) RETURNING *', [conversationId, senderId, text]);
                const savedMsg = { id: msgs[0].id, conversationId, senderId, text, timestamp: msgs[0].timestamp };
                await pool.query('UPDATE conversations SET last_message = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [text, conversationId]);
                const { rows: convos } = await pool.query('SELECT buyer_id, seller_id FROM conversations WHERE id = $1', [conversationId]);
                if (convos.length) {
                    broadcastToUser(convos[0].buyer_id, { type: 'new_message', payload: savedMsg });
                    broadcastToUser(convos[0].seller_id, { type: 'new_message', payload: savedMsg });
                } else {
                    wss.clients.forEach(c => { if (c.readyState === 1) c.send(JSON.stringify({ type: 'new_message', payload: savedMsg })); });
                }
            }
        } catch (e) { }
    });
    ws.on('close', () => {
        if (userId && connectedClients.has(userId)) {
            connectedClients.get(userId).delete(ws);
            if (connectedClients.get(userId).size === 0) connectedClients.delete(userId);
        }
    });
});

server.listen(PORT, () => {
    console.log(`✅ LocalGift Backend running on http://localhost:${PORT}`);
    console.log(`   Postgres: ✅ Native Neon connected`);
});
