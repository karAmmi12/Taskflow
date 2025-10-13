# TaskFlow avec Docker

## Prérequis

- Docker
- Docker Compose
- Make (optionnel)

## Installation et Configuration

### 1. Configuration initiale
```bash
# Donner les permissions aux scripts
chmod +x scripts/*.sh

# Ou utiliser Make
make setup
```

### 2. Démarrage en développement
```bash
# Avec les scripts
./scripts/dev.sh

# Ou avec Make
make dev
```

### 3. Démarrage en production
```bash
# Avec les scripts
./scripts/prod.sh

# Ou avec Make
make prod
```

## URLs d'accès

### Mode Développement
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- PostgreSQL: localhost:5432

### Mode Production
- Application: http://localhost
- Backend: http://localhost:5000
- PostgreSQL: localhost:5432

## Commandes utiles

```bash
# Arrêter tous les services
make stop

# Nettoyer containers et volumes
make clean

# Voir les logs
make logs

# Exécuter les migrations
make migrate

# Réinitialiser la base de données
make db-reset
```

## Développement

Pour développer avec hot-reload, utilisez le mode développement qui monte les volumes locaux dans les containers.

## Production

Le mode production utilise des images optimisées avec Nginx pour servir le frontend.