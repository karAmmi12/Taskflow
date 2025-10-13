#!/bin/bash
# filepath: scripts/stop.sh

echo "🛑 Arrêt de TaskFlow..."

# Arrêter les services de développement
docker-compose -f docker-compose.dev.yml down

# Arrêter les services de production
docker-compose down

echo "✅ Tous les services TaskFlow ont été arrêtés"