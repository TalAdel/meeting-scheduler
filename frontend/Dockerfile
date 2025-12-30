FROM node:20-alpine
RUN apk add --no-cache bash
WORKDIR /app
COPY package*.json ./
RUN npm ci --quiet
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev"]