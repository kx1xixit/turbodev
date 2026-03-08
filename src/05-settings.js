import { TurboDevExtension } from './03-class.js';

/* global vm */

Object.assign(TurboDevExtension.prototype, {
  _showToast(message, duration = 2000) {
    this.toast.textContent = message;
    this.toast.classList.add('show');
    setTimeout(() => {
      this.toast.classList.remove('show');
    }, duration);
  },

  _toggleMinimize() {
    this.isMinimized = !this.isMinimized;
    if (this.isMinimized) {
      this.container.classList.add('ext_kxTurboDev-minimized');
    } else {
      this.container.classList.remove('ext_kxTurboDev-minimized');
      setTimeout(() => this.inputField.focus(), 50);
    }
  },

  _handleTabCompletion() {
    const current = this.inputField.value;
    if (!current) return;
    const matches = Array.from(this.registeredCommands.keys()).filter(cmd =>
      cmd.startsWith(current)
    );
    if (matches.length === 1) {
      this.inputField.value = matches[0] + ' ';
      this._updateHint();
    } else if (matches.length > 1) {
      this._addLine(`@c #7f8c8d:Possible commands: ${matches.join(', ')}@c`);
    }
  },

  _refreshSettingsUI() {
    if (!this.settingsPanel) return;

    this.settingsPanel.innerHTML = '';

    const header = document.createElement('div');
    header.className = 'ext_kxTurboDev-settings-header';
    header.textContent = 'System Preferences';
    this.settingsPanel.appendChild(header);

    const content = document.createElement('div');
    content.className = 'ext_kxTurboDev-settings-content';
    this.settingsPanel.appendChild(content);

    const secApp = document.createElement('div');
    secApp.className = 'ext_kxTurboDev-settings-section-title';
    secApp.textContent = 'Appearance';
    content.appendChild(secApp);

    // Theme Selector
    const themeRow = document.createElement('div');
    themeRow.className = 'ext_kxTurboDev-setting-item';
    const themeLabel = document.createElement('label');
    themeLabel.textContent = 'Theme';
    const themeSelect = document.createElement('select');
    themeSelect.className = 'ext_kxTurboDev-setting-select';

    ['standard', 'matrix', 'ocean', 'retro'].forEach(t => {
      const opt = document.createElement('option');
      opt.value = t;
      opt.textContent = t.charAt(0).toUpperCase() + t.slice(1);
      if (this.systemSettings.theme === t) opt.selected = true;
      themeSelect.appendChild(opt);
    });

    if (this.lockedSettings.has('theme')) themeSelect.disabled = true;

    themeSelect.onchange = e => {
      this._setTheme(e.target.value);
      this._saveSettings();
    };
    themeRow.appendChild(themeLabel);
    themeRow.appendChild(themeSelect);
    content.appendChild(themeRow);

    // CLI Mode Toggle
    this._addToggle(content, 'CLI Mode', 'cliMode', this.systemSettings.cliMode, val => {
      this._setCliMode(val);
      this._saveSettings();
    });

    // True TUI Mode Toggle
    this._addToggle(content, 'True TUI', 'trueTuiMode', this.systemSettings.trueTuiMode, val => {
      this._setTrueTuiMode(val);
      this._saveSettings();
    });

    // Timestamp Toggle
    this._addToggle(
      content,
      'Show Timestamps',
      'showTimestamps',
      this.systemSettings.showTimestamps,
      val => {
        this.systemSettings.showTimestamps = val;
        this._saveSettings();
      }
    );

    // Verbose Logging Toggle
    this._addToggle(content, 'Verbose Logging', 'verboseLogging', this.verboseLogging, val => {
      this.verboseLogging = val;
      this._saveProjectSettings();
    });

    // Font Size Input
    this._addNumberInput(
      content,
      'Font Size (px)',
      'fontSize',
      this.systemSettings.fontSize,
      10,
      24,
      val => {
        this.systemSettings.fontSize = val;
        this.outputContainer.style.fontSize = `${val}px`;
        this.inputField.style.fontSize = `${val}px`;
        this._saveSettings();
      }
    );

    // Opacity Slider
    this._addSlider(content, 'Opacity', 'opacity', this.systemSettings.opacity, 0.2, 1.0, val => {
      this.systemSettings.opacity = val;
      if (!this.systemSettings.cliMode && !this.systemSettings.trueTuiMode) {
        this.container.style.opacity = val;
      }
      this._saveSettings();
    });

    // --- Section: Actions ---
    const secAction = document.createElement('div');
    secAction.className = 'ext_kxTurboDev-settings-section-title';
    secAction.textContent = 'Actions';
    secAction.style.marginTop = '10px';
    content.appendChild(secAction);

    const copyBtn = document.createElement('button');
    copyBtn.className = 'ext_kxTurboDev-settings-btn-action';
    copyBtn.textContent = 'Copy History to Clipboard';
    copyBtn.onclick = () => {
      const text = this._getOutputText();
      if (!navigator.clipboard || !navigator.clipboard.writeText) {
        this._showToast('Clipboard not available', 2000);
        return;
      }
      try {
        navigator.clipboard
          .writeText(text)
          .then(() => {
            this._showToast('Copied to Clipboard!');
          })
          .catch(() => {
            this._showToast('Writing to the clipboard is not allowed', 2000);
          });
      } catch {
        this._showToast('Writing to the clipboard is not allowed', 2000);
      }
    };
    content.appendChild(copyBtn);

    const exportBtn = document.createElement('button');
    exportBtn.className = 'ext_kxTurboDev-settings-btn-action';
    exportBtn.textContent = 'Export Logs to File';
    exportBtn.onclick = () => this._exportLogs();
    content.appendChild(exportBtn);

    // --- Section: Custom Settings ---
    if (this.customSettings.size > 0) {
      const secCustom = document.createElement('div');
      secCustom.className = 'ext_kxTurboDev-settings-section-title';
      secCustom.textContent = 'Game Settings';
      secCustom.style.marginTop = '10px';
      content.appendChild(secCustom);

      this.customSettings.forEach((setting, id) => {
        if (setting.type === 'toggle') {
          this._addToggle(content, setting.name, id, setting.value, val => (setting.value = val));
        } else if (setting.type === 'slider') {
          this._addSlider(
            content,
            setting.name,
            id,
            setting.value,
            setting.min,
            setting.max,
            val => (setting.value = val)
          );
        } else if (setting.type === 'text') {
          this._addTextInput(
            content,
            setting.name,
            id,
            setting.value,
            val => (setting.value = val)
          );
        }
      });
    }

    // Footer
    const footer = document.createElement('div');
    footer.className = 'ext_kxTurboDev-settings-footer';
    const doneBtn = document.createElement('button');
    doneBtn.className = 'ext_kxTurboDev-settings-btn-close';
    doneBtn.textContent = 'Done';
    doneBtn.onclick = () => this._toggleSettings();
    footer.appendChild(doneBtn);
    this.settingsPanel.appendChild(footer);
  },

  _setTheme(themeName) {
    this.container.classList.remove(
      'ext_kxTurboDev-theme-matrix',
      'ext_kxTurboDev-theme-ocean',
      'ext_kxTurboDev-theme-retro'
    );
    if (themeName !== 'standard') {
      this.container.classList.add(`ext_kxTurboDev-theme-${themeName}`);
    }
    this.systemSettings.theme = themeName;
  },

  _getOutputText() {
    const lines = [];
    for (let i = 0; i < this.outputContainer.children.length; i++) {
      const child = this.outputContainer.children[i];
      if (child.classList.contains('ext_kxTurboDev-help-container')) {
        child.querySelectorAll('.ext_kxTurboDev-help-card').forEach(card => {
          const name = card.querySelector('.ext_kxTurboDev-cmd-name')?.textContent || '';
          const desc = card.querySelector('.ext_kxTurboDev-cmd-desc')?.textContent || '';
          lines.push(`${name} - ${desc}`);
        });
      } else {
        const paddingLeft = parseFloat(child.style.paddingLeft) || 0;
        lines.push(pxToIndent(paddingLeft) + child.textContent);
      }
    }
    return lines.join('\n');
  },

  _exportLogs() {
    try {
      const text = this._getOutputText();
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const filename = `turbodev-logs-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;

      Scratch.download(url, filename)
        .then(() => {
          this._showToast('Logs Exported!');
          URL.revokeObjectURL(url);
        })
        .catch(e => {
          this._showToast('Export Failed!');
          this._addLine(`@c #e74c3c:Export failed: ${e.message || e}@c`);
          URL.revokeObjectURL(url);
        });
    } catch (e) {
      this._showToast('Export Failed!');
      this._addLine(`@c #e74c3c:Export failed: ${e.message}@c`);
    }
  },

  _syncContainerToCanvas() {
    if (!this.container) return;
    if (!vm || !vm.renderer || !vm.renderer.canvas) return;
    const rect = vm.renderer.canvas.getBoundingClientRect();
    this.container.style.position = 'fixed';
    this.container.style.left = rect.left + 'px';
    this.container.style.top = rect.top + 'px';
    this.container.style.width = rect.width + 'px';
    this.container.style.height = rect.height + 'px';
  },

  _updateCliPosition() {
    if (!this.systemSettings.cliMode) return;
    this._syncContainerToCanvas();
    this.cliReqId = requestAnimationFrame(this._updateCliPosition.bind(this));
  },

  _onCliScroll() {
    if (!this.systemSettings.cliMode) return;
    this._syncContainerToCanvas();
  },

  _setCliMode(enabled) {
    this.systemSettings.cliMode = enabled;
    if (enabled) {
      // Disable True TUI mode if active — they are mutually exclusive
      if (this.systemSettings.trueTuiMode) this._setTrueTuiMode(false);

      // Save current state
      this.prevRect = {
        left: this.container.style.left,
        top: this.container.style.top,
        width: this.container.style.width,
        height: this.container.style.height,
      };

      this.container.classList.add('ext_kxTurboDev-cli-mode');

      // If currently minimized, maximize it because minimized CLI mode looks broken/hidden
      if (this.isMinimized) this._toggleMinimize();

      // Start tracking loop - CANCEL FIRST to prevent duplication
      if (this.cliReqId) cancelAnimationFrame(this.cliReqId);
      // Immediately sync to canvas to avoid one-frame misalignment before the rAF loop runs
      this._syncContainerToCanvas();
      this.cliReqId = requestAnimationFrame(this._updateCliPosition.bind(this));
      window.addEventListener('scroll', this.boundCliScroll, { capture: true, passive: true });
    } else {
      this.container.classList.remove('ext_kxTurboDev-cli-mode');

      // Stop tracking loop
      if (this.cliReqId) {
        cancelAnimationFrame(this.cliReqId);
        this.cliReqId = null;
      }
      window.removeEventListener('scroll', this.boundCliScroll, { capture: true, passive: true });

      // Restore normal fixed positioning and saved manual geometry
      this.container.style.position = 'fixed';
      if (this.prevRect) {
        this.container.style.left = this.prevRect.left;
        this.container.style.top = this.prevRect.top;
        this.container.style.width = this.prevRect.width;
        this.container.style.height = this.prevRect.height;
      } else {
        // Default fallback
        this.container.style.left = '40px';
        this.container.style.top = '40px';
        this.container.style.width = '550px';
        this.container.style.height = '380px';
      }
      // Restore opacity slider value
      this.container.style.opacity = this.systemSettings.opacity;
    }
  },

  _syncContainerToViewport() {
    if (!this.container) return;
    this.container.style.position = 'fixed';
    this.container.style.left = '0px';
    this.container.style.top = '0px';
    this.container.style.width = window.innerWidth + 'px';
    this.container.style.height = window.innerHeight + 'px';
  },

  _updateTuiPosition() {
    if (!this.systemSettings.trueTuiMode) return;
    this._syncContainerToViewport();
    this.tuiReqId = requestAnimationFrame(this.boundUpdateTuiPosition);
  },

  _onTuiScroll() {
    if (!this.systemSettings.trueTuiMode) return;
    this._syncContainerToViewport();
  },

  _setTrueTuiMode(enabled) {
    this.systemSettings.trueTuiMode = enabled;
    if (enabled) {
      // Disable CLI mode if active — they are mutually exclusive
      if (this.systemSettings.cliMode) this._setCliMode(false);

      // Save current state
      this.prevRect = {
        left: this.container.style.left,
        top: this.container.style.top,
        width: this.container.style.width,
        height: this.container.style.height,
      };

      this.container.classList.add('ext_kxTurboDev-true-tui-mode');

      // If currently minimized, maximize it because minimized True TUI mode looks broken/hidden
      if (this.isMinimized) this._toggleMinimize();

      // Start tracking loop - CANCEL FIRST to prevent duplication
      if (this.tuiReqId) cancelAnimationFrame(this.tuiReqId);
      // Immediately sync to viewport to avoid one-frame misalignment before the rAF loop runs
      this._syncContainerToViewport();
      this.tuiReqId = requestAnimationFrame(this.boundUpdateTuiPosition);
      window.addEventListener('scroll', this.boundTuiScroll, { capture: true, passive: true });
    } else {
      this.container.classList.remove('ext_kxTurboDev-true-tui-mode');

      // Stop tracking loop
      if (this.tuiReqId) {
        cancelAnimationFrame(this.tuiReqId);
        this.tuiReqId = null;
      }
      window.removeEventListener('scroll', this.boundTuiScroll, { capture: true, passive: true });

      // Restore normal fixed positioning and saved manual geometry
      this.container.style.position = 'fixed';
      if (this.prevRect) {
        this.container.style.left = this.prevRect.left;
        this.container.style.top = this.prevRect.top;
        this.container.style.width = this.prevRect.width;
        this.container.style.height = this.prevRect.height;
      } else {
        // Default fallback
        this.container.style.left = '40px';
        this.container.style.top = '40px';
        this.container.style.width = '550px';
        this.container.style.height = '380px';
      }
      // Restore opacity slider value
      this.container.style.opacity = this.systemSettings.opacity;
    }
  },

  _setCommandBarEnabled(enabled) {
    this.commandBarEnabled = enabled;
    if (this.inputField) {
      if (enabled) {
        this.inputField.parentElement.classList.remove('ext_kxTurboDev-input-disabled');
        this.inputField.disabled = false;
      } else if (!this.pendingQuery) {
        // Defer the visual disable if a query is in-flight to avoid orphaning its promise
        this.inputField.parentElement.classList.add('ext_kxTurboDev-input-disabled');
        this.inputField.disabled = true;
      }
    }
  },

  setSystemSetting(args) {
    const setting = args.SETTING;
    let val = args.VALUE;

    // Type conversion
    if (setting === 'fontSize') val = parseInt(val) || 13;
    if (setting === 'opacity') val = parseFloat(val) || 1.0;
    if (setting === 'cliMode' || setting === 'trueTuiMode' || setting === 'showTimestamps') {
      val = String(val).toLowerCase() === 'true';
    }

    this.systemSettings[setting] = val;
    this._saveSettings();

    // Apply side effects
    if (setting === 'fontSize') {
      this.outputContainer.style.fontSize = `${val}px`;
      this.inputField.style.fontSize = `${val}px`;
    } else if (setting === 'opacity' && !this.systemSettings.cliMode && !this.systemSettings.trueTuiMode) {
      this.container.style.opacity = val;
    } else if (setting === 'cliMode') {
      this._setCliMode(val);
    } else if (setting === 'trueTuiMode') {
      this._setTrueTuiMode(val);
    } else if (setting === 'theme') {
      this._setTheme(val);
    }

    if (this.settingsPanel.classList.contains('open')) this._refreshSettingsUI();
  },

  setCustomSetting(args) {
    const id = String(args.ID);
    const val = String(args.VALUE);

    if (this.customSettings.has(id)) {
      const setting = this.customSettings.get(id);
      // Convert value based on type
      if (setting.type === 'toggle') setting.value = val.toLowerCase() === 'true';
      else if (setting.type === 'slider') setting.value = parseFloat(val) || setting.min;
      else setting.value = val;

      if (this.settingsPanel.classList.contains('open')) this._refreshSettingsUI();
    }
  },

  lockSetting(args) {
    this.lockedSettings.add(String(args.ID));
    if (this.settingsPanel.classList.contains('open')) this._refreshSettingsUI();
  },

  unlockSetting(args) {
    this.lockedSettings.delete(String(args.ID));
    if (this.settingsPanel.classList.contains('open')) this._refreshSettingsUI();
  },

  lockSettingsMenu() {
    this.isSettingsMenuLocked = true;
    this.settingsBtn.style.display = 'none';
    // Force close if open
    if (this.settingsPanel.classList.contains('open')) {
      this.settingsPanel.classList.remove('open');
    }
  },

  unlockSettingsMenu() {
    this.isSettingsMenuLocked = false;
    // Only show if not in CLI mode or True TUI mode (which hides it by default css)
    if (
      !this.container.classList.contains('ext_kxTurboDev-cli-mode') &&
      !this.container.classList.contains('ext_kxTurboDev-true-tui-mode')
    ) {
      this.settingsBtn.style.display = 'flex';
    }
  },

  _addToggle(container, labelText, id, currentValue, onChange) {
    const row = document.createElement('div');
    row.className = 'ext_kxTurboDev-setting-item';

    const label = document.createElement('label');
    label.textContent = labelText;

    const switchWrap = document.createElement('label');
    switchWrap.className = 'ext_kxTurboDev-toggle-switch';

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = currentValue;

    // Lock Check
    if (this.lockedSettings.has(id)) input.disabled = true;

    input.onchange = e => onChange(e.target.checked);

    const slider = document.createElement('span');
    slider.className = 'ext_kxTurboDev-slider';

    switchWrap.appendChild(input);
    switchWrap.appendChild(slider);

    label.appendChild(switchWrap);
    row.appendChild(label);
    container.appendChild(row);
  },

  _addSlider(container, labelText, id, currentValue, min, max, onChange) {
    const row = document.createElement('div');
    row.className = 'ext_kxTurboDev-setting-item';

    const label = document.createElement('label');
    label.textContent = `${labelText}: ${currentValue}`;

    const input = document.createElement('input');
    input.type = 'range';
    input.className = 'ext_kxTurboDev-setting-slider';
    input.min = min;
    input.max = max;
    input.step = max - min > 2 ? 1 : 0.1;
    input.value = currentValue;

    // Lock Check
    if (this.lockedSettings.has(id)) input.disabled = true;

    input.oninput = e => {
      const val = parseFloat(e.target.value);
      label.textContent = `${labelText}: ${val}`;
      onChange(val);
    };

    row.appendChild(label);
    row.appendChild(input);
    container.appendChild(row);
  },

  _addNumberInput(container, labelText, id, currentValue, min, max, onChange) {
    const row = document.createElement('div');
    row.className = 'ext_kxTurboDev-setting-item';

    const label = document.createElement('label');
    label.textContent = labelText;

    const input = document.createElement('input');
    input.type = 'number';
    input.className = 'ext_kxTurboDev-setting-input';
    input.value = currentValue;
    input.min = min;
    input.max = max;

    // Lock Check
    if (this.lockedSettings.has(id)) input.disabled = true;

    let lastValid = currentValue;
    input.onchange = e => {
      const val = parseFloat(e.target.value);
      if (!Number.isFinite(val)) {
        e.target.value = lastValid;
        return;
      }
      const clamped = Math.min(Math.max(val, min), max);
      e.target.value = clamped;
      lastValid = clamped;
      onChange(clamped);
    };

    row.appendChild(label);
    row.appendChild(input);
    container.appendChild(row);
  },

  _addTextInput(container, labelText, id, currentValue, onChange) {
    const row = document.createElement('div');
    row.className = 'ext_kxTurboDev-setting-item';

    const label = document.createElement('label');
    label.textContent = labelText;

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'ext_kxTurboDev-setting-input';
    input.value = currentValue;

    // Lock Check
    if (this.lockedSettings.has(id)) input.disabled = true;

    input.onchange = e => onChange(e.target.value);

    row.appendChild(label);
    row.appendChild(input);
    container.appendChild(row);
  },

  _toggleSettings() {
    if (this.isSettingsMenuLocked) return;
    if (!this.settingsPanel) return;
    const isOpen = this.settingsPanel.classList.contains('open');
    if (!isOpen) {
      // Rebuild UI every time it opens to catch new settings
      this._refreshSettingsUI();
      this.settingsPanel.classList.add('open');
    } else {
      this.settingsPanel.classList.remove('open');
    }
  },

  _makeDraggable(dragHandle) {
    let isDragging = false;
    let startX, startY, initialLeft, initialTop;

    dragHandle.addEventListener('mousedown', e => {
      // Don't drag if clicking a button or if in CLI mode or True TUI mode
      if (e.target.closest('.ext_kxTurboDev-control-btn')) return;
      if (this.systemSettings.cliMode || this.systemSettings.trueTuiMode) return;

      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      const rect = this.container.getBoundingClientRect();
      initialLeft = rect.left;
      initialTop = rect.top;
      e.preventDefault();
    });

    window.addEventListener('mousemove', e => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      // Simple bounds checking (prevent total loss)
      let newLeft = initialLeft + dx;
      let newTop = initialTop + dy;

      // Don't allow top bar to go off bottom or too far top
      if (newTop < 0) newTop = 0;
      if (newTop > window.innerHeight - 30) newTop = window.innerHeight - 30;

      // Don't allow container to go fully off-screen horizontally
      if (newLeft < 0) newLeft = 0;
      if (newLeft > window.innerWidth - this.container.offsetWidth)
        newLeft = window.innerWidth - this.container.offsetWidth;

      this.container.style.left = `${newLeft}px`;
      this.container.style.top = `${newTop}px`;
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });
  },
});
