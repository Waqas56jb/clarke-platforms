function health(_req, res) {
  res.json({
    status: 'ok',
    service: 'Clarke API',
    note: 'Starter deployment; calling requires client WebRTC integration and a TURN server.',
  });
}

module.exports = { health };
