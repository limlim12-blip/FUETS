FROM node:20-alpine
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Chỉ copy package.json để cài deps trước
COPY package.json ./
RUN npm config set registry https://registry.npmmirror.com && npm install

# Copy toàn bộ code sau
COPY . .

# Chạy lệnh dev trực tiếp
CMD ["npx", "next", "dev"]
