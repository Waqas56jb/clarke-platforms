const env = require('./config/env');
const createApp = require('./app');

createApp().listen(env.port, () =>
  console.log(`World Stock Exchange demo API running at http://localhost:${env.port}`)
);
