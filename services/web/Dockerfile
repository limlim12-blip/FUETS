FROM node:20-alpine
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json ./
RUN npm install --legacy-peer-deps

COPY . .

CMD ["npx", "next", "dev"]
