#!/bin/bash
set -e

echo "🇮🇳 SchemeSense AI - Local Setup Script"
echo "========================================"

# Check prerequisites
check_cmd() {
  if ! command -v "$1" &>/dev/null; then
    echo "❌ $1 not found. Please install it first."
    exit 1
  fi
  echo "✅ $1 found"
}

check_cmd python3
check_cmd node
check_cmd npm
check_cmd psql || echo "  ⚠️  psql not found - make sure PostgreSQL is running"

echo ""
echo "📦 Setting up Backend..."
cd backend
python3 -m venv venv
source venv/bin/activate  || . venv/Scripts/activate 2>/dev/null
pip install -r requirements.txt -q
cp .env.example .env
echo "✅ Backend dependencies installed"

echo ""
echo "📦 Setting up Frontend..."
cd ../frontend
npm install --silent
cp .env.example .env.local
echo "✅ Frontend dependencies installed"

echo ""
echo "======================================"
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Make sure PostgreSQL is running on port 5432"
echo "  2. Create database: createdb -U postgres schemesense"
echo "     Or run: psql -U postgres -c \"CREATE USER schemesense WITH PASSWORD 'schemesense123'; CREATE DATABASE schemesense OWNER schemesense;\""
echo "  3. (Optional) Add your OpenAI API key to backend/.env"
echo "  4. Start backend:  cd backend && source venv/bin/activate && uvicorn app.main:app --reload"
echo "  5. Start frontend: cd frontend && npm run dev"
echo ""
echo "🌐 Open: http://localhost:3000"
echo "📧 Admin: admin@schemesense.ai / Admin@123"
echo "📧 Demo:  demo@schemesense.ai  / Demo@123"
