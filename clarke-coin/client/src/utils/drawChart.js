// Illustrative CC/GBP line chart from the original page; no market data is involved.
const VALUES = [
  0.75, 0.7, 0.72, 0.64, 0.68, 0.59, 0.62, 0.53, 0.56, 0.48, 0.51, 0.43, 0.47, 0.39, 0.42, 0.34, 0.38, 0.29, 0.32, 0.25,
  0.28, 0.2, 0.23, 0.17,
];

export function drawChart(canvas) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  ctx.strokeStyle = '#292e36';
  ctx.lineWidth = 1;
  for (let i = 1; i < 6; i++) {
    const y = (i * h) / 6;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  for (let i = 0; i < 10; i++) {
    const x = (i * w) / 10;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  ctx.beginPath();
  VALUES.forEach((v, i) => {
    const x = (i * w) / (VALUES.length - 1);
    const y = v * h;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = '#f4c44e';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#f4c44e44');
  g.addColorStop(1, '#f4c44e00');
  ctx.fillStyle = g;
  ctx.fill();
}
