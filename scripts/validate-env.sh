#!/bin/bash
# filepath: scripts/validate-env.sh

echo "🔍 Validation des variables d'environnement..."

# Charger les variables d'environnement
if [ -f ".env" ]; then
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "❌ Fichier .env non trouvé !"
    exit 1
fi

# Variables requises
REQUIRED_VARS=(
    "NODE_ENV"
    "BACKEND_PORT"
    "JWT_SECRET" 
    "POSTGRES_USER"
    "POSTGRES_PASSWORD"
    "POSTGRES_DB"
    "FRONTEND_PORT"
    "VITE_API_URL"
    "NETWORK_NAME"
)

# Vérifier chaque variable
missing_vars=()
for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -eq 0 ]; then
    echo "✅ Toutes les variables d'environnement requises sont définies"
    echo ""
    echo "📋 Configuration actuelle :"
    echo "   NODE_ENV: $NODE_ENV"
    echo "   BACKEND_PORT: $BACKEND_PORT"
    echo "   POSTGRES_DB: $POSTGRES_DB"
    echo "   FRONTEND_PORT: $FRONTEND_PORT"
    echo "   NETWORK_NAME: $NETWORK_NAME"
    echo ""
else
    echo "❌ Variables d'environnement manquantes :"
    for var in "${missing_vars[@]}"; do
        echo "   - $var"
    done
    echo ""
    echo "📝 Vérifiez votre fichier .env"
    exit 1
fi