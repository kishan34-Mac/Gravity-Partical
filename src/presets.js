import { Body, BODY_TYPES } from './bodies.js';

export class Presets {
  constructor(settings) {
    this.settings = settings;
  }

  buildSolarSystem(centerX, centerY) {
    const bodies = [];
    const G = this.settings.G;

    const star = new Body(BODY_TYPES.STAR, centerX, centerY, 0, 0, { mass: 350 });
    star.pinned = true;
    bodies.push(star);

    const planetData = [
      { dist: 80, mass: 25, color: '#f97316' },
      { dist: 140, mass: 30, color: '#34d399' },
      { dist: 210, mass: 50, color: '#60a5fa' },
      { dist: 300, mass: 35, color: '#ef4444' }
    ];

    planetData.forEach((data, i) => {
      const angle = Math.random() * Math.PI * 2;
      const x = centerX + Math.cos(angle) * data.dist;
      const y = centerY + Math.sin(angle) * data.dist;

      const vOrbit = Math.sqrt(G * 350 / data.dist);
      const vx = -Math.sin(angle) * vOrbit;
      const vy = Math.cos(angle) * vOrbit;

      bodies.push(new Body(BODY_TYPES.PLANET, x, y, vx, vy, { mass: data.mass, color: data.color }));

      if (i === 2) {
        for (let m = 0; m < 2; m++) {
          const moonAngle = Math.random() * Math.PI * 2;
          const moonDist = 20 + m * 15;
          const mx = x + Math.cos(moonAngle) * moonDist;
          const my = y + Math.sin(moonAngle) * moonDist;
          const vMoon = Math.sqrt(G * data.mass / moonDist) * 0.1;
          bodies.push(new Body(BODY_TYPES.MOON, mx, my,
            vx - Math.sin(moonAngle) * vMoon,
            vy + Math.cos(moonAngle) * vMoon
          ));
        }
      }
    });

    return bodies;
  }

  buildBinaryStars(centerX, centerY) {
    const bodies = [];
    const G = this.settings.G;

    const star1 = new Body(BODY_TYPES.STAR, centerX - 100, centerY, 0, 1.5, { mass: 300 });
    const star2 = new Body(BODY_TYPES.STAR, centerX + 100, centerY, 0, -1.5, { mass: 300 });
    bodies.push(star1, star2);

    for (let i = 0; i < 3; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 250 + Math.random() * 100;
      const x = centerX + Math.cos(angle) * dist;
      const y = centerY + Math.sin(angle) * dist;
      const vOrbit = Math.sqrt(G * 600 / dist) * 0.3;
      const vx = -Math.sin(angle) * vOrbit;
      const vy = Math.cos(angle) * vOrbit;
      bodies.push(new Body(BODY_TYPES.PLANET, x, y, vx, vy));
    }

    return bodies;
  }

  buildBlackHoleFeed(centerX, centerY) {
    const bodies = [];
    const G = this.settings.G;

    const bh = new Body(BODY_TYPES.BLACK_HOLE, centerX, centerY, 0, 0, { mass: 1800, radius: 20 });
    bodies.push(bh);

    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 100 + Math.random() * 250;
      const x = centerX + Math.cos(angle) * dist;
      const y = centerY + Math.sin(angle) * dist;

      const vOrbit = Math.sqrt(G * 1800 / dist) * (0.5 + Math.random() * 0.3);
      const perpAngle = angle + Math.PI / 2;
      const vx = Math.cos(perpAngle) * vOrbit;
      const vy = Math.sin(perpAngle) * vOrbit;

      bodies.push(new Body(BODY_TYPES.PLANET, x, y, vx, vy, { mass: 20 + Math.random() * 40 }));
    }

    return bodies;
  }

  buildGalaxyCollision(centerX, centerY) {
    const bodies = [];
    const G = this.settings.G;

    const buildCluster = (cx, cy, velX, velY) => {
      const cluster = [];
      const star = new Body(BODY_TYPES.STAR, cx, cy, velX, velY, { mass: 350 });
      cluster.push(star);

      for (let i = 0; i < 14; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 30 + Math.random() * 80;
        const x = cx + Math.cos(angle) * dist;
        const y = cy + Math.sin(angle) * dist;

        const vOrbit = Math.sqrt(G * 350 / dist) * 0.15;
        const vx = velX - Math.sin(angle) * vOrbit;
        const vy = velY + Math.cos(angle) * vOrbit;

        const types = [BODY_TYPES.PLANET, BODY_TYPES.MOON, BODY_TYPES.ASTEROID];
        const type = types[Math.floor(Math.random() * types.length)];
        cluster.push(new Body(type, x, y, vx, vy));
      }
      return cluster;
    };

    bodies.push(...buildCluster(centerX - 300, centerY, 0.8, 0.2));
    bodies.push(...buildCluster(centerX + 300, centerY, -0.8, -0.2));

    return bodies;
  }
}
