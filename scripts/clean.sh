#!/bin/bash
# filepath: scripts/clean.sh

echo "🧹 Nettoyage de TaskFlow..."

# Arrêter tous les services
./scripts/stop.sh

# Supprimer les containers
docker-compose down --remove-orphans
docker-compose -f docker-compose.dev.yml down --remove-orphans

# Supprimer les images TaskFlow
docker rmi $(docker images | grep taskflow | awk '{print $3}') 2>/dev/null

# Supprimer les volumes (ATTENTION: ceci supprimera les données)
read -p "Voulez-vous supprimer les données de la base de données ? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker volume rm $(docker volume ls | grep taskflow | awk '{print $2}') 2>/dev/null
    echo "🗑️  Volumes supprimés"
fi

# Nettoyer le système Docker
docker system prune -f

echo "✅ Nettoyage terminé !"