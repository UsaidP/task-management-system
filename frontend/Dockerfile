# --- Build Stage ---
FROM node:22-alpine as build

# Set working directory
WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install dependencies (including 'serve' if it's in package.json)
RUN npm install

# Copy remaining source code
COPY . .

# Build the frontend
RUN npm run build


# --- Production Stage (Optimized) ---
FROM node:22-alpine as production

WORKDIR /app

# Install 'serve' globally in this small production image
RUN npm install -g serve

ENV PATH="/frontend/.env"
# Copy ONLY the built files from the 'build' stage
COPY --from=build /app/dist ./dist

# Expose the port
EXPOSE 3000

# Start 'serve' and tell it to serve the 'dist' folder
# The '-s' flag is good for Single Page Applications (SPAs)
CMD ["serve", "-s", "dist", "-l", "3000"]