FROM node:20-alpine

WORKDIR /app

# Install only production dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy source needed for backend build
COPY backend/ ./backend/
COPY tsconfig.json ./

# Build only the backend bundle
RUN npm run build:backend

EXPOSE 9108
CMD ["node", "dist/server.mjs"]
