# Scheme Sense AI

**AI-powered platform to discover Indian government schemes you are eligible for.**

## ✨ Features

- 🔍 **AI Eligibility Matching** – Compares your profile against 12 pre-loaded real government schemes
- 💰 **Benefits Calculator** – Shows total estimated benefit in ₹ across all eligible schemes
- 🤖 **AI Chat Assistant** – Ask questions about schemes in English or Telugu
- 🌐 **Bilingual** – Full English + Telugu support
- 📋 **Scheme Detail** – Documents, dates, eligibility breakdown, official apply link
- 🔖 **Save Schemes** – Bookmark schemes to apply later
- 🔒 **Admin Panel** – Manage schemes, view users and analytics
- 🐳 **Docker Ready** – One command to run everything

## 🚀 Quick Start (Docker — Recommended)

**Prerequisites:** Docker + Docker Compose installed

```bash
cd schemesense
docker-compose up --build
```

Open http://localhost:3000

**Login credentials:**
| Role  | Email                    | Password   |
|-------|--------------------------|------------|
| Admin | admin@schemesense.ai     | Admin@123  |
| Demo  | demo@schemesense.ai      | Demo@123   |

## 🖥️ Local Setup (Without Docker)

**Prerequisites:** Python 3.11+, Node.js 18+, PostgreSQL 14+

### 1. Database
```bash
psql -U postgres -f scripts/create_db.sql
# Or manually:
# CREATE USER schemesense WITH PASSWORD 'schemesense123';
# CREATE DATABASE schemesense OWNER schemesense;
```

### 2. Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env if your DB credentials differ
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000

## 🔑 OpenAI (Optional)

The app works without OpenAI key using a smart rule-based fallback for the chat assistant.

To enable GPT-4o-mini for better chat responses:
1. Get API key from https://platform.openai.com
2. Add to `backend/.env`: `OPENAI_API_KEY=sk-your-key-here`
3. Restart backend

## 📁 Project Structure

```
schemesense/
├── backend/
│   └── app/
│       ├── main.py           # FastAPI entry point
│       ├── models/           # SQLAlchemy models
│       ├── schemas/          # Pydantic schemas
│       ├── api/routes/       # Auth, Schemes, Admin endpoints
│       ├── services/         # Eligibility engine
│       ├── ai/               # Chat assistant
│       ├── db/               # Database, seed data
│       └── core/             # Config, security, deps
├── frontend/
│   └── src/
│       ├── app/              # Next.js pages
│       ├── components/       # Reusable components
│       ├── lib/              # API client, store, i18n
│       └── types/            # TypeScript types
├── scripts/                  # Setup scripts
├── docker-compose.yml
└── README.md
```

## 🌐 API Endpoints

| Endpoint | Description |
|----------|-------------|
| POST /api/auth/register | Register new user |
| POST /api/auth/login | Login |
| PUT /api/auth/me/profile | Update profile |
| POST /api/schemes/compute-matches | Run eligibility engine |
| GET /api/schemes/my-matches | Get matched schemes |
| GET /api/schemes/benefits-calculator | Total benefit ₹ |
| GET /api/schemes/dashboard-stats | Dashboard stats |
| GET /api/schemes/search?q= | Search schemes |
| POST /api/schemes/chat | AI chat |
| GET /api/admin/stats | Admin analytics |

API docs: http://localhost:8000/docs

## 🏛️ Pre-loaded Schemes (12)

1. PM-KISAN – ₹6,000/year for farmers
2. Post-Matric Scholarship (SC) – ₹60,000/year
3. PM Matru Vandana Yojana – ₹5,000 for mothers
4. Sukanya Samriddhi Yojana – Savings for girl child
5. PM Fasal Bima Yojana – Crop insurance
6. PM Awas Yojana (Gramin) – ₹1.2L housing
7. Ayushman Bharat PMJAY – ₹5L health insurance
8. PM Vishwakarma – ₹3L loan for artisans
9. CSIS Education Loan Subsidy – Interest-free loan
10. Stand-Up India – ₹10L–₹1Cr business loan
11. YSR Rythu Bharosa (AP) – ₹13,500 for AP farmers
12. OBC Post-Matric Scholarship – ₹30,000/year

## 🔧 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | FastAPI, SQLAlchemy (async), Pydantic v2 |
| Database | PostgreSQL |
| Cache | Redis |
| Vector DB | Qdrant |
| AI | OpenAI GPT-4o-mini (optional) + Rule-based fallback |
| Auth | JWT tokens |
| Deploy | Docker + Docker Compose |

## 🔒 Security

- Passwords hashed with bcrypt
- JWT authentication with 7-day expiry
- Role-based access control (user / admin)
- CORS configured for local development
- Input validation with Pydantic v2

---
Built with ❤️ for Indian citizens
