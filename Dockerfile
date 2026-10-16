# --- build stage ---
FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG VITE_API_URL
ARG VITE_API_KEY_YANDEX_MAP
ENV VITE_API_URL=$VITE_API_URL \
    VITE_API_KEY_YANDEX_MAP=$VITE_API_KEY_YANDEX_MAP

# Собираем только клиентскую часть; vite.config.ts кладёт её в dist/spa
RUN npm run build:client

# --- runtime stage ---
FROM nginx:stable-alpine

# Удаляем дефолтную страницу nginx, чтобы её нельзя было отдать случайно
RUN rm -rf /usr/share/nginx/html/*

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/spa /usr/share/nginx/html

EXPOSE 8080