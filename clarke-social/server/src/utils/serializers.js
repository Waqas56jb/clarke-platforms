const iso = (d) => (d instanceof Date ? d.toISOString() : d || null);

const toPublicUser = (row) =>
  row && {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    bio: row.bio,
    avatar: row.avatar,
    createdAt: iso(row.created_at),
  };

const toAccount = (row) =>
  row && { ...toPublicUser(row), email: row.email, emailVerified: row.email_verified, role: row.role };

const toPost = (p) => ({
  id: p.id,
  userId: p.user_id,
  username: p.username,
  displayName: p.display_name,
  avatar: p.avatar,
  body: p.body,
  feeling: p.feeling,
  mediaUrl: p.media_path,
  mediaType: p.media_type,
  allowDownload: p.allow_download,
  likes: p.likes,
  comments: p.comments,
  shares: p.shares,
  reposts: p.reposts,
  liked: p.liked,
  saved: p.saved,
  reposted: p.reposted,
  repostOf: p.repost_of,
  original: p.original_id
    ? {
        id: p.original_id,
        username: p.original_username,
        displayName: p.original_display_name,
        body: p.original_body,
        mediaUrl: p.original_media_path,
        mediaType: p.original_media_type,
      }
    : null,
  createdAt: iso(p.created_at),
});

module.exports = { iso, toPublicUser, toAccount, toPost };
