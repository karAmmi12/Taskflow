-- Script d'initialisation pour TaskFlow
-- Ce fichier est exécuté lors de la première création de la base de données

-- Créer l'extension uuid-ossp si elle n'existe pas
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Créer l'extension pg_trgm pour la recherche full-text si elle n'existe pas  
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Message de confirmation
SELECT 'Database TaskFlow initialized successfully!' as message;