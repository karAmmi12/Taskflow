FROM node:18-alpine

# Installer UNIQUEMENT LaTeX de base avec polices essentielles
RUN apk add --no-cache \
    texlive \
    texmf-dist \
    texmf-dist-latexextra \
    fontconfig \
    && rm -rf /var/cache/apk/*

# Variables LaTeX simplifiées
ENV TEXMFCACHE=/app/texmf-cache

WORKDIR /app

# Créer le cache LaTeX dans l'app
RUN mkdir -p /app/texmf-cache && chmod 777 /app/texmf-cache

# Copier les dépendances
COPY package*.json ./
COPY prisma ./prisma/

# Installer et générer Prisma
RUN npm install --production
RUN npx prisma generate

# Créer le dossier documents
RUN mkdir -p ./storage/documents && chmod 755 ./storage/documents

# Copier le code source
COPY . .

EXPOSE 5000

CMD ["npm", "start"]