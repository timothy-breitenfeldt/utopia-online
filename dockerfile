FROM node:12.16.1
ENV NODE_ENV=production
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package.json ./
RUN npm install --only=production
COPY . .
EXPOSE 9090
CMD ["npm", "start"]