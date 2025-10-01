FROM node:18-alpine

WORKDIR /app

# Install server
COPY server ./server
WORKDIR /app/server
RUN npm install

# Install client (optional if you need build output served by server)
WORKDIR /app
COPY client ./client
WORKDIR /app/client
RUN npm install && npm run build

# Back to server
WORKDIR /app/server
CMD ["npm", "start"]
