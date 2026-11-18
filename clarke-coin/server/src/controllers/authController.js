const env = require('../config/env');
const userService = require('../services/userService');
const mfaService = require('../services/mfaService');
const { createAccessToken } = require('../utils/tokens');
const { validateRequiredString } = require('../utils/requestValidation');

async function register(req, res) {
  res.status(201).json(await userService.register(req.body));
}

async function login(req, res) {
  const user = await userService.authenticate(req.body);
  res.json({
    access_token: createAccessToken(user.id),
    token_type: 'bearer',
    expires_in_minutes: env.accessTokenMinutes,
  });
}

function me(req, res) {
  res.json(userService.toUserOut(req.user));
}

async function mfaSetup(req, res) {
  res.json(await mfaService.setup(req.user));
}

// The verification code is a query parameter, as in the original API (POST /auth/mfa/enable?code=123456).
async function mfaEnable(req, res) {
  const problem = validateRequiredString(req.query.code, ['query', 'code']);
  if (problem) return res.status(422).json({ detail: [problem] });
  res.json(await mfaService.enable(req.user, req.query.code));
}

module.exports = { register, login, me, mfaSetup, mfaEnable };
