# ============================================================
# Shohnaat Dedicated Media & Storage Microservice Dockerfile
# ============================================================
FROM node:20-alpine AS runner

WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

# Create persistent storage directories
RUN mkdir -p /app/uploads/kyc /app/uploads/pod /app/uploads/parcels /app/uploads/avatars /app/uploads/general

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

CMD ["node", "src/app.js"]
