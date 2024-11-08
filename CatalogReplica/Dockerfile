FROM node:latest

WORKDIR  /catalog_replica


COPY  package.json package-lock.json ./

RUN npm install

COPY . .

EXPOSE 2001

CMD ["npm","start" ]