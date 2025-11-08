# Use Node 22 Alpine as base
FROM node:22-alpine

# Define build argument (for build-time use)
ARG MONGODB_URI

# Set environment variable (for runtime use)
ENV MONGODB_URI=${MONGODB_URI}

# Set working directory
WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy remaining source code
COPY . .

# Expose the backend port
EXPOSE 3001

# Start the app
CMD ["npm", "start"]
