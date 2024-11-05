FROM node:latest

WORKDIR  /order_server


COPY  package.json package-lock.json ./

RUN npm install

COPY . .

EXPOSE 2002

CMD ["npm","start" ]