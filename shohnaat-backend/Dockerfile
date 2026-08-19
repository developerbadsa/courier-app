FROM node:20-alpine

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 5000

# Generate Prisma client at startup (ensures correct binary for Alpine)
CMD ["sh", "-c", "npx prisma generate && npm run dev"]
