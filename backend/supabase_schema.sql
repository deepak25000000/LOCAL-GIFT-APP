-- ============================================
-- LocalGift Supabase Schema
-- Run this entire script in your Supabase SQL Editor
-- ============================================

-- 1. Users table (synced from Firebase Auth)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,              -- Firebase UID
    name TEXT NOT NULL DEFAULT 'User',
    email TEXT UNIQUE NOT NULL,
    avatar TEXT DEFAULT '',
    role TEXT NOT NULL DEFAULT 'user', -- 'user' or 'admin'
    location_lat DOUBLE PRECISION,
    location_lng DOUBLE PRECISION,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Items table
CREATE TABLE IF NOT EXISTS items (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    category TEXT DEFAULT 'Other',
    condition TEXT DEFAULT 'Good',
    owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    owner_name TEXT DEFAULT 'Anonymous',
    owner_avatar TEXT DEFAULT '',
    owner_email TEXT DEFAULT '',
    latitude DOUBLE PRECISION DEFAULT 0,
    longitude DOUBLE PRECISION DEFAULT 0,
    attributes JSONB DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'available',  -- 'available', 'claimed', 'removed'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- Suggested Additions built for the map feature:
-- ============================================
-- CREATE INDEX IF NOT EXISTS idx_items_category ON items(category);
-- CREATE INDEX IF NOT EXISTS idx_items_lat_lng ON items(latitude, longitude);

-- 3. Item images
CREATE TABLE IF NOT EXISTS item_images (
    id BIGSERIAL PRIMARY KEY,
    item_id BIGINT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Requests (first-come-first-served via created_at ordering)
CREATE TABLE IF NOT EXISTS requests (
    id BIGSERIAL PRIMARY KEY,
    item_id BIGINT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    requester_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    requester_name TEXT DEFAULT '',
    requester_email TEXT DEFAULT '',
    owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    owner_email TEXT DEFAULT '',
    scheduled_time TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'pending',  -- 'pending', 'accepted', 'declined'
    message TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Conversations
CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    item_id TEXT DEFAULT '',
    item_title TEXT DEFAULT '',
    buyer_id TEXT NOT NULL,
    buyer_name TEXT DEFAULT '',
    buyer_avatar TEXT DEFAULT '',
    seller_id TEXT NOT NULL,
    seller_name TEXT DEFAULT '',
    seller_avatar TEXT DEFAULT '',
    last_message TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Messages
CREATE TABLE IF NOT EXISTS messages (
    id BIGSERIAL PRIMARY KEY,
    conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id TEXT NOT NULL,
    text TEXT NOT NULL DEFAULT '',
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Saved items
CREATE TABLE IF NOT EXISTS saved_items (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_id BIGINT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, item_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_items_owner ON items(owner_id);
CREATE INDEX IF NOT EXISTS idx_items_status ON items(status);
CREATE INDEX IF NOT EXISTS idx_requests_item ON requests(item_id);
CREATE INDEX IF NOT EXISTS idx_requests_requester ON requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_requests_owner ON requests(owner_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_saved_items_user ON saved_items(user_id);
