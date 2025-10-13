#!/bin/bash
# filepath: scripts/generate-secrets.sh

echo "🔐 Génération de secrets sécurisés pour TaskFlow"

# Vérifier si openssl est disponible
if ! command -v openssl &> /dev/null; then
    echo "❌ OpenSSL n'est pas installé. Utilisation de /dev/urandom"
    JWT_SECRET=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 64 | head -n 1)
    POSTGRES_PASSWORD=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 16 | head -n 1)
else
    JWT_SECRET=$(openssl rand -base64 64 | tr -d "=+/")
    POSTGRES_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-16)
fi

echo ""
echo "🔑 Secrets générés :"
echo "JWT_SECRET=${JWT_SECRET}"
echo "POSTGRES_PASSWORD=${POSTGRES_PASSWORD}"
echo ""
echo "📋 Copiez ces valeurs dans votre fichier .env"
echo "⚠️  Ne partagez jamais ces secrets !"