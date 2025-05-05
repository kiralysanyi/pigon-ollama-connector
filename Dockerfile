# Use an official Node.js runtime as a parent image
FROM node:23

# Set the working directory in the container
WORKDIR /

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy the rest of the project files
COPY . .

# Expose the application's port (change if needed)
#EXPOSE 3000

# Command to run the app
CMD ["node", "index.js"]
