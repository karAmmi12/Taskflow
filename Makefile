include .env
export

.PHONY: help setup dev prod stop clean logs validate-env

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

build: ## Construire les images
	@docker-compose build

status: ## Afficher le statut des services
	@docker-compose ps

migrate: ## Exécuter les migrations
	@docker-compose exec backend npx prisma migrate deploy

db-reset: ## Réinitialiser la base de données
	@docker-compose exec backend npx prisma migrate reset --force