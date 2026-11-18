const postService = require('../services/postService');
const { signScoped } = require('../utils/tokens');

const postId = (req) => Number(req.params.id);
const viewer = (req) => req.user?.id || 0;

async function list(req, res) {
  const { view, sort, userId } = req.query;
  if (view === 'saved' && !req.user) return res.status(401).json({ error: 'Please sign in.' });
  res.json({ posts: await postService.listPosts(viewer(req), { view, sort, userId: Number(userId) || null }) });
}

async function get(req, res) {
  res.json({ post: await postService.getPost(viewer(req), postId(req)) });
}

// Text-only posts and updates; posts with a photo or video go through /api/uploads/post.
async function create(req, res) {
  res.status(201).json({ post: await postService.createPost(req.user.id, req.body || {}, null) });
}

async function remove(req, res) {
  await postService.deletePost(req.user.id, postId(req));
  res.json({ ok: true });
}

async function like(req, res) {
  res.json(await postService.toggleLike(req.user.id, postId(req)));
}

async function save(req, res) {
  res.json(await postService.toggleSave(req.user.id, postId(req)));
}

async function share(req, res) {
  res.json(await postService.recordShare(viewer(req) || null, postId(req)));
}

async function repost(req, res) {
  res.json(await postService.toggleRepost(req.user.id, postId(req)));
}

async function listComments(req, res) {
  res.json({ comments: await postService.listComments(postId(req)) });
}

async function addComment(req, res) {
  res.status(201).json({ comment: await postService.addComment(req.user.id, postId(req), req.body?.body) });
}

async function report(req, res) {
  await postService.reportPost(req.user.id, postId(req), req.body?.reason);
  res.status(201).json({ ok: true, message: 'Thank you. Your report has been submitted for review.' });
}

// The download itself is served by /api/files/download/:token, which checks permission again.
async function downloadLink(req, res) {
  await postService.assertCanDownload(req.user.id, postId(req));
  res.json({ url: `/api/files/download/${signScoped(req.user.id, 'file', 120, { kind: 'post', id: postId(req) })}` });
}

module.exports = {
  list,
  get,
  create,
  remove,
  like,
  save,
  share,
  repost,
  listComments,
  addComment,
  report,
  downloadLink,
};
