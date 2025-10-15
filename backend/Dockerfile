FROM node:18-alpine

# Installer LaTeX
RUN apk add --no-cache \
    texlive \
    texlive-latex-extra \
    texlive-fonts-recommended \
    texlive-lang-french

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --only=production
RUN npx prisma generate

COPY . .

# Créer le dossier de stockage des documents
RUN mkdir -p ./storage/documents

EXPOSE 5000

CMD ["npm", "start"]