# Use Node.js base image
FROM node:16

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json ./
RUN npm install

# Copy the rest of the frontend code
COPY . .

# Expose React port
EXPOSE 3000

# Run React app
CMD ["npm", "start"]