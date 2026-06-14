export class HUD {
  constructor(container) {
    this.container = container;
    this.bodies = 0;
    this.G = 6.67;
    this.timeScale = 1;
    this.collisions = true;
    this.fps = 60;
    this.render();
  }

  update(stats) {
    this.bodies = stats.bodies ?? this.bodies;
    this.G = stats.G ?? this.G;
    this.timeScale = stats.timeScale ?? this.timeScale;
    this.collisions = stats.collisions ?? this.collisions;
    this.fps = stats.fps ?? this.fps;
    this.render();
  }

  render() {
    this.container.innerHTML = `
      <span class="mono text-[10px] tracking-wide">
        <span class="text-white/50">BODIES</span>
        <span class="text-white/85">${this.bodies}</span>
        <span class="text-white/30 mx-2">.</span>
        <span class="text-white/50">G</span>
        <span class="text-white/85">${this.G.toFixed(2)}</span>
        <span class="text-white/30 mx-2">.</span>
        <span class="text-white/50">TIME</span>
        <span class="text-white/85">${this.timeScale.toFixed(1)}x</span>
        <span class="text-white/30 mx-2">.</span>
        <span class="text-white/50">COLLISIONS</span>
        <span class="text-white/85">${this.collisions ? 'ON' : 'OFF'}</span>
      </span>
    `;
  }
}
