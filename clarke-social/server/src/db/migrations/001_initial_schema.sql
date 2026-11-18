-- Clarke Social PostgreSQL schema. Carries over every SQLite table, key, constraint and index from the
-- Dating build, with Postgres types, plus the tables needed for live messaging, stories, music and movies.

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  display_name TEXT NOT NULL,
  bio TEXT NOT NULL DEFAULT '',
  avatar TEXT NOT NULL DEFAULT '',
  -- Kept for a future admin panel; every account is a member until then.
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'admin')),
  email_verified BOOLEAN NOT NULL DEFAULT false,
  -- Incremented on password reset so older sessions stop working.
  token_version INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE email_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  purpose TEXT NOT NULL CHECK (purpose IN ('verify', 'reset')),
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX email_tokens_user_idx ON email_tokens (user_id, purpose);

CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  body TEXT NOT NULL DEFAULT '',
  feeling TEXT NOT NULL DEFAULT '',
  media_path TEXT NOT NULL DEFAULT '',
  media_type TEXT NOT NULL DEFAULT '',
  allow_download BOOLEAN NOT NULL DEFAULT false,
  repost_of INTEGER REFERENCES posts (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX posts_user_idx ON posts (user_id);
CREATE INDEX posts_created_idx ON posts (created_at DESC);

CREATE TABLE likes (
  user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  post_id INTEGER NOT NULL REFERENCES posts (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, post_id)
);
CREATE INDEX likes_post_idx ON likes (post_id);

CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  post_id INTEGER NOT NULL REFERENCES posts (id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX comments_post_idx ON comments (post_id);

CREATE TABLE saved_posts (
  user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  post_id INTEGER NOT NULL REFERENCES posts (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, post_id)
);

CREATE TABLE post_shares (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users (id) ON DELETE SET NULL,
  post_id INTEGER NOT NULL REFERENCES posts (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX post_shares_post_idx ON post_shares (post_id);

CREATE TABLE follows (
  follower_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  following_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id <> following_id)
);
CREATE INDEX follows_following_idx ON follows (following_id);

-- Reports are only stored; reviewing them belongs to the future admin panel.
CREATE TABLE reports (
  id SERIAL PRIMARY KEY,
  reporter_id INTEGER REFERENCES users (id) ON DELETE SET NULL,
  post_id INTEGER REFERENCES posts (id) ON DELETE CASCADE,
  target_type TEXT NOT NULL DEFAULT 'post' CHECK (target_type IN ('post', 'story', 'track', 'movie', 'user')),
  target_id INTEGER,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE stories (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  media_path TEXT NOT NULL,
  media_type TEXT NOT NULL,
  caption TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX stories_expiry_idx ON stories (expires_at);

CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  actor_id INTEGER REFERENCES users (id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('follow', 'like', 'comment', 'match', 'message')),
  entity_id INTEGER,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX notifications_user_idx ON notifications (user_id, created_at DESC);

-- One-to-one messages. Stored as plain text on the server: this is NOT end-to-end encrypted.
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  sender_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  recipient_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (sender_id <> recipient_id)
);
CREATE INDEX messages_pair_idx ON messages (LEAST(sender_id, recipient_id), GREATEST(sender_id, recipient_id), id);
CREATE INDEX messages_unread_idx ON messages (recipient_id) WHERE read_at IS NULL;

-- Payments go through WiPay hosted checkout; card details never reach Clarke.
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  product_key TEXT NOT NULL,
  movie_id INTEGER,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'cancelled')),
  order_id TEXT NOT NULL UNIQUE,
  provider_payment_id TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at TIMESTAMPTZ
);
CREATE INDEX payments_user_idx ON payments (user_id, id DESC);

-- Plan access bought through WiPay. WiPay has no recurring billing, so each payment adds 30 days.
CREATE TABLE memberships (
  user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  plan_key TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, plan_key)
);

CREATE TABLE dating_profiles (
  user_id INTEGER PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
  birth_date DATE NOT NULL,
  gender TEXT NOT NULL DEFAULT '',
  interested_in TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  dating_bio TEXT NOT NULL DEFAULT '',
  interests TEXT NOT NULL DEFAULT '',
  photo_url TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE dating_likes (
  from_user INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  to_user INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (from_user, to_user),
  CHECK (from_user <> to_user)
);

-- Blocks apply everywhere: dating discovery, messaging and calls.
CREATE TABLE dating_blocks (
  blocker_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  blocked_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (blocker_id, blocked_id),
  CHECK (blocker_id <> blocked_id)
);

CREATE TABLE dating_reports (
  id SERIAL PRIMARY KEY,
  reporter_id INTEGER REFERENCES users (id) ON DELETE SET NULL,
  reported_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE call_history (
  id SERIAL PRIMARY KEY,
  call_id TEXT NOT NULL UNIQUE,
  caller_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  callee_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  call_type TEXT NOT NULL CHECK (call_type IN ('audio', 'video')),
  status TEXT NOT NULL CHECK (status IN ('ringing', 'answered', 'declined', 'missed', 'ended', 'failed')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  answered_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ
);

CREATE TABLE tracks (
  id SERIAL PRIMARY KEY,
  owner_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  rights_category TEXT NOT NULL CHECK (rights_category IN ('original', 'licensed')),
  audio_path TEXT NOT NULL,
  audio_type TEXT NOT NULL,
  proof_path TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE track_likes (
  user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  track_id INTEGER NOT NULL REFERENCES tracks (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, track_id)
);

CREATE TABLE playlists (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE playlist_tracks (
  playlist_id INTEGER NOT NULL REFERENCES playlists (id) ON DELETE CASCADE,
  track_id INTEGER NOT NULL REFERENCES tracks (id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (playlist_id, track_id)
);

CREATE TABLE movies (
  id SERIAL PRIMARY KEY,
  owner_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  genre TEXT NOT NULL CHECK (genre IN ('Action', 'Comedy', 'Drama', 'Documentary', 'Family', 'Sci-Fi')),
  access TEXT NOT NULL CHECK (access IN ('free', 'rent', 'original')),
  label TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  price_cents INTEGER NOT NULL DEFAULT 0 CHECK (price_cents >= 0),
  poster_path TEXT NOT NULL DEFAULT '',
  trailer_path TEXT NOT NULL DEFAULT '',
  trailer_type TEXT NOT NULL DEFAULT '',
  video_path TEXT NOT NULL,
  video_type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE movie_watchlist (
  user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  movie_id INTEGER NOT NULL REFERENCES movies (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, movie_id)
);

CREATE TABLE movie_ratings (
  user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  movie_id INTEGER NOT NULL REFERENCES movies (id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score BETWEEN 1 AND 10),
  PRIMARY KEY (user_id, movie_id)
);

CREATE TABLE movie_rentals (
  user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  movie_id INTEGER NOT NULL REFERENCES movies (id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (user_id, movie_id)
);
