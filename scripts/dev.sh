#!/bin/bash
# filepath: scripts/dev.sh

echo "🔧 Démarrage de TaskFlow en mode développement..."

# Valider les variables d'environnement
./scripts/validate-env.sh
if [ $? -ne 0 ]; then
    echo "❌ Validation des variables d'environnement échouée"
    exit 1
fi

# Arrêter les services s'ils tournent déjà
docker-compose -f docker-compose.dev.yml down

# Supprimer les volumes anonymes
docker volume prune -f

# Construire et démarrer les services
echo "🚀 Construction et démarrage des services..."
docker-compose -f docker-compose.dev.yml up --build

echo "✅ TaskFlow démarré en mode développement !"
echo "📱 Frontend: http://localhost:${FRONTEND_PORT:-5173}"
echo "🔗 Backend: http://localhost:${BACKEND_PORT:-5000}"
echo "🗄️  PostgreSQL: localhost:${POSTGRES_PORT:-5432}"