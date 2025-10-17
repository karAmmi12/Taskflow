#!/bin/bash

echo "🔧 Correction finale LaTeX..."

# Arrêter les services
./scripts/stop.sh

# Nettoyer TOUS les fichiers de polices LaTeX
echo "🧹 Nettoyage complet des polices LaTeX..."
sudo rm -rf backend/storage/documents/*.600gf
sudo rm -rf backend/storage/documents/*.tfm
sudo rm -rf backend/storage/documents/*.log
sudo rm -rf backend/storage/documents/*.pk
sudo rm -rf backend/storage/documents/missfont.log

# Supprimer complètement l'image Docker backend
echo "🗑️ Suppression de l'image Docker backend..."
docker rmi taskflow_backend:latest 2>/dev/null || true
docker rmi taskflow-backend-dev 2>/dev/null || true

# Reconstruire complètement
echo "🔨 Reconstruction complète avec nouvelles polices..."
docker-compose -f docker-compose.dev.yml build --no-cache --pull backend

# Redémarrer
echo "🚀 Redémarrage..."
./scripts/dev.sh

echo "✅ Correction terminée ! L'IA ET LaTeX devraient maintenant fonctionner !"