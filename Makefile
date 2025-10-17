include .env
export

.PHONY: help setup dev prod stop clean logs validate-env migrate db-reset

help: ## Afficher l'aide
	@echo "TaskFlow - Commandes disponibles:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

setup: ## Configuration initiale
	@./scripts/setup.sh

validate-env: ## Valider les variables d'environnement
	@./scripts/validate-env.sh

dev: ## Démarrer en mode développement
	@./scripts/dev.sh

prod: ## Démarrer en mode production
	@./scripts/prod.sh

stop: ## Arrêter tous les services
	@./scripts/stop.sh

clean: ## Nettoyer containers et volumes
	@./scripts/clean.sh

logs: ## Afficher les logs de production
	@docker-compose logs -f

logs-dev: ## Afficher les logs de développement
	@docker-compose -f docker-compose.dev.yml logs -f

migrate: ## Exécuter les migrations Prisma
	@echo "🔄 Exécution des migrations Prisma..."
	@docker-compose exec backend npx prisma migrate deploy

migrate-dev: ## Exécuter les migrations Prisma en mode dev
	@echo "🔄 Exécution des migrations Prisma (dev)..."
	@docker-compose -f docker-compose.dev.yml exec backend-dev npx prisma migrate dev

db-reset: ## Réinitialiser la base de données
	@echo "⚠️  ATTENTION: Cette action va supprimer toutes les données !"
	@read -p "Êtes-vous sûr ? (y/N): " confirm && [ "$$confirm" = "y" ]
	@docker-compose down
	@docker volume rm $(POSTGRES_VOLUME) 2>/dev/null || true
	@echo "✅ Base de données réinitialisée"

db-reset-dev: ## Réinitialiser la base de données (dev)
	@echo "⚠️  ATTENTION: Cette action va supprimer toutes les données de développement !"
	@read -p "Êtes-vous sûr ? (y/N): " confirm && [ "$$confirm" = "y" ]
	@docker-compose -f docker-compose.dev.yml down
	@docker volume rm $(POSTGRES_DEV_VOLUME) 2>/dev/null || true
	@echo "✅ Base de données de développement réinitialisée"

shell-backend: ## Accéder au shell du backend
	@docker-compose exec backend sh

shell-backend-dev: ## Accéder au shell du backend (dev)
	@docker-compose -f docker-compose.dev.yml exec backend-dev sh

shell-db: ## Accéder au shell PostgreSQL
	@docker-compose exec postgres psql -U $(POSTGRES_USER) -d $(POSTGRES_DB)

shell-db-dev: ## Accéder au shell PostgreSQL (dev)
	@docker-compose -f docker-compose.dev.yml exec postgres psql -U $(POSTGRES_USER) -d $(POSTGRES_DB)

ps: ## Voir les containers en cours
	@docker-compose ps

ps-dev: ## Voir les containers de dev en cours
	@docker-compose -f docker-compose.dev.yml ps

build: ## Reconstruire les images sans cache
	@docker-compose build --no-cache

build-dev: ## Reconstruire les images de dev sans cache
	@docker-compose -f docker-compose.dev.yml build --no-cache

restart: ## Redémarrer les services
	@docker-compose restart

restart-dev: ## Redémarrer les services de dev
	@docker-compose -f docker-compose.dev.yml restart