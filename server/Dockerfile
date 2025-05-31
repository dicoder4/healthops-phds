# server/Dockerfile

FROM node:18

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Expose API port
EXPOSE 4000

# Start server
CMD ["npm", "start"]
