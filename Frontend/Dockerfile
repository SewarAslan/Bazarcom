FROM node:latest

WORKDIR  /frontend


COPY  package.json package-lock.json ./

RUN npm install

COPY . .

EXPOSE 2000

CMD ["npm","start" ]