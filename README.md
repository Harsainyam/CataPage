# Catalog Reels

A TikTok/Shorts-style vertical feed for browsing B2B product & service catalogs. Companies sign up, post catalog items with photos/short videos, tags, and specs. Buyers scroll a full-screen feed, search, filter by tag, and leave reviews.

## Stack
- **Backend:** Node.js + Express
- **Views:** EJS (server-rendered, with a small vanilla-JS layer for infinite scroll)
- **Database:** MongoDB Atlas (via Mongoose)
- **Media storage:** Cloudinary (images + short videos)
- **Sessions:** express-session, stored in MongoDB via connect-mongo
- **Deployment:** Render

## Local setup

1. Install dependencies:
   ```
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in real values:
   ```
   cp .env.example .env
   ```
   - `MONGO_URI`: create a free cluster at https://www.mongodb.com/cloud/atlas, get the connection string, and make sure your IP (or `0.0.0.0/0` for Render) is allow-listed under Network Access.
   - `CLOUDINARY_*`: sign up free at https://cloudinary.com, values are on your dashboard home page.
   - `SESSION_SECRET`: any long random string.

3. Run locally:
   ```
   npm run dev
   ```
   Visit `http://localhost:3000`.

## Deploying to Render

1. Push this project to a GitHub repo.
2. On Render: **New > Web Service**, connect the repo.
3. Build command: `npm install`
4. Start command: `npm start`
5. Add the same environment variables from `.env` in Render's dashboard under **Environment**.
6. In MongoDB Atlas, under Network Access, allow `0.0.0.0/0` (Render's IPs are dynamic) or add Render's static outbound IPs if you're on a paid Render plan.
7. Deploy. Render gives you a live `.onrender.com` URL.

## How it's structured

```
server.js              Express app entry point
config/db.js            Mongoose connection
config/cloudinary.js    Cloudinary + multer upload config
models/                 Company, CatalogItem, Review schemas
routes/auth.js          Signup / login / logout
routes/catalog.js       Public feed, search API, item detail, reviews
routes/company.js       Company dashboard: create/edit/delete catalog items
views/                  EJS templates
public/css/style.css    All styling
public/js/feed.js       Infinite-scroll + video autoplay-on-view logic
```

## Key features already built
- Company signup/login (bcrypt-hashed passwords, sessions)
- Add/edit/delete catalog items with a photo upload straight to Cloudinary (static images only, no video)
- Category browsing (chip list of top categories) + tags + free-text search (MongoDB text index across title/description/category/tags)
- Full-screen vertical snap-scroll feed (desktop: image + side panel; mobile: TikTok-style bottom overlay) with infinite scroll for doomscrolling through the catalog
- Item detail page with star-rating reviews (open to any visitor, no login required to review)
- Company dashboard with view counts per item

## Natural next steps
- Add pagination/search to the company dashboard once catalogs grow large
- Add company verification (a manual admin flag right now — `verified` field on Company)
- Rate-limit review submissions to reduce spam
- Add image compression/multiple resolutions in the Cloudinary transformation if load times matter on mobile data
