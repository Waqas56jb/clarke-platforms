// Uploads go straight to the API host (the website proxy caps request bodies at 4.5 MB). The browser
// first fetches a short-lived upload token through the website, then sends the file with it.
const { signScoped } = require('../utils/tokens');
const postService = require('../services/postService');
const storyService = require('../services/storyService');
const musicService = require('../services/musicService');
const movieService = require('../services/movieService');
const userService = require('../services/userService');
const { toAccount } = require('../utils/serializers');

function token(req, res) {
  res.json({ token: signScoped(req.user.id, 'upload', 15 * 60) });
}

async function post(req, res) {
  res.status(201).json({ post: await postService.createPost(req.user.id, req.body, req.uploads.media) });
}

async function story(req, res) {
  res.status(201).json({ story: await storyService.create(req.user.id, req.body.caption, req.uploads.media) });
}

async function avatar(req, res) {
  res.json({ user: toAccount(await userService.setAvatar(req.user, req.uploads.avatar)) });
}

async function track(req, res) {
  res.status(201).json({ track: await musicService.create(req.user.id, req.body, req.uploads) });
}

async function movie(req, res) {
  res.status(201).json({ movie: await movieService.create(req.user.id, req.body, req.uploads) });
}

module.exports = { token, post, story, avatar, track, movie };
