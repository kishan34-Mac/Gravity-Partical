export const BODY_TYPES = {
  STAR: 'star',
  PLANET: 'planet',
  MOON: 'moon',
  BLACK_HOLE: 'black_hole',
  ASTEROID: 'asteroid',
  PARTICLE: 'particle'
};

export const BODY_CONFIGS = {
  [BODY_TYPES.STAR]: {
    massRange: [200, 400],
    radiusRange: [12, 18],
    colors: ['#fde68a', '#f59e0b', '#b45309'],
    glow: 'rgba(251, 191, 36, 0.6)'
  },
  [BODY_TYPES.PLANET]: {
    massRange: [20, 60],
    radiusRange: [5, 10],
    colors: ['#60a5fa', '#34d399', '#f97316', '#ef4444', '#a78bfa'],
    glow: 'rgba(96, 165, 250, 0.4)'
  },
  [BODY_TYPES.MOON]: {
    massRange: [2, 8],
    radiusRange: [3, 5],
    colors: ['#d1d5db'],
    glow: 'rgba(209, 213, 219, 0.3)'
  },
  [BODY_TYPES.BLACK_HOLE]: {
    massRange: [800, 2000],
    radiusRange: [14, 22],
    colors: ['#080808'],
    glow: 'rgba(129, 140, 248, 0.6)'
  },
  [BODY_TYPES.ASTEROID]: {
    massRange: [0.5, 2],
    radiusRange: [2, 3],
    colors: ['#9ca3af'],
    glow: null
  },
  [BODY_TYPES.PARTICLE]: {
    massRange: [0.1, 0.1],
    radiusRange: [1, 1],
    colors: ['#6b7280'],
    glow: null
  }
};

let bodyId = 0;

export class Body {
  constructor(type, x, y, vx = 0, vy = 0, options = {}) {
    this.id = ++bodyId;
    this.type = type;
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.pinned = false;

    const config = BODY_CONFIGS[type];
    this.mass = options.mass ?? randomRange(config.massRange[0], config.massRange[1]);
    this.radius = options.radius ?? randomRange(config.radiusRange[0], config.radiusRange[1]);
    this.color = options.color ?? config.colors[Math.floor(Math.random() * config.colors.length)];
    this.glow = config.glow;

    this.trail = [];
    this.trailColor = this.color;
    this.flashFrames = 0;
    this.spaghettification = null;

    this.accretionAngle = Math.random() * Math.PI * 2;
    this.vertices = type === BODY_TYPES.ASTEROID ? this.generateAsteroidVertices() : null;
  }

  generateAsteroidVertices() {
    const count = 5 + Math.floor(Math.random() * 3);
    const vertices = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const dist = this.radius * (0.7 + Math.random() * 0.6);
      vertices.push({ angle, dist });
    }
    return vertices;
  }

  get speed() {
    return Math.sqrt(this.vx * this.vx + this.vy * this.vy);
  }

  flash() {
    this.flashFrames = 3;
  }

  updateTrail(maxLength) {
    this.trail.unshift({ x: this.x, y: this.y });
    if (this.trail.length > maxLength) {
      this.trail.pop();
    }
  }
}

function randomRange(min, max) {
  return min + Math.random() * (max - min);
}
