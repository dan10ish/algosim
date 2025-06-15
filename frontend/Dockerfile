# --- Stage 1: Build Stage ---
# Use a Node.js image (Alpine version for smaller size) as the build environment.
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package.json and lock files to install dependencies.
COPY package*.json ./

# Install dependencies.
RUN npm install

# Copy the rest of the application source code.
COPY . .

# The next.config.ts already includes output: 'export' for static export to work with Nginx

# Build the Next.js application for production. This creates static files in the 'out' directory.
RUN npm run build

# --- Stage 2: Production Stage ---
# Use a lightweight Nginx image to serve the static files.
FROM nginx:1.25-alpine

# Copy the built static files from the 'builder' stage's 'out' directory
# to the default Nginx web root directory.
COPY --from=builder /app/out /usr/share/nginx/html

# Expose port 80, the default port for Nginx.
EXPOSE 80

# The default command for the nginx image is to start the server.
# We specify it here explicitly to make it clear.
# '-g "daemon off;"' ensures Nginx runs in the foreground, which is required for Docker containers.
CMD ["nginx", "-g", "daemon off;"]