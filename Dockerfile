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

RUN npm run build

# --- runtime stage ---
FROM nginx:stable-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
