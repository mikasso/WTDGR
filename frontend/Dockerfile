FROM node:lts-alpine
RUN npm install -g http-server
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ENV ENV_NODE=production
RUN npm run build
EXPOSE 8080
CMD [ "http-server", "dist" ]