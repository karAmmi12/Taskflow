#!/bin/bash

echo "🚀 Configuration de TaskFlow avec Docker"

# Vérifier que Docker est installé
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

echo "✅ Docker et Docker Compose sont installés"

# Vérifier la présence du fichier .env à la racine
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        echo "📝 Création du fichier .env à partir de .env.example"
        cp .env.example .env
        echo "⚠️  IMPORTANT: Modifiez les valeurs dans le fichier .env avant de continuer !"
        echo "⚠️  Changez notamment :"
        echo "   - POSTGRES_PASSWORD"
        echo "   - JWT_SECRET"
        echo "   - Autres informations sensibles"
        echo ""
        read -p "Appuyez sur Entrée une fois que vous avez modifié le fichier .env..."
    else
        echo "❌ Aucun fichier .env ou .env.example trouvé"
        echo "📝 Création d'un fichier .env basique"
        
        # Générer un mot de passe aléatoire sécurisé
        RANDOM_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-16)
        RANDOM_JWT_SECRET=$(openssl rand -base64 64 | tr -d "=+/")
        
        cat > .env << EOL
# ==============================================
# Configuration centralisée pour TaskFlow
# ==============================================

# Application
NODE_ENV=development
APP_NAME=TaskFlow
APP_VERSION=1.0.0

# Backend Configuration
BACKEND_PORT=5000
JWT_SECRET=${RANDOM_JWT_SECRET}

# Database Configuration
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_USER=karimammi
POSTGRES_PASSWORD=${RANDOM_PASSWORD}
POSTGRES_DB=taskflow
DATABASE_URL=postgresql://\${POSTGRES_USER}:\${POSTGRES_PASSWORD}@\${POSTGRES_HOST}:\${POSTGRES_PORT}/\${POSTGRES_DB}?schema=public

# Frontend Configuration
FRONTEND_PORT=5173
VITE_API_URL=http://localhost:\${BACKEND_PORT}/api

# Docker Network
NETWORK_NAME=taskflow-network

# Volumes
POSTGRES_VOLUME=taskflow_postgres_data
POSTGRES_DEV_VOLUME=taskflow_postgres_dev_data
EOL
        
        echo "✅ Fichier .env créé avec des valeurs sécurisées aléatoires"
        echo "📝 Mot de passe de base de données généré : ${RANDOM_PASSWORD}"
        echo "⚠️  Sauvegardez ce mot de passe dans un endroit sûr !"
    fi
fi

# Supprimer les fichiers .env locaux s'ils existent
if [ -f "backend/.env" ]; then
    echo "🧹 Suppression de backend/.env (utilisation du .env centralisé)"
    rm backend/.env
fi

if [ -f "frontend/.env" ]; then
    echo "🧹 Suppression de frontend/.env (utilisation du .env centralisé)"
    rm frontend/.env
fi

# Créer le fichier init.sql s'il n'existe pas
if [ ! -f "backend/init.sql" ]; then
    echo "-- Script d'initialisation pour TaskFlow" > backend/init.sql
    echo "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";" >> backend/init.sql
    echo "CREATE EXTENSION IF NOT EXISTS \"pg_trgm\";" >> backend/init.sql
    echo "SELECT 'Database TaskFlow initialized successfully!' as message;" >> backend/init.sql
    echo "✅ Fichier init.sql créé"
fi

# Donner les permissions d'exécution aux scripts
chmod +x scripts/*.sh

echo "✅ Configuration terminée !"
echo ""
echo "📋 Toutes les variables d'environnement sont maintenant centralisées dans le fichier .env à la racine"
echo "🔒 Le fichier .env contient des informations sensibles et ne doit PAS être committé sur Git"
echo ""
echo "Commandes disponibles :"
echo "  ./scripts/dev.sh     - Démarrer en mode développement"
echo "  ./scripts/prod.sh    - Démarrer en mode production"
echo "  ./scripts/stop.sh    - Arrêter tous les services"
echo "  ./scripts/clean.sh   - Nettoyer les containers et volumes"