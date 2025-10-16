# --- Stage 1: Base build image ---
FROM node:20-alpine

# Set working directory inside the container
WORKDIR /app

# Copy dependency files first (for build cache)
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy the rest of the application
COPY . .

# Expose the backend port (adjust if needed)
EXPOSE 5000

# Set environment to production
ENV NODE_ENV=production

# Start the server
CMD ["node", "server.js"]
