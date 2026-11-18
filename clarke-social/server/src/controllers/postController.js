const postService = require('../services/postService');

const postId = (req) => Number(req.params.id);

function list(req, res) {
  res.json({ posts: postService.listPosts(Number(req.query.viewer || 0)) });
}

function create(req, res) {
  res.status(201).json({ post: postService.createPost(req.user.sub, req.body.body, req.file, req.body.allowDownload) });
}

function like(req, res) {
  res.json(postService.toggleLike(req.user.sub, postId(req)));
}

function listComments(req, res) {
  res.json({ comments: postService.listComments(postId(req)) });
}

function addComment(req, res) {
  res.status(201).json({ comment: postService.addComment(req.user.sub, postId(req), req.body.body) });
}

function report(req, res) {
  postService.reportPost(req.user.sub, postId(req), req.body.reason);
  res.status(201).json({ ok: true, message: 'Thank you. Your report has been submitted for review.' });
}

function download(req, res) {
  res.download(postService.resolveDownload(req.user.sub, postId(req)));
}

module.exports = { list, create, like, listComments, addComment, report, download };
