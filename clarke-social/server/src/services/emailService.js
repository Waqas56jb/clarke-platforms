// Transactional email through Resend (https://resend.com/docs/api-reference/emails/send-email).
const env = require('../config/env');
const HttpError = require('../utils/httpError');

const isEmailConfigured = () => Boolean(env.email.resendApiKey && env.email.from);

const NOT_CONFIGURED =
  'Email sending is not configured yet, so this email cannot be sent. Please contact Clarke support.';

async function sendEmail({ to, subject, text }) {
  if (!isEmailConfigured()) throw new HttpError(503, NOT_CONFIGURED, 'EMAIL_NOT_CONFIGURED');
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.email.resendApiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: env.email.from, to: [to], subject, text }),
  });
  if (!response.ok) {
    console.error('Resend email failed', response.status, await response.text());
    throw new HttpError(502, 'We could not send the email right now. Please try again later.');
  }
}

module.exports = { isEmailConfigured, sendEmail, NOT_CONFIGURED };
