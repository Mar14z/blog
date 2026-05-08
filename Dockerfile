FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache tini

USER node

COPY package*.json ./
RUN npm ci --only=production

COPY --chown=node:node . .

RUN mkdir -p uploads && chmod 755 uploads

EXPOSE 3000

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "server/app.js"]
