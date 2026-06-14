export class BlackHoleRenderer {
  constructor(ctx) {
    this.ctx = ctx;
  }

  render(body) {
    const ctx = this.ctx;
    const x = body.x;
    const y = body.y;
    const r = body.radius;

    ctx.save();

    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = '#080808';
    ctx.fill();

    ctx.shadowBlur = 30;
    ctx.shadowColor = 'rgba(129, 140, 248, 0.8)';
    ctx.beginPath();
    ctx.arc(x, y, r + 2, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(129, 140, 248, 0.6)';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.shadowBlur = 0;
    body.accretionAngle += 0.03;
    for (let i = 0; i < 3; i++) {
      const angle = body.accretionAngle + (i * Math.PI * 2 / 3);
      for (let j = 0; j < 0.4; j += 0.05) {
        const dist = r + 5 + j * 20;
        const px = x + Math.cos(angle + j * 2) * dist * 1.5;
        const py = y + Math.sin(angle + j * 2) * dist * 0.4;
        ctx.beginPath();
        ctx.arc(px, py, 1 + j, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(167, 139, 250, ${0.5 - j})`;
        ctx.fill();
      }
    }

    ctx.beginPath();
    ctx.arc(x, y, r + 8, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  }

  checkConsumption(blackHole, body) {
    const dx = blackHole.x - body.x;
    const dy = blackHole.y - body.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return dist < blackHole.radius * 3;
  }

  startSpaghettification(body, blackHole) {
    body.spaghettification = {
      blackHole,
      frames: 20,
      currentFrame: 0
    };
  }
}
