// Tables from the Clarke Dating full-stack build, plus the encrypted-envelope "messages"
// table carried over from the Clarke Social starter.
module.exports = `
CREATE TABLE IF NOT EXISTS users (
 id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE NOT NULL, email TEXT UNIQUE NOT NULL,
 password_hash TEXT NOT NULL, display_name TEXT NOT NULL, bio TEXT DEFAULT '', avatar TEXT DEFAULT '',
 created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS posts (
 id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 body TEXT DEFAULT '', media_path TEXT DEFAULT '', media_type TEXT DEFAULT '', allow_download INTEGER DEFAULT 0,
 created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS likes (
 user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
 created_at TEXT DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY(user_id, post_id)
);
CREATE TABLE IF NOT EXISTS comments (
 id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE, body TEXT NOT NULL,
 created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS follows (
 follower_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 following_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 created_at TEXT DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY(follower_id, following_id), CHECK(follower_id != following_id)
);
CREATE TABLE IF NOT EXISTS reports (
 id INTEGER PRIMARY KEY AUTOINCREMENT, reporter_id INTEGER NOT NULL REFERENCES users(id),
 post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE, reason TEXT NOT NULL, created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS payments (
 id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 product_key TEXT NOT NULL, amount INTEGER NOT NULL, currency TEXT NOT NULL DEFAULT 'gbp',
 status TEXT NOT NULL DEFAULT 'pending', checkout_session_id TEXT UNIQUE, provider_payment_id TEXT,
 created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS dating_profiles (
 user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
 birth_date TEXT NOT NULL, gender TEXT NOT NULL DEFAULT '', interested_in TEXT NOT NULL DEFAULT '',
 location TEXT NOT NULL DEFAULT '', dating_bio TEXT NOT NULL DEFAULT '', interests TEXT NOT NULL DEFAULT '',
 photo_url TEXT NOT NULL DEFAULT '', updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS dating_likes (
 from_user INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 to_user INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 created_at TEXT DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY(from_user,to_user), CHECK(from_user != to_user)
);
CREATE TABLE IF NOT EXISTS dating_blocks (
 blocker_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 blocked_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 created_at TEXT DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY(blocker_id,blocked_id), CHECK(blocker_id != blocked_id)
);
CREATE TABLE IF NOT EXISTS dating_reports (
 id INTEGER PRIMARY KEY AUTOINCREMENT, reporter_id INTEGER NOT NULL REFERENCES users(id),
 reported_id INTEGER NOT NULL REFERENCES users(id), reason TEXT NOT NULL, created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS dating_subscriptions (
 user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
 plan_key TEXT NOT NULL, stripe_subscription_id TEXT UNIQUE, status TEXT NOT NULL DEFAULT 'inactive',
 current_period_end TEXT, updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS call_history (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 call_id TEXT NOT NULL UNIQUE,
 caller_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 callee_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 call_type TEXT NOT NULL CHECK(call_type IN ('audio','video')),
 status TEXT NOT NULL CHECK(status IN ('ringing','answered','declined','missed','ended','failed')),
 started_at TEXT DEFAULT CURRENT_TIMESTAMP,
 answered_at TEXT,
 ended_at TEXT
);
CREATE TABLE IF NOT EXISTS messages (
 id INTEGER PRIMARY KEY, sender_id INTEGER NOT NULL, recipient_id INTEGER NOT NULL,
 ciphertext TEXT NOT NULL, nonce TEXT NOT NULL, created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
`;
