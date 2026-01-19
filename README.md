# Field Management System

A professional multi-tenant B2B Field Service Management platform built with Node.js, Express, Next.js 14, PostgreSQL, and TypeScript.

![Dashboard Preview](./docs/dashboard.png)

## 🚀 Features

- **Multi-Tenant Architecture** - Secure data isolation between organizations
- **Role-Based Access Control** - Admin, Worker, and Customer roles
- **Job Management** - Create, assign, track, and complete jobs
- **Real-Time Updates** - Socket.io powered live updates
- **Customer Portal** - Customers can view job progress
- **Mobile-First Design** - Responsive dashboard with dark theme
- **Professional UI** - Colorful Flaticon-style icons and modern aesthetics

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Language**: TypeScript
- **Auth**: JWT (Access + Refresh Tokens)
- **Real-time**: Socket.io

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Icons**: React Icons (Flat Color, FontAwesome)

---

## 📦 Deployment

### Backend on Render

1. **Create a PostgreSQL Database on Render**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" → "PostgreSQL"
   - Name: `field-management-db`
   - Choose Free plan
   - Copy the **Internal Database URL**

2. **Deploy the Backend**
   - Click "New" → "Web Service"
   - Connect your GitHub repo
   - **Root Directory**: `server`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run migrate && npm start`
   - **Environment**: Node

3. **Set Environment Variables in Render**
   ```
   NODE_ENV=production
   PORT=10000
   DATABASE_URL=<your-render-postgres-internal-url>
   JWT_SECRET=<generate-a-strong-secret>
   JWT_ACCESS_EXPIRY=15m
   JWT_REFRESH_EXPIRY=7d
   CORS_ORIGIN=https://your-app.vercel.app
   ```

4. **Seed the Database** (one-time)
   - After deployment, go to your service's Shell tab
   - Run: `npm run seed`

### Frontend on Vercel

1. **Import Project**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New" → "Project"
   - Import from GitHub
   - **Root Directory**: `client`

2. **Set Environment Variables**
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api
   ```

3. **Deploy**
   - Vercel will auto-detect Next.js and deploy

4. **Update CORS on Render**
   - After getting your Vercel URL, update `CORS_ORIGIN` in Render

---

## 🔑 Demo Credentials

After seeding the database:

| Role   | Email                    | Password   |
|--------|--------------------------|------------|
| Admin  | admin@fieldservice.com   | admin123   |
| Worker | worker@fieldservice.com  | worker123  |

---

## 💻 Local Development

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Git

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/amiraijaz/Field-Management-System.git
   cd Field-Management-System
   ```

2. **Setup Backend**
   ```bash
   cd server
   cp .env.example .env
   # Edit .env with your database credentials
   npm install
   npm run migrate
   npm run seed
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd client
   cp .env.example .env.local
   # Edit .env.local with your API URL
   npm install
   npm run dev
   ```

4. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

---

## 📁 Project Structure

```
Field-Management-System/
├── client/                 # Next.js 14 Frontend
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   ├── components/    # UI components
│   │   ├── contexts/      # React contexts
│   │   ├── hooks/         # Custom hooks
│   │   └── lib/           # API clients & utilities
│   ├── vercel.json        # Vercel config
│   └── package.json
│
├── server/                 # Express.js Backend
│   ├── src/
│   │   ├── config/        # Environment & DB config
│   │   ├── middlewares/   # Auth & error handling
│   │   ├── modules/       # Feature modules
│   │   └── database/      # Migrations & seeds
│   ├── render.yaml        # Render config
│   └── package.json
│
└── README.md
```

---

## 🔌 API Endpoints

| Method | Endpoint              | Description              |
|--------|-----------------------|--------------------------|
| POST   | /api/auth/login       | User login               |
| POST   | /api/auth/register    | User registration        |
| POST   | /api/auth/refresh     | Refresh access token     |
| GET    | /api/jobs             | List all jobs            |
| POST   | /api/jobs             | Create new job           |
| GET    | /api/jobs/:id         | Get job details          |
| PUT    | /api/jobs/:id         | Update job               |
| GET    | /api/customers        | List customers           |
| GET    | /api/users            | List users               |
| GET    | /api/job-statuses     | List job statuses        |
| GET    | /api/health           | Health check             |

---

## 📝 License

MIT License - Feel free to use this project for personal or commercial purposes.

---

## 👨‍💻 Author

**Amir Aijaz**
- GitHub: [@amiraijaz](https://github.com/amiraijaz)
