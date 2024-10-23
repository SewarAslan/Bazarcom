FROM node:latest

WORKDIR  /catalog_server


COPY  package.json package-lock.json ./

RUN npm install

COPY . .

EXPOSE 1001

CMD ["npm","start" ]