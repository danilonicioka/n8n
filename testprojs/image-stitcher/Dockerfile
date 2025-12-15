# Use a lightweight Node.js base image
FROM node:24.12.0-trixie-slim

# Set environment variables
ENV NODE_ENV production
# Sharp often requires these packages for native module compilation
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libvips \
    pkg-config \
    python3 \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if present)
COPY package*.json ./

# Install dependencies (Sharp will compile here)
RUN npm install --omit=dev

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 4000

# Command to run the application
CMD [ "npm", "start" ]
