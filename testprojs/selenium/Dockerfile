# Start from a base image that includes Node.js and the necessary browser/driver.
# The 'selenium/node-chrome' or 'selenium/standalone-chrome' images are ideal.
# Using 'standalone' for a simpler, all-in-one setup for a single script.

FROM selenium/standalone-chrome:latest

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if any)
COPY package*.json ./

# Install application dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose the port where your Express server is listening
EXPOSE 3000

# Command to run the application
# We use 'npm start', which executes 'node server.js'
CMD [ "npm", "start" ]