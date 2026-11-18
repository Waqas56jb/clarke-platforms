const safeUser = (row) =>
  row && {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    bio: row.bio,
    avatar: row.avatar,
    createdAt: row.created_at,
  };

const toPost = (p) => ({
  id: p.id,
  userId: p.user_id,
  username: p.username,
  displayName: p.display_name,
  avatar: p.avatar,
  body: p.body,
  mediaUrl: p.media_path,
  mediaType: p.media_type,
  allowDownload: !!p.allow_download,
  likes: p.likes,
  comments: p.comments,
  liked: !!p.liked,
  createdAt: p.created_at,
});

module.exports = { safeUser, toPost };
