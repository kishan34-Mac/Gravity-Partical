export class TrailRenderer {
  constructor(ctx) {
    this.ctx = ctx;
  }

  render(body) {
    if (body.trail.length < 2) return;

    const ctx = this.ctx;
    const len = body.trail.length;

    for (let i = 0; i < len - 1; i++) {
      const opacity = (1 - i / len) * 0.4;
      const width = Math.max(1, body.radius * 0.3 * (1 - i / len));

      ctx.beginPath();
      ctx.moveTo(body.trail[i].x, body.trail[i].y);
      ctx.lineTo(body.trail[i + 1].x, body.trail[i + 1].y);
      ctx.strokeStyle = this.hexToRgba(body.trailColor, opacity);
      ctx.lineWidth = width;
      ctx.lineCap = 'round';
      ctx.stroke();
    }
  }

  hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
}
