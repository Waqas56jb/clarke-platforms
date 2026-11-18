const Database = require('better-sqlite3');
const env = require('../config/env');
const schema = require('./schema');

const db = new Database(env.dbFile);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.exec(schema);

module.exports = db;
