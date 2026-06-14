import { Body, BODY_TYPES } from './bodies.js';

export class Interaction {
  constructor(canvas, callbacks = {}) {
    this.canvas = canvas;
    this.callbacks = callbacks;
    this.selectedBody = null;
    this.hoveredBody = null;
    this.isDragging = false;
    this.dragStart = null;
    this.dragEnd = null;

    this.tooltip = document.createElement('div');
    this.tooltip.className = 'fixed bg-black/80 border border-white/10 rounded px-2 py-1 text-[10px] text-white/80 pointer-events-none z-50 hidden';
    document.body.appendChild(this.tooltip);

    this.attachEvents();
  }

  attachEvents() {
    this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
    this.canvas.addEventListener('mouseleave', this.onMouseLeave.bind(this));
    document.addEventListener('keydown', this.onKeyDown.bind(this));
    window.addEventListener('resize', this.onResize.bind(this));
  }

  onMouseDown(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const body = this.findBodyAt(x, y);
    if (body) {
      this.selectedBody = body;
      if (this.callbacks.onSelect) this.callbacks.onSelect(body);
    } else {
      this.isDragging = true;
      this.dragStart = { x, y };
      this.dragEnd = { x, y };
      this.selectedBody = null;
      if (this.callbacks.onSelect) this.callbacks.onSelect(null);
    }
  }

  onMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const body = this.findBodyAt(x, y);
    this.hoveredBody = body;

    if (body) {
      this.showTooltip(body, e.clientX, e.clientY);
    } else {
      this.hideTooltip();
    }

    if (this.isDragging) {
      this.dragEnd = { x, y };
      if (this.callbacks.onDragUpdate) {
        this.callbacks.onDragUpdate(this.dragStart, this.dragEnd);
      }
    }
  }

  onMouseUp(e) {
    if (!this.isDragging) return;

    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    this.dragEnd = { x, y };

    const velocityScale = 0.5;
    let vx = (this.dragStart.x - this.dragEnd.x) * velocityScale;
    let vy = (this.dragStart.y - this.dragEnd.y) * velocityScale;

    if (this.callbacks.onPlace) {
      this.callbacks.onPlace(this.dragStart.x, this.dragStart.y, vx, vy);
    }

    this.isDragging = false;
    this.dragStart = null;
    this.dragEnd = null;

    if (this.callbacks.onDragUpdate) {
      this.callbacks.onDragUpdate(null, null);
    }
  }

  onMouseLeave() {
    this.hideTooltip();
    if (this.isDragging) {
      this.isDragging = false;
      this.dragStart = null;
      this.dragEnd = null;
    }
  }

  onKeyDown(e) {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (this.selectedBody && this.callbacks.onDelete) {
        this.callbacks.onDelete(this.selectedBody);
        this.selectedBody = null;
      }
    }
  }

  onResize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    if (this.callbacks.onResize) this.callbacks.onResize();
  }

  findBodyAt(x, y) {
    if (!this.callbacks.getBodies) return null;
    const bodies = this.callbacks.getBodies();

    for (let i = bodies.length - 1; i >= 0; i--) {
      const body = bodies[i];
      const dx = body.x - x;
      const dy = body.y - y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= body.radius + 5) {
        return body;
      }
    }
    return null;
  }

  showTooltip(body, mouseX, mouseY) {
    this.tooltip.innerHTML = `
      <div class="font-medium">${body.type.replace('_', ' ')}</div>
      <div class="text-white/50">Mass: ${body.mass.toFixed(1)}</div>
      <div class="text-white/50">Speed: ${body.speed.toFixed(1)}</div>
    `;
    this.tooltip.style.left = `${mouseX + 15}px`;
    this.tooltip.style.top = `${mouseY + 15}px`;
    this.tooltip.classList.remove('hidden');
  }

  hideTooltip() {
    this.tooltip.classList.add('hidden');
  }

  getDragInfo() {
    if (!this.isDragging || !this.dragStart || !this.dragEnd) return null;
    return {
      startX: this.dragStart.x,
      startY: this.dragStart.y,
      endX: this.dragEnd.x,
      endY: this.dragEnd.y
    };
  }

  clearSelection() {
    this.selectedBody = null;
  }
}
