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

# Configuration automatique
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
- Application: http://localhost:8080
- Backend: http://localhost:5000
- PostgreSQL: localhost:5432

## Commandes utiles

### Gestion des services
```bash
# Arrêter tous les services
make stop

# Nettoyer containers et volumes
make clean

# Voir les logs
make logs          # Production
make logs-dev      # Développement

# Voir l'état des containers
make ps            # Production
make ps-dev        # Développement

# Redémarrer les services
make restart       # Production
make restart-dev   # Développement
```

### Base de données
```bash
# Exécuter les migrations
make migrate       # Production
make migrate-dev   # Développement

# Accéder au shell PostgreSQL
make shell-db      # Production
make shell-db-dev  # Développement

# Réinitialiser la base de données (⚠️ SUPPRIME TOUTES LES DONNÉES)
make db-reset      # Production
make db-reset-dev  # Développement
```

### Développement et debugging
```bash
# Accéder au shell du backend
make shell-backend     # Production
make shell-backend-dev # Développement

# Reconstruire les images sans cache
make build         # Production
make build-dev     # Développement

# Valider les variables d'environnement
make validate-env
```

## Structure des volumes

### Développement
- Code source monté en volumes pour hot-reload
- Base de données persistante : `taskflow_postgres_dev_data`

### Production
- Images optimisées
- Base de données persistante : `taskflow_postgres_data`

## Dépannage

### 1. Problèmes de permissions
```bash
# Donner les permissions aux scripts
chmod +x scripts/*.sh
```

### 2. Port déjà utilisé
```bash
# Vérifier les ports utilisés
netstat -tulpn | grep -E ':(5000|5173|5432)'

# Modifier les ports dans .env si nécessaire
```

### 3. Problèmes de base de données
```bash
# Vérifier l'état de la base
make shell-db

# En cas de corruption, réinitialiser
make db-reset
```

### 4. Images corrompues
```bash
# Reconstruire complètement
make clean
make build
```

### 5. Problèmes de réseau Docker
```bash
# Nettoyer les réseaux Docker
docker network prune

# Redémarrer Docker (sur certains systèmes)
sudo systemctl restart docker
```

## Variables d'environnement importantes

Consultez le fichier `.env.example` pour voir toutes les variables configurables :

- `BACKEND_PORT` : Port du backend (défaut: 5000)
- `FRONTEND_PORT` : Port du frontend en dev (défaut: 5173)
- `POSTGRES_PASSWORD` : Mot de passe de la base de données
- `JWT_SECRET` : Secret pour l'authentification JWT
- `HUGGINGFACE_API_KEY` : Clé API pour l'IA (optionnel)

## Développement

Pour développer efficacement :

1. Utilisez le mode développement : `make dev`
2. Les modifications de code sont reflétées automatiquement
3. Utilisez `make logs-dev` pour surveiller les logs
4. Accédez au shell avec `make shell-backend-dev` si nécessaire

## Production

Pour déployer en production :

1. Configurez toutes les variables d'environnement
2. Utilisez des mots de passe sécurisés
3. Lancez avec `make prod`
4. Surveillez avec `make logs`
5. Sauvegardez régulièrement la base de données