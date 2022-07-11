FROM node:16
WORKDIR /usr/src/app
COPY . .
RUN npm install
USER node
CMD npm run start