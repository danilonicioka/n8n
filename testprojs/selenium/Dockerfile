# Start from a Node.js base image (includes npm)
FROM node:24.12.0-trixie-slim

# Set working directory
WORKDIR /usr/src/app

# --- 1. Install Chrome Dependencies ---
# These are the OS-level libraries required for Chrome/Chromium to run headlessly
RUN apt-get update && apt-get install -y \
    wget \
    unzip \
    libnss3 \
    libfontconfig1 \
    libgconf-2-4 \
    chromium \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# --- 2. Install ChromeDriver ---
# Get the latest ChromeDriver version compatible with the Chromium installed above
# NOTE: If your installed 'chromium' is a different version, you may need to adjust this.
RUN apt-get install -y chromium-driver \
    && ln -s /usr/lib/chromium/chromedriver /usr/local/bin/chromedriver

# --- 3. Install Node.js Dependencies ---
COPY package*.json ./
RUN npm install

# --- 4. Copy Application Files ---
COPY . .

# --- 5. Final Configuration ---
EXPOSE 3000
# IMPORTANT: Tell Selenium to use the correct browser binary location
ENV CHROME_BIN=/usr/bin/chromium

# The new run command
CMD [ "npm", "start" ]