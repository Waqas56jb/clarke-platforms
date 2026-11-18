-- Profiles a member has passed on in dating discovery; they are left out of that member's discover results.
CREATE TABLE dating_passes (
  from_user INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  to_user INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (from_user, to_user),
  CHECK (from_user <> to_user)
);

CREATE INDEX dating_passes_to_user_idx ON dating_passes (to_user);
