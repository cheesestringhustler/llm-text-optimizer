# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install

COPY . .

RUN yarn build

RUN test -d .next

EXPOSE 3000

CMD ["yarn", "start"]
