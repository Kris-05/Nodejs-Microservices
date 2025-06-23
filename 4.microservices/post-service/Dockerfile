# Use official Node.js image with alpine linux as the base image
FROM node:18-alpine

# Set working directory
WORKDIR /use/src/app

# Copy package files
COPY package*.json ./

# Install dependencies (not include dev-dependencies)
RUN npm ci --only=production

# Copy application code to the working dir
COPY . .

# Expose the app port
EXPOSE 3002

# Start the app
CMD [ "node", "src/server.js" ]