# Swami Fashion - Premium Men's Casual & Regular Fit Store

Swami Fashion is an e-commerce platform and management system designed for men's casual and regular fit clothing. Built with modern web technologies, responsive light-luxury aesthetics, and an intuitive admin control suite.

---

## 🚀 Tech Stack

### Frontend
- **Framework:** React 19 + Vite
- **Styling & UI:** Modern Vanilla CSS + Bootstrap 5
- **Animations:** Framer Motion & GSAP
- **Icons:** FontAwesome Free
- **Routing:** React Router v7

### Backend
- **Runtime:** Node.js + Express.js
- **Database:** MySQL (using `mysql2/promise`)
- **Authentication:** Argon2id password and PIN hashing
- **Security:** Helmet, CORS, Cookie-parser, Rate Limiting
- **File Uploads:** Multer for product & banner media

---

## 📁 Project Structure

```
swami-collections/
├── backend/
│   ├── src/
│   │   ├── config/          # DB connection & app config
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Auth, security & upload middlewares
│   │   ├── routes/          # API route declarations
│   │   └── server.js        # Express app entry point
│   ├── uploads/             # Media storage (banners, product images)
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Storefront & Admin pages
│   │   ├── App.jsx          # App root & route definitions
│   │   └── main.jsx         # React DOM mount point
│   ├── public/              # Static public assets
│   ├── index.html
│   └── package.json
├── database/
│   ├── migrations/          # SQL table migration scripts
│   └── seeds/               # Initial demo & admin seed scripts
└── .gitignore
```

---

## 🛠️ Getting Started

### 1. Prerequisites
- Node.js (v18+ recommended)
- MySQL Server running locally or in cloud

### 2. Backend Setup
1. Open a terminal in `backend/`:
   ```bash
   cd backend
   npm install
   ```
2. Copy the sample environment file and configure your database credentials:
   ```bash
   cp ../.env.example .env
   ```
3. Run migrations and initial seeds:
   ```bash
   npm run seed
   ```
4. Start the backend server:
   ```bash
   npm run dev
   ```
   Backend will run on `http://localhost:5000`.

### 3. Frontend Setup
1. Open a terminal in `frontend/`:
   ```bash
   cd frontend
   npm install
   ```
2. Start the Vite dev server:
   ```bash
   npm run dev
   ```
   Frontend will be available at `http://localhost:5173`.

---

## 🔑 Admin Credentials (Initial Default)
- Default credentials are configured in your `.env` file via `ADMIN_INIT_USER`, `ADMIN_INIT_PASS`, and `ADMIN_INIT_PIN`.

---

## 📄 License
ISC
