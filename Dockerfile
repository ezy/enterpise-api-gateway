FROM node:13-alpine

ARG ENV=production
ENV NODE_ENV ${ENV}

COPY package*.json ./

RUN npm install
RUN node -v

COPY . .

EXPOSE 8081
CMD npm start
