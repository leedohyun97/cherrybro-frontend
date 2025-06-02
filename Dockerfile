# 1. Node.js 환경에서 빌드
FROM node:18 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# 2. 빌드된 정적 파일을 서빙할 환경 설정 (serve 사용)
FROM node:18 AS production

WORKDIR /app

RUN npm install -g serve

COPY --from=build /app/build ./build

EXPOSE 3000
CMD ["serve", "-s", "build", "-l", "80"]
