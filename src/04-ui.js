import { TurboDevExtension } from './03-class.js';

/* global STYLES, vm */

Object.assign(TurboDevExtension.prototype, {
  _createUI() {
    if (document.getElementById('ext_kxTurboDev-terminal-extension-style')) return;

    const styleSheet = document.createElement('style');
    styleSheet.id = 'ext_kxTurboDev-terminal-extension-style';
    styleSheet.textContent = STYLES;
    document.head.appendChild(styleSheet);

    this.container = document.createElement('div');
    this.container.className = 'ext_kxTurboDev-terminal-wrapper';
    this.container.style.display = 'none';

    // Apply loaded system settings initially
    this._applySystemSettings();

    const header = document.createElement('div');
    header.className = 'ext_kxTurboDev-terminal-header';

    const titleGroup = document.createElement('div');
    titleGroup.className = 'ext_kxTurboDev-terminal-title';
    const statusDot = document.createElement('div');
    statusDot.className = 'ext_kxTurboDev-terminal-status';
    this.titleEl = document.createElement('span');
    this.titleEl.textContent = this.systemSettings.displayName ?? 'TurboDev';
    titleGroup.appendChild(statusDot);
    titleGroup.appendChild(this.titleEl);

    const controls = document.createElement('div');
    controls.className = 'ext_kxTurboDev-terminal-controls';

    const minBtn = document.createElement('button');
    minBtn.className = 'ext_kxTurboDev-control-btn minimize';
    minBtn.title = 'Minimize';
    minBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M19,13H5V11H19V13Z" /></svg>';
    minBtn.onclick = e => {
      e.stopPropagation();
      this._toggleMinimize();
    };

    // Performance Toggle Button
    this.perfBtn = document.createElement('button');
    this.perfBtn.className = 'ext_kxTurboDev-control-btn perf';
    this.perfBtn.title = 'Performance Monitor';
    this.perfBtn.innerHTML =
      '<svg viewBox="0 0 24 24"><path d="M16,11.78L20.24,4.45L21.97,5.45L16.74,14.5L10.23,10.75L5.46,19H22V21H2V3H4V17.54L9.5,8L16,11.78Z" /></svg>';
    this.perfBtn.onclick = e => {
      e.stopPropagation();
      this._togglePerformanceMode();
    };

    const clearBtn = document.createElement('button');
    clearBtn.className = 'ext_kxTurboDev-control-btn clear';
    clearBtn.title = 'Clear Console';
    clearBtn.innerHTML =
      '<svg viewBox="0 0 24 24"><path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" /></svg>';
    clearBtn.onclick = e => {
      e.stopPropagation();
      this.clearTerminal();
    };

    this.settingsBtn = document.createElement('button');
    this.settingsBtn.className = 'ext_kxTurboDev-control-btn settings';
    this.settingsBtn.title = 'Settings';
    this.settingsBtn.innerHTML =
      '<svg viewBox="0 0 24 24"><path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.35 19.43,11.03L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11.03C4.53,11.35 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.04 4.95,18.95L7.44,17.95C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.95L19.05,18.95C19.27,19.04 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z" /></svg>';
    this.settingsBtn.onclick = e => {
      e.stopPropagation();
      this._toggleSettings();
    };

    const closeBtn = document.createElement('button');
    closeBtn.className = 'ext_kxTurboDev-control-btn close';
    closeBtn.title = 'Close';
    closeBtn.innerHTML =
      '<svg viewBox="0 0 24 24"><path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" /></svg>';
    closeBtn.onclick = () => this.hideTerminal();

    controls.appendChild(minBtn);
    controls.appendChild(this.perfBtn);
    controls.appendChild(clearBtn);
    controls.appendChild(this.settingsBtn);
    controls.appendChild(closeBtn);

    header.appendChild(titleGroup);
    header.appendChild(controls);

    this.settingsPanel = document.createElement('div');
    this.settingsPanel.className = 'ext_kxTurboDev-settings-panel';

    this.outputContainer = document.createElement('div');
    this.outputContainer.className = 'ext_kxTurboDev-terminal-body';

    // Performance Panel
    this.perfContainer = document.createElement('div');
    this.perfContainer.className = 'ext_kxTurboDev-performance-panel';
    this._buildPerfUI(this.perfContainer);

    this.outputContainer.addEventListener('scroll', () => {
      const threshold = 20;
      const isAtBottom =
        this.outputContainer.scrollHeight -
          this.outputContainer.scrollTop -
          this.outputContainer.clientHeight <
        threshold;
      this.isAutoScrolling = isAtBottom;

      if (isAtBottom) {
        this.scrollBtn.classList.remove('visible');
      } else {
        this.scrollBtn.classList.add('visible');
      }
    });

    this.scrollBtn = document.createElement('div');
    this.scrollBtn.className = 'ext_kxTurboDev-scroll-btn';
    this.scrollBtn.textContent = '⬇';
    this.scrollBtn.title = 'Jump to Bottom';
    this.scrollBtn.onclick = () => {
      this.outputContainer.scrollTop = this.outputContainer.scrollHeight;
    };

    this.toast = document.createElement('div');
    this.toast.className = 'ext_kxTurboDev-toast';
    this.toast.textContent = 'Notification';

    const inputArea = document.createElement('div');
    inputArea.className = 'ext_kxTurboDev-terminal-input-area';

    // Hint Bar
    this.hintLabel = document.createElement('div');
    this.hintLabel.className = 'ext_kxTurboDev-hint-bar';
    inputArea.appendChild(this.hintLabel);

    this.promptLabel = document.createElement('span');
    this.promptLabel.className = 'ext_kxTurboDev-terminal-prompt';
    this.promptLabel.textContent = '>';

    this.inputField = document.createElement('input');
    this.inputField.className = 'ext_kxTurboDev-terminal-input';
    this.inputField.type = 'text';
    this.inputField.spellcheck = false;
    this.inputField.autocomplete = 'off';

    inputArea.appendChild(this.promptLabel);
    inputArea.appendChild(this.inputField);

    // Assemble
    this.container.appendChild(header);
    this.container.appendChild(this.settingsPanel);
    this.container.appendChild(this.outputContainer);
    this.container.appendChild(this.perfContainer); // Add Perf container
    this.container.appendChild(this.scrollBtn);
    this.container.appendChild(this.toast);
    this.container.appendChild(inputArea);

    document.body.appendChild(this.container);

    // Event Listeners
    this._makeDraggable(header);

    // Real-time input handling for hints
    this.inputField.addEventListener('input', () => {
      this._updateHint();
    });

    this.inputField.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        this._handleCommand(this.inputField.value);
        this.inputField.value = '';
        this._updateHint(); // Clear hint
      } else if (e.key === 'Tab') {
        e.preventDefault();
        this._handleTabCompletion();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (this.historyIndex < this.commandHistory.length - 1) {
          this.historyIndex++;
          const idx = this.commandHistory.length - 1 - this.historyIndex;
          this.inputField.value = this.commandHistory[idx];
          this._updateHint();
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (this.historyIndex > 0) {
          this.historyIndex--;
          const idx = this.commandHistory.length - 1 - this.historyIndex;
          this.inputField.value = this.commandHistory[idx];
          this._updateHint();
        } else if (this.historyIndex === 0) {
          this.historyIndex = -1;
          this.inputField.value = '';
          this._updateHint();
        }
      }
    });

    this.container.addEventListener('click', e => {
      if (this.isMinimized) return;

      // Only boost z-index if NOT in CLI mode to avoid covering modals
      if (!this.systemSettings.cliMode) {
        this.container.style.zIndex = '99999';
      }
    });
  },

  _updateHint() {
    const val = this.inputField.value.trim();
    const inputArea = this.inputField.closest('.ext_kxTurboDev-terminal-input-area');

    if (!val) {
      this.hintLabel.classList.remove('visible');
      if (inputArea) inputArea.classList.remove('valid-cmd');
      return;
    }

    const parts = val.split(' ');
    const cmdName = parts[0];

    // Check for alias or command
    const realCmd = this.aliases.has(cmdName) ? this.aliases.get(cmdName) : cmdName;
    const cmdData = this.registeredCommands.get(realCmd);

    if (cmdData) {
      if (inputArea) inputArea.classList.add('valid-cmd');
      this.hintLabel.replaceChildren();
      const cmdSpan = document.createElement('span');
      cmdSpan.className = 'ext_kxTurboDev-hint-cmd';
      cmdSpan.textContent = `Usage: ${realCmd}`;
      this.hintLabel.appendChild(cmdSpan);
      if (cmdData.args && cmdData.args.length > 0) {
        cmdData.args.forEach(arg => {
          const argSpan = document.createElement('span');
          argSpan.className = arg.optional
            ? 'ext_kxTurboDev-hint-arg'
            : 'ext_kxTurboDev-hint-arg required';
          const open = arg.optional ? '[' : '<';
          const close = arg.optional ? ']' : '>';
          argSpan.textContent = `${open}${arg.name}:${arg.type}${close}`;
          this.hintLabel.appendChild(argSpan);
        });
      }
      this.hintLabel.classList.add('visible');
    } else {
      if (inputArea) inputArea.classList.remove('valid-cmd');
      this.hintLabel.classList.remove('visible');
    }
  },
  _applySystemSettings() {
    this._setTheme(this.systemSettings.theme);
    if (this.titleEl) {
      this.titleEl.textContent = this.systemSettings.displayName ?? 'TurboDev';
    }
    if (this.systemSettings.cliMode) {
      this._setCliMode(true);
    } else {
      if (this.container) this.container.style.opacity = this.systemSettings.opacity;
    }
    if (this.outputContainer)
      this.outputContainer.style.fontSize = `${this.systemSettings.fontSize}px`;
    if (this.inputField) this.inputField.style.fontSize = `${this.systemSettings.fontSize}px`;
  },

  _buildPerfUI(container) {
    // Stats Grid
    const grid = document.createElement('div');
    grid.className = 'ext_kxTurboDev-stat-grid';

    // Color-coded stats
    this.fpsCard = this._createStatCard(grid, 'FPS', '0', '#2ecc71'); // Green
    this.cloneCard = this._createStatCard(grid, 'Objects', '0', '#3498db'); // Blue
    this.threadCard = this._createStatCard(grid, 'Threads', '0', '#e67e22'); // Orange
    this.timeCard = this._createStatCard(grid, 'Uptime', '0s', '#9b59b6'); // Purple

    container.appendChild(grid);

    // Graph
    const graphCont = document.createElement('div');
    graphCont.className = 'ext_kxTurboDev-graph-container';

    const header = document.createElement('div');
    header.className = 'ext_kxTurboDev-graph-header';
    header.textContent = 'Performance History (Green: FPS, Blue: Clones)';
    graphCont.appendChild(header);

    this.perfCanvas = document.createElement('canvas');
    this.perfCanvas.className = 'ext_kxTurboDev-graph-canvas';
    graphCont.appendChild(this.perfCanvas);

    container.appendChild(graphCont);
  },

  _createStatCard(container, label, initialValue, color) {
    const card = document.createElement('div');
    card.className = 'ext_kxTurboDev-stat-card';
    if (color) card.style.color = color;

    const val = document.createElement('span');
    val.className = 'ext_kxTurboDev-stat-value';
    val.textContent = initialValue;
    const lbl = document.createElement('span');
    lbl.className = 'ext_kxTurboDev-stat-label';
    lbl.textContent = label;
    card.appendChild(val);
    card.appendChild(lbl);
    container.appendChild(card);
    return val;
  },

  _togglePerformanceMode() {
    this.isPerfMode = !this.isPerfMode;

    // Safety: Cancel pending query input if switching modes
    this._cancelPendingQuery();

    if (this.isPerfMode) {
      this.perfBtn.classList.add('active');
      this.outputContainer.style.display = 'none';
      this.inputField.parentElement.style.display = 'none';
      this.perfContainer.classList.add('visible');
      // Resize canvas on show
      setTimeout(() => {
        if (this.perfCanvas) {
          this.perfCanvas.width = this.perfCanvas.clientWidth;
          this.perfCanvas.height = this.perfCanvas.clientHeight;
          this.perfCtx = this.perfCanvas.getContext('2d');
        }
      }, 50);

      this._startPerfLoop();
    } else {
      this.perfBtn.classList.remove('active');
      this.perfContainer.classList.remove('visible');
      this.outputContainer.style.display = 'flex';
      this.inputField.parentElement.style.display = 'flex';

      this._stopPerfLoop();

      setTimeout(() => this.inputField.focus(), 50);
    }
  },

  _startPerfLoop() {
    if (this.perfReqId) return; // Already running
    this._loopPerformance();
  },

  _stopPerfLoop() {
    if (this.perfReqId) {
      cancelAnimationFrame(this.perfReqId);
      this.perfReqId = null;
    }
  },

  _loopPerformance() {
    if (!this.container) return; // Cleanup check

    // Throttle: Stop loop if disabled or hidden
    if (!this.isPerfMode || !this.isVisible) {
      this.perfReqId = null;
      return;
    }

    const now = performance.now();
    const delta = now - this.perfData.lastTime;
    this.perfData.frameCount++;

    // Update stats every 500ms approx or instant
    if (delta >= 1000) {
      this.perfData.fpsValue = Math.round((this.perfData.frameCount * 1000) / delta);
      this.perfData.frameCount = 0;
      this.perfData.lastTime = now;

      // Uptime
      const uptime = Math.floor(now / 1000);
      if (this.timeCard)
        this.timeCard.textContent = `${Math.floor(uptime / 60)}:${(uptime % 60).toString().padStart(2, '0')}`;
    }

    // Draw frame
    if (this.perfCanvas && this.perfCtx && this.container.style.display !== 'none') {
      const clones = vm.runtime.targets.length;
      const threads = vm.runtime.threads.length;

      // Update text
      if (this.fpsCard) this.fpsCard.textContent = this.perfData.fpsValue;
      if (this.cloneCard) this.cloneCard.textContent = clones;
      if (this.threadCard) this.threadCard.textContent = threads;

      // Push history
      this.perfData.fps.push(this.perfData.fpsValue);
      if (this.perfData.fps.length > 50) this.perfData.fps.shift();

      this.perfData.clones.push(clones);
      if (this.perfData.clones.length > 50) this.perfData.clones.shift();

      // Draw
      const w = this.perfCanvas.width;
      const h = this.perfCanvas.height;
      const ctx = this.perfCtx;

      ctx.clearRect(0, 0, w, h);

      // Draw Grid
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      // Horizontal grid
      for (let j = 1; j < 4; j++) {
        ctx.moveTo(0, j * (h / 4));
        ctx.lineTo(w, j * (h / 4));
      }
      ctx.stroke();

      const step = w / 50;

      // --- Draw FPS (Green) with Gradient Fill ---
      const fpsGradient = ctx.createLinearGradient(0, 0, 0, h);
      fpsGradient.addColorStop(0, 'rgba(46, 204, 113, 0.4)');
      fpsGradient.addColorStop(1, 'rgba(46, 204, 113, 0.0)');

      ctx.fillStyle = fpsGradient;
      ctx.strokeStyle = '#2ecc71';
      ctx.lineWidth = 2;
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#2ecc71';

      ctx.beginPath();
      ctx.moveTo(0, h); // Start bottom left
      this.perfData.fps.forEach((val, i) => {
        const y = h - (Math.min(val, 60) / 60) * h;
        if (i === 0) ctx.lineTo(0, y);
        else ctx.lineTo(i * step, y);
      });
      ctx.lineTo((this.perfData.fps.length - 1) * step, h); // To bottom right
      ctx.closePath();
      ctx.fill();

      // Stroke on top
      ctx.shadowBlur = 0; // Reset shadow for line sharpness or keep it
      ctx.beginPath();
      this.perfData.fps.forEach((val, i) => {
        const y = h - (Math.min(val, 60) / 60) * h;
        if (i === 0) ctx.moveTo(0, y);
        else ctx.lineTo(i * step, y);
      });
      ctx.stroke();

      // --- Draw Clones (Blue) with Gradient Fill ---
      const cloneGradient = ctx.createLinearGradient(0, 0, 0, h);
      cloneGradient.addColorStop(0, 'rgba(52, 152, 219, 0.4)');
      cloneGradient.addColorStop(1, 'rgba(52, 152, 219, 0.0)');

      ctx.fillStyle = cloneGradient;
      ctx.strokeStyle = '#3498db';
      ctx.lineWidth = 2;
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#3498db';

      ctx.beginPath();
      ctx.moveTo(0, h);
      this.perfData.clones.forEach((val, i) => {
        const y = h - (Math.min(val, 300) / 300) * h;
        if (i === 0) ctx.lineTo(0, y);
        else ctx.lineTo(i * step, y);
      });
      ctx.lineTo((this.perfData.clones.length - 1) * step, h);
      ctx.closePath();
      ctx.fill();

      // Stroke on top
      ctx.shadowBlur = 0;
      ctx.beginPath();
      this.perfData.clones.forEach((val, i) => {
        const y = h - (Math.min(val, 300) / 300) * h;
        if (i === 0) ctx.moveTo(0, y);
        else ctx.lineTo(i * step, y);
      });
      ctx.stroke();
    }

    this.perfReqId = requestAnimationFrame(this._loopPerformance.bind(this));
  }
});
