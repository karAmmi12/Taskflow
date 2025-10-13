# Sécurité - TaskFlow

## Variables d'environnement

⚠️ **ATTENTION** : Ne jamais committer le fichier `.env` sur Git !

### Configuration sécurisée

1. Copiez `.env.example` vers `.env`
2. Modifiez les valeurs sensibles :
   - `POSTGRES_PASSWORD` : Utilisez un mot de passe fort
   - `JWT_SECRET` : Générez un secret sécurisé
3. Le fichier `.env` est automatiquement ignoré par Git

### Génération de secrets sécurisés

```bash
# Générer un JWT secret
openssl rand -base64 64

# Générer un mot de passe
openssl rand -base64 32 | tr -d "=+/" | cut -c1-16
```

## Bonnes pratiques

- ✅ Utilisez des mots de passe forts
- ✅ Changez les secrets par défaut
- ✅ Ne partagez jamais vos fichiers `.env`
- ❌ Ne committez jamais de secrets sur Git