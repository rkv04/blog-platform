FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY drizzle.config.ts run.sh seed.sql ./
RUN chmod +x run.sh

EXPOSE 3000

CMD ["sh", "run.sh"]