# 1. Build
FROM node:18-alpine3.16
# Set working directory
WORKDIR /app
#
COPY package*.json /app/
# Same as npm install
RUN npm install
COPY . .
RUN npm run build
EXPOSE 5002
CMD [ "node", "dist/main.js" ]
