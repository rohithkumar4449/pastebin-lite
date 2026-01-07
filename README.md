# Pastebin Lite

A simple Pastebin-like application for storing and sharing text content with optional expiration.

**Live Demo:** https://pastebin-lite-aganitha-lite.vercel.app

## 🚀 Features

- **Create Pastes**: Store any text content and get a shareable URL
- **Time-based Expiry (TTL)**: Pastes automatically expire after a set number of seconds
- **View Limits**: Pastes become unavailable after reaching maximum view count
- **Combined Constraints**: Both TTL and view limits can be set; paste expires when either triggers first
- **Safe Rendering**: Content is HTML-escaped to prevent XSS attacks

## 🔄 How Expiry & View Counting Works

### Time-Based Expiry (TTL)

1. When creating a paste with `ttl_seconds`, the server calculates `expires_at = current_time + ttl_seconds`
2. On every fetch request, the server checks: `current_time > expires_at`
3. If expired → returns **404 Not Found**
4. Supports `TEST_MODE=1` with `x-test-now-ms` header for deterministic testing

### View Count Limiting

1. When creating a paste with `max_views`, the value is stored in the database
2. On every API fetch (`GET /api/pastes/:id`):
   - First, check if `view_count >= max_views` → if true, return **404**
   - Then atomically increment `view_count` using `UPDATE pastes SET view_count = view_count + 1`
   - Return `remaining_views = max_views - view_count`
3. Atomic increment prevents race conditions under concurrent load

### Combined Constraints

- If both `ttl_seconds` AND `max_views` are set
- The paste becomes unavailable when **either** constraint triggers first
- Check order: TTL expiry → View limit → Increment view count → Return paste

## 📋 API Endpoints

| Method | Endpoint          | Description                  |
| ------ | ----------------- | ---------------------------- |
| GET    | `/api/healthz`    | Health check                 |
| POST   | `/api/pastes`     | Create a new paste           |
| GET    | `/api/pastes/:id` | Fetch paste (counts as view) |
| GET    | `/p/:id`          | View paste in HTML           |

## 🗄️ Persistence Layer

This application uses **MySQL** hosted on **Aiven** (free tier).

### Why Aiven MySQL?

- Free tier available
- SSL/TLS encryption
- IP whitelisting for security
- Works with Vercel serverless functions

### Database Schema

The table is auto-created on first request:

```sql
CREATE TABLE pastes (
  id VARCHAR(21) PRIMARY KEY,
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NULL,
  max_views INT NULL,
  view_count INT DEFAULT 0,
  INDEX idx_expires_at (expires_at)
);
```

## 🛠️ Running Locally

### Prerequisites

- Node.js 18+
- MySQL database (local or Aiven)

### Setup Steps

1. **Clone the repository**

   ```bash
   git clone https://github.com/rohithkumar4449/pastebin-lite.git
   cd pastebin-lite
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env`:

   ```
   DB_HOST=mysql-xxxxx.h.aivencloud.com
   DB_PORT=27998
   DB_USER=avnadmin
   DB_PASSWORD=your_password
   DB_NAME=defaultdb
   TEST_MODE=1
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Open http://localhost:3000**

## 🚢 Deployment

**Hosted on:** Vercel + Aiven MySQL



### Important: Aiven IP Whitelisting

Add `0.0.0.0/0` in Aiven's "Allowed IP addresses" to allow Vercel serverless functions to connect.

## 🧪 Test Mode

When `TEST_MODE=1`, the `x-test-now-ms` header overrides current time for TTL testing:

```bash
# Simulate future time to test expiry
curl -H "x-test-now-ms: 1735689600000" https://pastebin-lite-aganitha-lite.vercel.app/api/pastes/abc123
```

## 📁 Project Structure

```
pastebin-lite/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── healthz/route.js      # Health check
│   │   │   └── pastes/
│   │   │       ├── route.js          # POST: Create paste
│   │   │       └── [id]/route.js     # GET: Fetch paste
│   │   ├── p/[id]/
│   │   │   ├── page.js               # View paste (Server Component)
│   │   │   ├── PasteContent.js       # Paste UI (Client Component)
│   │   │   └── not-found.js          # 404 page
│   │   ├── page.js                   # Home page (Create form)
│   │   ├── layout.js
│   │   └── globals.css
│   └── lib/
│       ├── db.js                     # MySQL connection pool
│       └── utils.js                  # Helper functions
├── package.json
└── next.config.js
```

## 🏗️ Design Decisions

| Decision                       | Reason                                                            |
| ------------------------------ | ----------------------------------------------------------------- |
| **Next.js 15 App Router**      | Modern framework, built-in API routes, Vercel integration         |
| **mysql2 (no ORM)**            | Lightweight, direct SQL, connection pooling                       |
| **Atomic view counting**       | `UPDATE SET view_count = view_count + 1` prevents race conditions |
| **Server + Client Components** | Server fetches data, Client handles UI with styled-jsx            |
| **Auto table creation**        | `CREATE TABLE IF NOT EXISTS` on first request                     |
| **No hardcoded URLs**          | Base URL derived from request headers                             |

## 📜 License

MIT License
