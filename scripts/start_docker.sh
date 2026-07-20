#!/bin/bash
echo "🐳 Starting SchemeSense AI with Docker..."

# Optional: pass your OpenAI key
# export OPENAI_API_KEY=sk-your-key-here

docker-compose up --build

echo ""
echo "🌐 App: http://localhost:3000"
echo "📡 API: http://localhost:8000"
echo "📖 API Docs: http://localhost:8000/docs"
