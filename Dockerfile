FROM node:20-alpine
WORKDIR /app
RUN mkdir -p uploads
COPY package*.json ./
RUN npm install --omit=dev
COPY src/server ./src/server
EXPOSE 6011
CMD ["node", "src/server/index.js"]
