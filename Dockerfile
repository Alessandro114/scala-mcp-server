FROM node:20-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY dist/ dist/
ENV NODE_ENV=production
ENTRYPOINT ["node", "dist/index.js"]
