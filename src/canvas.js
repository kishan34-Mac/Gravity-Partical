import { TrailRenderer } from './trails.js';
import { BlackHoleRenderer } from './blackhole.js';
import { BODY_TYPES } from './bodies.js';

export class CanvasRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.trailRenderer = new TrailRenderer(this.ctx);
    this.blackHoleRenderer = new BlackHoleRenderer(this.ctx);
    this.bgStars = [];
    this.showTrails = true;
    this.selectedBody = null;
    this.dragInfo = null;

    this.resize();
    this.generateBgStars();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.generateBgStars();
  }

  generateBgStars() {
    this.bgStars = [];
    const count = 200;
    for (let i = 0; i < count; i++) {
      this.bgStars.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: 1 + Math.random(),
        opacity: 0.2 + Math.random() * 0.5
      });
    }
  }

  clear() {
    this.ctx.fillStyle = 'rgba(4, 4, 14, 0.15)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  renderBgStars() {
    for (const star of this.bgStars) {
      this.ctx.beginPath();
      this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
      this.ctx.fill();
    }
  }

  renderBody(body) {
    const ctx = this.ctx;
    const x = body.x;
    const y = body.y;
    const r = body.radius;

    if (body.spaghettification) {
      this.renderSpaghettification(body);
      return;
    }

    ctx.save();

    if (body.flashFrames > 0) {
      body.flashFrames--;
      ctx.beginPath();
      ctx.arc(x, y, r * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fill();
    }

    if (body.type === BODY_TYPES.BLACK_HOLE) {
      this.blackHoleRenderer.render(body);
      ctx.restore();
      return;
    }

    ctx.globalCompositeOperation = 'lighter';

    if (body.glow) {
      ctx.shadowBlur = body.type === BODY_TYPES.STAR ? 20 : 6;
      ctx.shadowColor = body.glow;
    }

    if (body.type === BODY_TYPES.ASTEROID && body.vertices) {
      ctx.beginPath();
      body.vertices.forEach((v, i) => {
        const px = x + Math.cos(v.angle) * v.dist;
        const py = y + Math.sin(v.angle) * v.dist;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.closePath();
      ctx.fillStyle = body.color;
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);

      if (body.type === BODY_TYPES.STAR) {
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
        gradient.addColorStop(0, '#fde68a');
        gradient.addColorStop(0.5, '#f59e0b');
        gradient.addColorStop(1, '#b45309');
        ctx.fillStyle = gradient;
      } else {
        ctx.fillStyle = body.color;
      }
      ctx.fill();

      if (body.type === BODY_TYPES.PLANET) {
        ctx.beginPath();
        ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fill();
      }
    }

    if (body.type === BODY_TYPES.STAR) {
      for (let i = 1; i <= 3; i++) {
        ctx.beginPath();
        ctx.arc(x, y, r + i * 4, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(251, 191, 36, ${0.2 / i})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

    ctx.restore();

    if (this.showTrails) {
      this.trailRenderer.render(body);
    }
  }

  renderSpaghettification(body) {
    const ctx = this.ctx;
    const s = body.spaghettification;
    const bh = s.blackHole;
    const progress = s.currentFrame / s.frames;

    const dx = bh.x - body.x;
    const dy = bh.y - body.y;
    const angle = Math.atan2(dy, dx);

    ctx.save();
    ctx.translate(body.x, body.y);
    ctx.rotate(angle);

    const stretch = 1 + progress * 2;
    ctx.scale(stretch, 1 / stretch);

    ctx.beginPath();
    ctx.arc(0, 0, body.radius, 0, Math.PI * 2);
    ctx.fillStyle = body.color;
    ctx.fill();

    ctx.restore();

    s.currentFrame++;
    if (s.currentFrame >= s.frames) {
      body.spaghettification = null;
    }
  }

  renderSelection(body) {
    if (!body) return;
    const ctx = this.ctx;
    ctx.save();
    ctx.beginPath();
    ctx.arc(body.x, body.y, body.radius + 8, 0, Math.PI * 2);
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  renderDragArrow(info) {
    if (!info) return;
    const ctx = this.ctx;
    const { startX, startY, endX, endY } = info;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 2;
    ctx.stroke();

    const angle = Math.atan2(endY - startY, endX - startX);
    const arrowSize = 10;
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(
      endX - arrowSize * Math.cos(angle - Math.PI / 6),
      endY - arrowSize * Math.sin(angle - Math.PI / 6)
    );
    ctx.moveTo(endX, endY);
    ctx.lineTo(
      endX - arrowSize * Math.cos(angle + Math.PI / 6),
      endY - arrowSize * Math.sin(angle + Math.PI / 6)
    );
    ctx.stroke();
    ctx.restore();
  }

  render(bodies) {
    this.clear();

    if (!this.showTrails) {
      this.renderBgStars();
    }

    for (const body of bodies) {
      this.renderBody(body);
    }

    this.renderSelection(this.selectedBody);
    this.renderDragArrow(this.dragInfo);
  }
}
