// Seeds realistic demo data for the clarke_demo account. Safe to run repeatedly: existing demo rows are
// found by natural keys and skipped. Every run also refreshes what goes stale: expired demo stories are
// replaced and clarke_demo's demo unread messages and newest notifications are marked unread again.
// Usage: npm run seed-demo            (DEMO_MEDIA_ORIGIN or RAILWAY_PUBLIC_DOMAIN sets dating photo URLs)
const { one, pool } = require('../src/db/pool');
const migrate = require('../src/db/migrate');
const { seedUsers } = require('./demo/seedUsers');
const { seedPosts, seedReactions, seedStories } = require('./demo/seedSocial');
const { seedDating, seedMessages, seedCalls } = require('./demo/seedConnections');
const { seedMusic, seedMovies } = require('./demo/seedMedia');
const { seedPayments, settleNotifications, freshenNotifications } = require('./demo/seedAccount');
const { markDemo, countDemo } = require('./demo/markDemo');
const { log } = require('./demo/context');

const DEMO_ACCOUNT = 'clarke_demo';

function mediaOrigin() {
  const origin =
    process.env.DEMO_MEDIA_ORIGIN ||
    (process.env.RAILWAY_PUBLIC_DOMAIN && `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`);
  if (origin && !origin.startsWith('https://')) return '';
  return (origin || '').replace(/\/$/, '');
}

async function main() {
  const runStart = new Date();
  await migrate();
  const clarke = await one('SELECT id, is_demo FROM users WHERE username=$1', [DEMO_ACCOUNT]);
  if (!clarke) throw new Error(`Create the ${DEMO_ACCOUNT} account on the site first; the seed fills it with data.`);

  const { members, byName } = await seedUsers(clarke);
  const posts = await seedPosts(members, clarke);
  await seedReactions(posts, members, clarke);
  await seedStories(members);
  if (!mediaOrigin()) log('no https media origin: dating profiles get no photo (set DEMO_MEDIA_ORIGIN)');
  await seedDating(members, byName, clarke, mediaOrigin());
  await seedMessages(byName, clarke);
  await seedCalls(byName, clarke);
  await seedMusic(byName, members, clarke);
  const movieIds = await seedMovies(byName, members, clarke);
  await seedPayments(clarke, movieIds[1]);
  await settleNotifications(runStart);
  await markDemo(clarke.id);
  await freshenNotifications(clarke);
  log('demo rows:', JSON.stringify(await countDemo()));
  log('done');
}

main()
  .catch((err) => {
    console.error('[demo] seed failed:', err.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
