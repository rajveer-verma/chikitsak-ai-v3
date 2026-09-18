# 🏥 Chikitsak-AI

AI-powered healthcare assistant providing smart, user-centric solutions for both patients and doctors.

---

## 🏛️ Architecture Overview

The project is structured with clean client/server separation:

```
chikitsak-ai-v2-main/
├── client/                     # Frontend (React 18 + Vite + Tailwind CSS)
│   ├── src/                    # Components, pages, hooks, contexts
│   ├── public/                 # Static assets
│   ├── package.json            # Client dependencies & scripts
│   ├── vite.config.js          # Vite configuration
│   └── .env.example            # Client environment variables template
├── server/                     # Backend (Node.js + Express)
│   ├── routes/                 # Express API routes
│   ├── controllers/            # Controller business logic
│   ├── data/                   # Medical dataset & knowledge graph
│   ├── index.js                # Server entry point
│   ├── package.json            # Server dependencies & scripts
│   └── .env.example            # Server environment variables template
├── FIREBASE_SETUP_GUIDE.md     # Firebase Auth & Firestore security rules setup
├── README.md                   # Project documentation
└── .gitignore                  # Git ignore definitions
```

---

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Shadcn UI, React Router v6, Lucide Icons, Recharts
- **Backend:** Node.js, Express.js, CORS, Dotenv
- **Database:** Firebase Cloud Firestore (NoSQL)
- **Authentication:** Firebase Auth (Email/Password)

---

## 👥 Full-Stack Team Responsibility Areas

- **Member 1 (Frontend & UI):** React components, responsive layouts, client routing, Shadcn UI styling, state management.
- **Member 2 (Backend & APIs):** Node.js + Express architecture, REST endpoints, error handling, CORS, server controllers.
- **Member 3 (Database & Auth):** Firebase Auth, Firestore data models (`profiles`, `appointments`, `messages`), security rules.
- **Member 4 (AI & Healthcare Engine):** Symptom assessment engine, disease-symptom matching logic, Web Speech API integration.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### 1. Server Setup (Backend)
```bash
# Navigate to the server folder
cd server

# Install dependencies
npm install

# Start backend server (runs on http://localhost:5000)
npm start
```

### 2. Client Setup (Frontend)
```bash
# In a new terminal, navigate to the client folder
cd client

# Install dependencies
npm install

# Start Vite development server (runs on http://localhost:8080)
npm run dev
```

---

## ⚙️ Environment Variables

### Client (`client/.env`)
```env
VITE_API_URL=http://localhost:5000
```

### Server (`server/.env`)
```env
PORT=5000
CORS_ORIGIN=http://localhost:8080
```

---

## 🩺 Core API Endpoints

- `GET /api/health` - Health check status
- `POST /api/symptoms` - Symptom assessment & disease matching
  - **Body:** `{ "symptoms": ["headache", "fever", "cough"] }`
  - **Response:** Ranked array of matched conditions with match count
