const http = require('http');
const env = require('./config/env');
const createApp = require('./app');
const createSocketServer = require('./sockets');

const app = createApp();
const server = http.createServer(app);
app.set('io', createSocketServer(server));

server.listen(env.port, () => console.log(`Clarke is running at http://localhost:${env.port}`));
