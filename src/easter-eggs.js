export class EasterEggs {
  constructor() {
    this.keySequence = [];
    this.rainbowMode = false;
    this.rainbowTimeout = null;
    this.typeBuffer = '';
    this.typeTimeout = null;
    this.konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    this.lagrangeTimer = null;
  }

  checkKeyDown(key, bodies, callbacks) {
    if (key.length === 1) {
      clearTimeout(this.typeTimeout);
      this.typeBuffer += key.toLowerCase();
      this.typeTimeout = setTimeout(() => {
        this.typeBuffer = '';
      }, 1500);
    }

    if (this.typeBuffer.includes('supernova')) {
      this.triggerSupernova(bodies, callbacks);
      this.typeBuffer = '';
      return;
    }

    if (this.typeBuffer.includes('bigbang')) {
      this.triggerBigBang(callbacks);
      this.typeBuffer = '';
      return;
    }

    if (key !== 'ArrowUp' && key !== 'ArrowDown' && key !== 'ArrowLeft' && key !== 'ArrowRight' && key !== 'b' && key !== 'a') {
      this.keySequence = [];
      return;
    }

    this.keySequence.push(key);
    if (this.keySequence.length > this.konamiCode.length) {
      this.keySequence.shift();
    }

    if (this.keySequence.join(',') === this.konamiCode.join(',')) {
      this.triggerRainbow(bodies, callbacks);
      this.keySequence = [];
    }
  }

  checkLagrange(bodies, callbacks) {
    if (bodies.length !== 3) {
      clearTimeout(this.lagrangeTimer);
      this.lagrangeTimer = null;
      return;
    }

    if (!this.lagrangeTimer) {
      this.lagrangeTimer = setTimeout(() => {
        this.triggerLagrange(bodies, callbacks);
        this.lagrangeTimer = null;
      }, 3000);
    }
  }

  triggerSupernova(bodies, callbacks) {
    const selected = callbacks.getSelected?.();
    const star = selected?.type === 'star' ? selected : bodies.find(b => b.type === 'star');
    if (!star) return;

    const cx = star.x;
    const cy = star.y;

    if (callbacks.onRemove) callbacks.onRemove(star);

    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2;
      const speed = 3 + Math.random() * 2;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;

      if (callbacks.onAdd) {
        callbacks.onAdd('asteroid', cx, cy, vx, vy);
      }
    }
  }

  triggerBigBang(callbacks) {
    if (callbacks.onClear) callbacks.onClear();

    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;

    for (let i = 0; i < 50; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 3;
      const dist = Math.random() * 50;
      const x = cx + Math.cos(angle) * dist;
      const y = cy + Math.sin(angle) * dist;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;

      const types = ['star', 'planet', 'moon', 'asteroid'];
      const type = types[Math.floor(Math.random() * types.length)];

      if (callbacks.onAdd) callbacks.onAdd(type, x, y, vx, vy);
    }
  }

  triggerLagrange(bodies, callbacks) {
    if (bodies.length !== 3) return;

    const G = callbacks.getG?.() ?? 6.67;
    const cx = bodies.reduce((s, b) => s + b.x * b.mass, 0) / bodies.reduce((s, b) => s + b.mass, 0);
    const cy = bodies.reduce((s, b) => s + b.y * b.mass, 0) / bodies.reduce((s, b) => s + b.mass, 0);

    bodies.forEach((body, i) => {
      const angle = (i / 3) * Math.PI * 2 - Math.PI / 2;
      const dist = Math.sqrt(G * 100);
      body.x = cx + Math.cos(angle) * dist;
      body.y = cy + Math.sin(angle) * dist;

      const vOrbit = Math.sqrt(G * body.mass * 2 / dist) * 0.3;
      body.vx = -Math.sin(angle) * vOrbit;
      body.vy = Math.cos(angle) * vOrbit;
    });
  }

  triggerRainbow(bodies, callbacks) {
    this.rainbowMode = true;

    const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#8b5cf6', '#ec4899'];
    let colorIndex = 0;

    const cycleColors = () => {
      bodies.forEach(body => {
        body.trailColor = colors[colorIndex % colors.length];
      });
      colorIndex++;

      if (this.rainbowMode && colorIndex < 60) {
        requestAnimationFrame(cycleColors);
      } else {
        bodies.forEach(body => {
          body.trailColor = body.color;
        });
        this.rainbowMode = false;
      }
    };

    cycleColors();
  }

  triggerHawking(blackHole, callbacks) {
    let frames = 0;
    const emit = () => {
      if (frames++ > 50) {
        if (callbacks.onRemove) callbacks.onRemove(blackHole);
        return;
      }

      blackHole.mass -= blackHole.mass * 0.02;
      blackHole.radius = Math.cbrt(blackHole.mass) * 1.5;

      const angle = Math.random() * Math.PI * 2;
      const x = blackHole.x + Math.cos(angle) * (blackHole.radius + 10);
      const y = blackHole.y + Math.sin(angle) * (blackHole.radius + 10);
      const vx = Math.cos(angle) * 2;
      const vy = Math.sin(angle) * 2;

      if (callbacks.onAdd) callbacks.onAdd('particle', x, y, vx, vy);

      requestAnimationFrame(emit);
    };
    emit();
  }
}
