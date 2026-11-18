FROM node:22-slim
ENV NODE_ENV=production
WORKDIR /srv/app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && useradd --create-home --uid 10001 appuser
COPY src ./src
USER appuser
EXPOSE 3002
CMD ["node", "src/server.js"]
