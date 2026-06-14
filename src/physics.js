export class PhysicsEngine {
  constructor(settings = {}) {
    this.G = settings.G ?? 6.67;
    this.dt = settings.dt ?? 0.016;
    this.softening = settings.softening ?? 15;
    this.timeScale = settings.timeScale ?? 1;
    this.collisionsEnabled = settings.collisionsEnabled ?? true;
    this.performanceCutoff = settings.performanceCutoff ?? 50;
  }

  update(bodies, trailLength) {
    const dt = this.dt * this.timeScale;
    const n = bodies.length;

    for (let i = 0; i < n; i++) {
      const body = bodies[i];
      if (body.pinned) continue;
      body.updateTrail(trailLength);
    }

    const forces = new Array(n);
    for (let i = 0; i < n; i++) {
      forces[i] = { fx: 0, fy: 0 };
    }

    const skipSmall = n > this.performanceCutoff;

    for (let i = 0; i < n; i++) {
      const bodyA = bodies[i];
      const skipA = skipSmall && bodyA.mass < 0.5;

      for (let j = i + 1; j < n; j++) {
        const bodyB = bodies[j];

        if (!bodyA.pinned || !bodyB.pinned) {
          const dx = bodyB.x - bodyA.x;
          const dy = bodyB.y - bodyA.y;
          const distSq = dx * dx + dy * dy;
          const dist = Math.sqrt(distSq) + this.softening;

          const force = this.G * bodyA.mass * bodyB.mass / (dist * dist);
          const fx = force * dx / dist;
          const fy = force * dy / dist;

          if (!bodyA.pinned && !skipA) {
            forces[i].fx += fx;
            forces[i].fy += fy;
          }
          if (!bodyB.pinned) {
            forces[j].fx -= fx;
            forces[j].fy -= fy;
          }
        }
      }
    }

    for (let i = 0; i < n; i++) {
      const body = bodies[i];
      if (body.pinned) continue;

      const ax = forces[i].fx / body.mass;
      const ay = forces[i].fy / body.mass;

      body.vx += ax * dt;
      body.vy += ay * dt;

      body.x += body.vx * dt;
      body.y += body.vy * dt;
    }

    if (this.collisionsEnabled) {
      return this.handleCollisions(bodies);
    }

    return [];
  }

  handleCollisions(bodies) {
    const merges = [];
    const toRemove = new Set();

    for (let i = 0; i < bodies.length; i++) {
      if (toRemove.has(i)) continue;
      const bodyA = bodies[i];

      for (let j = i + 1; j < bodies.length; j++) {
        if (toRemove.has(j)) continue;
        const bodyB = bodies[j];

        const dx = bodyB.x - bodyA.x;
        const dy = bodyB.y - bodyA.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = (bodyA.radius + bodyB.radius) * 0.8;

        if (dist < minDist) {
          const larger = bodyA.mass >= bodyB.mass ? bodyA : bodyB;
          const smaller = bodyA.mass >= bodyB.mass ? bodyB : bodyA;
          const smallerIdx = bodyA.mass >= bodyB.mass ? j : i;

          if (larger.type === 'black_hole') {
            merges.push({
              type: 'consumption',
              consumer: larger,
              consumed: smaller
            });
          } else {
            merges.push({
              type: 'merge',
              survivor: larger,
              absorbed: smaller
            });
          }
          toRemove.add(smallerIdx);
        }
      }
    }

    return merges;
  }

  mergeBodies(survivor, absorbed) {
    const totalMass = survivor.mass + absorbed.mass;
    survivor.vx = (survivor.mass * survivor.vx + absorbed.mass * absorbed.vx) / totalMass;
    survivor.vy = (survivor.mass * survivor.vy + absorbed.mass * absorbed.vy) / totalMass;
    survivor.mass = totalMass;
    survivor.radius = Math.cbrt(totalMass) * 1.5;
    survivor.flash();
  }
}
