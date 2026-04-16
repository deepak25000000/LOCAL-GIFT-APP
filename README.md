# LocalGift Platform

A comprehensive full-stack platform that connects local communities to explore, share, and track local gifts, featuring an interactive 3D map, distinct administrative tools, and a reliable database backbone.

## File Structure

```text
LOCAL-GIFT-APP/
├── localgift-app/          # Frontend Next.js application
│   ├── public/             # Static assets (images, icons, map tiles, etc.)
│   ├── src/
│   │   ├── app/            # App router pages (admin, auth, map, dashboard, profile, etc.)
│   │   ├── components/     # Reusable React components (AuthContext, SimpleTextPage, etc.)
│   │   └── lib/            # Utility functions and library wrappers
│   └── package.json        # Frontend dependencies and scripts
│
├── backend/                # Backend Node.js application
│   ├── src/                # Backend logic modules (requests, uploads)
│   ├── index.js            # Main Express server entry point
│   ├── index_neon.js       # Express server using Neon PostgreSQL
│   ├── supabase_schema.sql # Supabase / PostgreSQL schema definitions
│   ├── seed_realistic.js   # Advanced script for populating realistic map entities 
│   ├── database.js         # Database connection and helper logic
│   └── package.json        # Backend dependencies and scripts
│
├── .gitignore              # Ignored files, node_modules, and local environments
└── README.md               # This project documentation file
```

## Elaborated Tech Stack

The platform leverages robust, modern solutions across the frontend, backend, and infrastructure:

### Frontend
- **Next.js (App Router):** Fast, SEO-optimized React framework handling robust routing and server-side rendering logic.
- **React 19:** Building block for building efficient, high-performance UI components.
- **TailwindCSS:** Utility-first framework providing highly responsive and customizable styles.
- **Cesium.js & Resium:** Advanced interactive 3D geospatial rendering, visualizing data on a realistic 3D globe.
- **Leaflet:** Utilized as an alternative mapping solution, managing cartographic visualization components.
- **Framer Motion:** High-performance micro-interactions, page transitions, and animations.

### Backend
- **Node.js & Express:** Lightweight, asynchronous server architecture fielding map data, auth verification, and entity uploads.
- **Supabase (PostgreSQL):** Robust relational database system with powerful integration methods, forming the core schema.
- **Neon Database:** Serverless Postgres service utilized for stable and scalable cloud database connectivity.
- **Firebase Admin SDK:** Server-side Firebase integration for user verifications and advanced data orchestration.
- **Multer:** Handling high-quality image and multipart file uploads processing.

## Getting Started

**Start the Backend Engine:**
```bash
cd backend
npm install
npm run start
```

**Start the Frontend App:**
```bash
cd localgift-app
npm install
npm run dev
```
Navigate to `http://localhost:3000` to interact with the application.
