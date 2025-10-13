#!/bin/bash
# filepath: scripts/prod.sh

echo "🚀 Démarrage de TaskFlow en mode production..."

# Valider les variables d'environnement
./scripts/validate-env.sh
if [ $? -ne 0 ]; then
    echo "❌ Validation des variables d'environnement échouée"
    exit 1
fi

# Arrêter les services s'ils tournent déjà
docker-compose down

# Supprimer les volumes anonymes
docker volume prune -f

# Construire et démarrer les services
echo "🚀 Construction et démarrage des services..."
docker-compose up --build -d

echo "✅ TaskFlow démarré en mode production !"
echo "🌐 Application: http://localhost"
echo "🔗 Backend: http://localhost:${BACKEND_PORT:-5000}"

# Afficher les logs
docker-compose logs -f