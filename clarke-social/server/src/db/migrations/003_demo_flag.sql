-- Marks rows created by scripts/seed-demo.js so scripts/remove-demo.js can delete exactly those rows.
-- Real members' rows always keep the default (false).
ALTER TABLE users ADD COLUMN is_demo BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE follows ADD COLUMN is_demo BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE posts ADD COLUMN is_demo BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE likes ADD COLUMN is_demo BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE comments ADD COLUMN is_demo BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE saved_posts ADD COLUMN is_demo BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE post_shares ADD COLUMN is_demo BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE stories ADD COLUMN is_demo BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE notifications ADD COLUMN is_demo BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE messages ADD COLUMN is_demo BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE payments ADD COLUMN is_demo BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE memberships ADD COLUMN is_demo BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE dating_profiles ADD COLUMN is_demo BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE dating_likes ADD COLUMN is_demo BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE call_history ADD COLUMN is_demo BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE tracks ADD COLUMN is_demo BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE track_likes ADD COLUMN is_demo BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE playlists ADD COLUMN is_demo BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE playlist_tracks ADD COLUMN is_demo BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE movies ADD COLUMN is_demo BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE movie_watchlist ADD COLUMN is_demo BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE movie_ratings ADD COLUMN is_demo BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE movie_rentals ADD COLUMN is_demo BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX users_is_demo_idx ON users (is_demo) WHERE is_demo;
