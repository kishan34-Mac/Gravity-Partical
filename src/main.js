import { Body, BODY_TYPES } from './bodies.js';
import { PhysicsEngine } from './physics.js';
import { CanvasRenderer } from './canvas.js';
import { UI } from './ui.js';
import { HUD } from './hud.js';
import { Interaction } from './interaction.js';
import { Presets } from './presets.js';
import { EasterEggs } from './easter-eggs.js';
import { takeScreenshot } from './screenshot.js';

class GravitySimulation {
  constructor() {
    this.bodies = [];
    this.lastFrameTime = 0;
    this.fps = 60;

    this.setupDOM();
    this.setupUI();
    this.setupPhysics();
    this.setupCanvas();
    this.setupInteraction();
    this.setupPresets();
    this.setupEasterEggs();
    this.startLoop();
  }

  setupDOM() {
    const app = document.getElementById('app');

    app.innerHTML = `
      <div class="flex h-full w-full">
        <div class="flex-1 flex flex-col relative">
          <div id="topbar" class="h-11 bg-[rgba(4,4,14,0.95)] border-b border-white/[0.06] flex items-center justify-between px-4 z-10">
            <div class="font-bold uppercase tracking-[0.16em] text-white/85">
              Gravity<span class="text-indigo-400">.</span>io
            </div>
            <div id="hud"></div>
          </div>
          <div class="flex-1 relative">
            <canvas id="canvas" class="absolute inset-0"></canvas>
            <div id="speed-badge" class="absolute top-4 right-4 hidden bg-amber-500/20 text-amber-400 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider">FAST FORWARD</div>
          </div>
          <div id="bottombar" class="h-9 bg-[rgba(4,4,14,0.95)] border-t border-white/[0.06] flex items-center justify-end px-4 text-[10px] text-white/50 mono">
            <span class="mr-4">BODIES: <span id="body-count" class="text-white/80">0</span></span>
            <span>FPS: <span id="fps-display" class="text-white/80">60</span></span>
          </div>
        </div>
        <div id="sidebar"></div>
      </div>
    `;

    this.canvas = document.getElementById('canvas');
    this.hudContainer = document.getElementById('hud');
    this.sidebarContainer = document.getElementById('sidebar');
    this.bodyCountEl = document.getElementById('body-count');
    this.fpsDisplayEl = document.getElementById('fps-display');
    this.speedBadge = document.getElementById('speed-badge');
  }

  setupUI() {
    this.ui = new UI(this.sidebarContainer, {
      onSettingChange: (key, value) => {
        if (key === 'G') this.physics.G = value;
        else if (key === 'timeScale') {
          this.physics.timeScale = value;
          if (value > 1.2) {
            this.speedBadge.classList.remove('hidden');
          } else {
            this.speedBadge.classList.add('hidden');
          }
        } else if (key === 'trailLength') this.renderer.showTrails = value > 0;
        else if (key === 'softening') this.physics.softening = value;
      },
      onAction: (action, value) => {
        if (action === 'pause') this.paused = value;
        else if (action === 'trails') this.renderer.showTrails = value;
        else if (action === 'collisions') this.physics.collisionsEnabled = value;
      },
      onClear: () => {
        this.bodies = [];
        this.renderer.selectedBody = null;
        this.interaction.clearSelection();
      },
      onScreenshot: () => takeScreenshot(this.canvas),
      onPreset: (preset) => this.loadPreset(preset)
    });

    this.paused = this.ui.getSettings().paused;
  }

  setupPhysics() {
    this.physics = new PhysicsEngine({
      G: this.ui.getSettings().G,
      timeScale: this.ui.getSettings().timeScale,
      softening: this.ui.getSettings().softening,
      trailLength: this.ui.getSettings().trailLength,
      collisionsEnabled: this.ui.getSettings().collisionsEnabled
    });
  }

  setupCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    this.renderer = new CanvasRenderer(this.canvas);
    this.renderer.showTrails = true;
  }

  setupInteraction() {
    this.interaction = new Interaction(this.canvas, {
      getBodies: () => this.bodies,
      onSelect: (body) => {
        this.renderer.selectedBody = body;
      },
      onDelete: (body) => {
        const idx = this.bodies.indexOf(body);
        if (idx > -1) {
          this.bodies.splice(idx, 1);
        }
      },
      onPlace: (x, y, vx, vy) => {
        const type = this.ui.getSelectedType();
        const body = new Body(type, x, y, vx, vy);
        this.bodies.push(body);
      },
      onDragUpdate: (start, end) => {
        if (start && end) {
          this.renderer.dragInfo = {
            startX: start.x,
            startY: start.y,
            endX: end.x,
            endY: end.y
          };
          this.canvas.style.cursor = 'crosshair';
        } else {
          this.renderer.dragInfo = null;
          this.canvas.style.cursor = 'default';
        }
      },
      onResize: () => {
        this.renderer.resize();
      }
    });
  }

  setupPresets() {
    this.presets = new Presets(this.physics);
  }

  setupEasterEggs() {
    this.easterEggs = new EasterEggs();

    document.addEventListener('keydown', (e) => {
      this.easterEggs.checkKeyDown(e.key, this.bodies, {
        getSelected: () => this.interaction.selectedBody,
        onRemove: (body) => {
          const idx = this.bodies.indexOf(body);
          if (idx > -1) this.bodies.splice(idx, 1);
        },
        onAdd: (type, x, y, vx, vy) => {
          this.bodies.push(new Body(type, x, y, vx, vy));
        },
        onClear: () => {
          this.bodies = [];
        },
        getG: () => this.physics.G
      });
    });

    this.canvas.addEventListener('dblclick', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const body = this.interaction.findBodyAt(x, y);
      if (body?.type === 'black_hole') {
        this.easterEggs.triggerHawking(body, {
          onRemove: (bh) => {
            const idx = this.bodies.indexOf(bh);
            if (idx > -1) this.bodies.splice(idx, 1);
          },
          onAdd: (type, x, y, vx, vy) => {
            this.bodies.push(new Body(type, x, y, vx, vy));
          }
        });
      }
    });
  }

  loadPreset(preset) {
    this.bodies = [];
    this.renderer.selectedBody = null;
    this.interaction.clearSelection();
    this.renderer.generateBgStars();

    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;

    switch (preset) {
      case 'solar':
        this.bodies = this.presets.buildSolarSystem(cx, cy);
        break;
      case 'binary':
        this.bodies = this.presets.buildBinaryStars(cx, cy);
        break;
      case 'bh':
      case 'black-hole':
        this.bodies = this.presets.buildBlackHoleFeed(cx, cy);
        break;
      case 'galaxy':
        this.bodies = this.presets.buildGalaxyCollision(cx, cy);
        break;
    }
  }

  updateHUD() {
    const settings = this.ui.getSettings();

    this.hud.update({
      bodies: this.bodies.length,
      G: this.physics.G,
      timeScale: this.physics.timeScale,
      collisions: this.physics.collisionsEnabled,
      fps: this.fps
    });

    this.bodyCountEl.textContent = this.bodies.length;
    this.fpsDisplayEl.textContent = Math.round(this.fps);
  }

  startLoop() {
    this.hud = new HUD(document.getElementById('hud'));

    const loop = (timestamp) => {
      const delta = timestamp - this.lastFrameTime;
      this.lastFrameTime = timestamp;
      this.fps = 1000 / delta;

      if (!this.paused) {
        const settings = this.ui.getSettings();
        this.physics.collisionsEnabled = settings.collisionsEnabled;

        const merges = this.physics.update(this.bodies, settings.trailLength);

        for (const merge of merges) {
          if (merge.type === 'merge') {
            this.physics.mergeBodies(merge.survivor, merge.absorbed);
            const idx = this.bodies.indexOf(merge.absorbed);
            if (idx > -1) this.bodies.splice(idx, 1);
          } else if (merge.type === 'consumption') {
            if (merge.consumer.type === 'black_hole') {
              merge.consumer.mass += merge.consumed.mass;
              merge.consumer.radius = Math.cbrt(merge.consumer.mass) * 1.5;
            }
            const idx = this.bodies.indexOf(merge.consumed);
            if (idx > -1) this.bodies.splice(idx, 1);
          }
        }

        for (const body of this.bodies) {
          if (body.type === BODY_TYPES.BLACK_HOLE) {
            for (const other of this.bodies) {
              if (other !== body && other.type !== BODY_TYPES.BLACK_HOLE) {
                const dx = body.x - other.x;
                const dy = body.y - other.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < body.radius * 2.5 && !other.spaghettification) {
                  other.spaghettification = {
                    blackHole: body,
                    frames: 15,
                    currentFrame: 0
                  };
                }
              }
            }
          }
        }

        this.bodies = this.bodies.filter(body => {
          if (body.spaghettification) {
            return body.spaghettification.currentFrame < body.spaghettification.frames;
          }
          return true;
        });

        this.easterEggs?.checkLagrange(this.bodies, {});
      }

      this.renderer.selectedBody = this.interaction.selectedBody;
      this.renderer.dragInfo = this.interaction.getDragInfo();
      this.renderer.render(this.bodies);

      this.updateHUD();

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }
}

new GravitySimulation();
