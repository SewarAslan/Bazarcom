FROM node:latest

WORKDIR  /catalog_server


COPY  package.json package-lock.json ./

RUN npm install

COPY . .

EXPOSE 2001

CMD ["npm","start" ]