# ========== Build stage ==========
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ========== Production stage ==========
FROM nginx:alpine

# Copy file build từ stage trước
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy cấu hình nginx cho SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]