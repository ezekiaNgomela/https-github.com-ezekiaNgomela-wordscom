# Phase 26.1 - Production Deployment: Docker Container
# WordCom Full Stack Runtime Image

FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Build application (if applicable)
RUN npm run build || true

# Expose app port
EXPOSE 3000

# Environment
ENV NODE_ENV=production

# Start server
CMD ["npm", "run", "start"]
