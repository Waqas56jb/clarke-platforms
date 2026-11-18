const http = require('http');
const env = require('./config/env');
const createApp = require('./app');
const createSocketServer = require('./sockets');
const migrate = require('./db/migrate');
const { deleteExpired } = require('./services/storyService');

const HOUR = 60 * 60 * 1000;

function cleanUpStories() {
  deleteExpired().catch((err) => console.error('Story clean-up failed', err.message));
}

async function start() {
  await migrate();
  const server = http.createServer(createApp());
  createSocketServer(server);
  cleanUpStories();
  setInterval(cleanUpStories, HOUR).unref();
  server.listen(env.port, () => console.log(`Clarke is running at http://localhost:${env.port}`));
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
