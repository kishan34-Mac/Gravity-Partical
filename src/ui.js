import { BODY_TYPES, BODY_CONFIGS } from './bodies.js';

export class UI {
  constructor(container, callbacks = {}) {
    this.container = container;
    this.callbacks = callbacks;
    this.selectedType = BODY_TYPES.PLANET;
    this.settings = {
      G: 6.67,
      timeScale: 1,
      trailLength: 200,
      softening: 15,
      collisionsEnabled: true,
      trailsEnabled: true,
      paused: false
    };
    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="h-full w-[160px] flex flex-col bg-[#04040e] border-l border-white/[0.06] text-[11px]">
        <div class="p-3 border-b border-white/[0.06]">
          <div class="text-[9px] uppercase tracking-wider text-white/40 mb-2">Place object</div>
          <div class="space-y-1">
            ${this.renderBodyButtons()}
          </div>
        </div>

        <div class="p-3 border-b border-white/[0.06]">
          <div class="text-[9px] uppercase tracking-wider text-white/40 mb-2">Simulation</div>
          <div class="space-y-3">
            ${this.renderSlider('Gravity', 'G', 0.1, 20, this.settings.G, '#818cf8')}
            ${this.renderSlider('Time', 'timeScale', 0.1, 5, this.settings.timeScale, '#34d399')}
            ${this.renderSlider('Trails', 'trailLength', 0, 500, this.settings.trailLength, '#f472b6')}
            ${this.renderSlider('Soft', 'softening', 0, 50, this.settings.softening, '#fbbf24')}
          </div>
        </div>

        <div class="p-3 flex-1">
          <div class="text-[9px] uppercase tracking-wider text-white/40 mb-2">Presets</div>
          <div class="grid grid-cols-2 gap-1">
            ${this.renderPresetButton('Solar', 'Solar System')}
            ${this.renderPresetButton('Binary', 'Binary Stars')}
            ${this.renderPresetButton('BH', 'Black Hole')}
            ${this.renderPresetButton('Galaxy', 'Galaxy')}
          </div>
        </div>

        <div class="p-3 border-t border-white/[0.06]">
          <div class="flex gap-1 flex-wrap">
            <button data-action="pause" class="px-2 py-1 bg-white/5 rounded text-white/70 hover:bg-white/10 transition">${this.settings.paused ? 'Resume' : 'Pause'}</button>
            <button data-action="clear" class="px-2 py-1 bg-white/5 rounded text-white/70 hover:bg-white/10 transition">Clear</button>
            <button data-action="screenshot" class="px-2 py-1 bg-white/5 rounded text-white/70 hover:bg-white/10 transition">Shot</button>
            <button data-action="trails" class="px-2 py-1 bg-white/5 rounded text-white/70 hover:bg-white/10 transition">${this.settings.trailsEnabled ? 'Trails' : 'No Trails'}</button>
            <button data-action="collisions" class="px-2 py-1 bg-white/5 rounded text-white/70 hover:bg-white/10 transition">${this.settings.collisionsEnabled ? 'Coll' : 'No Coll'}</button>
          </div>
        </div>
      </div>
    `;

    this.attachEvents();
  }

  renderBodyButtons() {
    const types = [BODY_TYPES.STAR, BODY_TYPES.PLANET, BODY_TYPES.MOON, BODY_TYPES.BLACK_HOLE, BODY_TYPES.ASTEROID];
    const names = { star: 'Star', planet: 'Planet', moon: 'Moon', black_hole: 'Black Hole', asteroid: 'Asteroid' };
    const hints = {
      star: 'Mass 200-400',
      planet: 'Mass 20-60',
      moon: 'Mass 2-8',
      black_hole: 'Mass 800-2000',
      asteroid: 'Mass 0.5-2'
    };

    return types.map(type => {
      const config = BODY_CONFIGS[type];
      const color = config.colors[0];
      const isSelected = this.selectedType === type;

      return `
        <button data-type="${type}" class="w-full flex items-center gap-2 p-1.5 rounded transition ${isSelected ? 'bg-indigo-500/20 border border-indigo-500/50' : 'hover:bg-white/5'}">
          <div class="w-2.5 h-2.5 rounded-full" style="background: ${color}"></div>
          <div class="flex-1 text-left">
            <div class="text-white/80 font-medium">${names[type]}</div>
            <div class="text-[9px] text-white/30">${hints[type]}</div>
          </div>
        </button>
      `;
    }).join('');
  }

  renderSlider(label, key, min, max, value, color) {
    return `
      <div class="flex items-center gap-2">
        <span class="text-white/50 w-12">${label}</span>
        <input type="range" data-setting="${key}" min="${min}" max="${max}" step="${key === 'trailLength' ? 10 : 0.1}" value="${value}" class="flex-1 h-2" style="accent-color: ${color}">
        <span class="mono text-[10px] text-white/70 w-8">${key === 'G' || key === 'softening' ? value.toFixed(1) : key === 'timeScale' ? value.toFixed(1) + 'x' : Math.round(value)}</span>
      </div>
    `;
  }

  renderPresetButton(label, full) {
    return `
      <button data-preset="${label.toLowerCase().replace(' ', '-')}" class="px-2 py-1.5 bg-white/5 rounded text-white/70 hover:bg-white/10 transition text-[10px]">${label}</button>
    `;
  }

  attachEvents() {
    this.container.querySelectorAll('[data-type]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.selectedType = btn.dataset.type;
        this.render();
      });
    });

    this.container.querySelectorAll('[data-setting]').forEach(slider => {
      slider.addEventListener('input', (e) => {
        const key = e.target.dataset.setting;
        const value = parseFloat(e.target.value);
        this.settings[key] = value;
        if (this.callbacks.onSettingChange) {
          this.callbacks.onSettingChange(key, value);
        }
        this.render();
      });
    });

    this.container.querySelectorAll('[data-preset]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (this.callbacks.onPreset) {
          this.callbacks.onPreset(btn.dataset.preset);
        }
      });
    });

    this.container.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        this.handleAction(action);
      });
    });
  }

  handleAction(action) {
    switch (action) {
      case 'pause':
        this.settings.paused = !this.settings.paused;
        break;
      case 'clear':
        if (this.callbacks.onClear) this.callbacks.onClear();
        return;
      case 'screenshot':
        if (this.callbacks.onScreenshot) this.callbacks.onScreenshot();
        return;
      case 'trails':
        this.settings.trailsEnabled = !this.settings.trailsEnabled;
        break;
      case 'collisions':
        this.settings.collisionsEnabled = !this.settings.collisionsEnabled;
        break;
    }
    this.render();
    if (this.callbacks.onAction) {
      this.callbacks.onAction(action, this.settings[action === 'pause' ? 'paused' : action === 'trails' ? 'trailsEnabled' : 'collisionsEnabled']);
    }
  }

  getSelectedType() {
    return this.selectedType;
  }

  getSettings() {
    return this.settings;
  }
}
