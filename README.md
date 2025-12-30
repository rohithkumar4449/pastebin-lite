# Pastebin Lite

A simple Pastebin-like application for storing and sharing text content with optional expiration.

**Live Demo:** `https://your-app.vercel.app` (replace with your deployed URL)

## 🚀 Features

- **Create Pastes**: Store any text content and get a shareable URL
- **Time-based Expiry (TTL)**: Pastes can expire after a set number of seconds
- **View Limits**: Pastes can become unavailable after a maximum number of views
- **Combined Constraints**: Both TTL and view limits can be set; paste expires when either is triggered
- **Safe Rendering**: Content is displayed safely without script execution

## 📋 API Endpoints

| Method | Endpoint          | Description                  |
| ------ | ----------------- | ---------------------------- |
| GET    | `/api/healthz`    | Health check                 |
| POST   | `/api/pastes`     | Create a new paste           |
| GET    | `/api/pastes/:id` | Fetch paste (counts as view) |
| GET    | `/p/:id`          | View paste in HTML           |

## 🗄️ Persistence Layer

This application uses **MySQL** as its persistence layer.

### Free MySQL Hosting Options

1. **PlanetScale** (Recommended): https://planetscale.com - Serverless MySQL with generous free tier
2. **Railway**: https://railway.app - Easy MySQL deployment with free tier
3. **TiDB Cloud**: https://tidbcloud.com - MySQL-compatible serverless database
4. **Aiven**: https://aiven.io - Managed MySQL with free tier

### Why MySQL?

1. **Widely Supported**: Most popular relational database
2. **Serverless Options**: PlanetScale offers excellent serverless MySQL
3. **Free Tiers**: Multiple providers offer free MySQL hosting
4. **Reliable**: Battle-tested for production workloads
5. **Easy to Use**: Simple setup and management

### Database Schema

The table is created automatically on first request:

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

- Node.js 18+ installed
- npm or yarn
- A MySQL database (PlanetScale, Railway, or local MySQL)

### Setup Steps

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/pastebin-lite.git
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

   Edit `.env` and add your database credentials:

   ```
   # For Aiven MySQL:
   DB_HOST=mysql-xxxxx.h.aivencloud.com
   DB_PORT=27998
   DB_USER=avnadmin
   DB_PASSWORD=your_password
   DB_NAME=defaultdb

   # For local MySQL:
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=password
   DB_NAME=pastebin_lite
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

## 🚢 Deployment to Vercel

### Step 1: Set Up MySQL Database (Aiven Recommended)

1. Go to [https://aiven.io](https://aiven.io) and sign up (free tier)
2. Create a new MySQL service
3. Under "Allowed IP addresses", add `0.0.0.0/0` to allow Vercel access
4. Copy the connection details (host, port, user, password, database)

**Alternative: Railway**

1. Go to [https://railway.app](https://railway.app) and sign up
2. Create a new project → Add MySQL
3. Copy the connection details from the Variables tab

### Step 2: Deploy to Vercel

1. Push your code to GitHub
2. Go to [https://vercel.com](https://vercel.com) and import your repository
3. Add environment variables:
   - `DB_HOST`: Your MySQL host
   - `DB_PORT`: Your MySQL port
   - `DB_USER`: Your MySQL username
   - `DB_PASSWORD`: Your MySQL password
   - `DB_NAME`: Your database name
   - `TEST_MODE`: Set to `1` for automated testing
4. Click "Deploy"

The database table will be created automatically on the first request.

## 🧪 Testing Mode

For automated testing, set `TEST_MODE=1` in environment variables.

This enables the `x-test-now-ms` header to simulate time for TTL testing:

```bash
# Test that a paste expires
curl -H "x-test-now-ms: 1735689600000" https://your-app.vercel.app/api/pastes/abc123
```

## 📁 Project Structure

```
pastebin-lite/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── healthz/route.js      # Health check
│   │   │   └── pastes/
│   │   │       ├── route.js          # Create paste
│   │   │       └── [id]/route.js     # Fetch paste
│   │   ├── p/
│   │   │   └── [id]/page.js          # View paste HTML
│   │   ├── page.js                   # Home page
│   │   ├── layout.js                 # Root layout
│   │   └── globals.css               # Styles
│   └── lib/
│       ├── db.js                     # MySQL connection pool
│       └── utils.js                  # Utility functions
├── package.json
├── next.config.js
└── README.md
```

## 🏗️ Design Decisions

### 1. Next.js App Router

- Modern React framework with built-in API routes
- Perfect integration with Vercel
- Server components for better performance

### 2. Direct MySQL with mysql2

- Lightweight connection pooling
- No ORM overhead
- SSL support for cloud databases
- Auto-creates table on first request

### 3. Atomic View Counting

- Uses database-level increment to prevent race conditions
- Ensures accurate view counting under concurrent load

### 4. Test Mode Support

- `x-test-now-ms` header for deterministic time testing
- Only active when `TEST_MODE=1`
- Doesn't affect production behavior

### 5. No Hardcoded URLs

- Base URL is derived from request headers
- Works across different environments (local, staging, production)

## 📜 License

MIT License
