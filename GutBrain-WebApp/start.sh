set -euo pipefail

echo "⏳ Bringing up Docker containers…"
docker-compose up --build -d

sleep 5

echo "🚀 Starting frontend (npm run dev)…"
cd frontend
npm run dev
