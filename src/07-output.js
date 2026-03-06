import { TurboDevExtension } from './03-class.js';

Object.assign(TurboDevExtension.prototype, {
  _scrollToBottom() {
    if (this.scrollReqId) cancelAnimationFrame(this.scrollReqId);
    this.scrollReqId = requestAnimationFrame(() => {
      this.outputContainer.scrollTop = this.outputContainer.scrollHeight;
      this.scrollReqId = null;
    });
  },

  _parseFormatting(text) {
    let safeText = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

    safeText = safeText.replace(/@c\s*(#[0-9A-Fa-f]{3,6})\s*:(.*?)@c/g, (match, color, content) => {
      return `<span style="color: ${color}">${content}</span>`;
    });

    safeText = safeText.replace(/@h\s*(#[0-9A-Fa-f]{3,6})\s*:(.*?)@h/g, (match, color, content) => {
      // Removed border-radius as requested
      return `<span style="background-color: ${color}; color: #fff; padding: 0 4px; border-radius: 0;">${content}</span>`;
    });

    safeText = safeText.replace(/@b:(.*?)@b/g, '<strong>$1</strong>');
    safeText = safeText.replace(/@i:(.*?)@i/g, '<em>$1</em>');

    return safeText;
  },

  _appendTimestamp(line) {
    const now = new Date();
    const timeSpan = document.createElement('span');
    timeSpan.className = 'ext_kxTurboDev-log-time';
    timeSpan.textContent = `[${now.toLocaleTimeString('en-US', { hour12: false })}] `;
    line.appendChild(timeSpan);
    return now;
  },

  // Returns the first child of outputContainer that is safe to evict (not an
  // active loader line currently tracked by loaderStack). Pass the caller's
  // pre-built activeLines Set so we only build it once per eviction session.
  _firstEvictable(activeLines) {
    const children = this.outputContainer.children;
    for (let i = 0; i < children.length; i++) {
      if (!activeLines.has(children[i])) {
        return children[i];
      }
    }
    return null;
  },

  _addLine(text, baseColor = 'var(--ext_kxTurboDev-term-text)') {
    const line = document.createElement('div');
    line.className = 'ext_kxTurboDev-terminal-line';

    // Add Indentation
    line.style.paddingLeft = `${this.indentLevel * 24}px`;

    if (this.loaderStack.length > 0) {
      line.setAttribute('data-ancestor-ids', this.loaderStack.map(l => l.groupId).join(' '));
    }

    // Add Timestamp
    if (this.systemSettings.showTimestamps) {
      this._appendTimestamp(line);
    }

    const textSpan = document.createElement('span');
    // Parse for custom formatting codes
    textSpan.innerHTML = this._parseFormatting(text);

    // Default styling is now handled by CSS var, no specific type class logic
    textSpan.style.color = baseColor;

    line.appendChild(textSpan);

    this.outputContainer.appendChild(line);

    // Limit line count to 500 to prevent lag (never evict active loader lines)
    if (this.outputContainer.children.length > 500) {
      const activeLines = new Set(this.loaderStack.map(l => l.line));
      while (this.outputContainer.children.length > 500) {
        const evicted = this._firstEvictable(activeLines);
        if (!evicted) break;
        const groupId = evicted.getAttribute && evicted.getAttribute('data-group-id');
        if (groupId) this._collapsedGroups.delete(groupId);
        this.outputContainer.removeChild(evicted);
      }
    }

    // Only auto-scroll if at bottom
    if (this.isAutoScrolling) {
      this._scrollToBottom();
    }
  },

  // --- Loading Group Logic ---

  _getSpriteName(util) {
    return (util && util.target && util.target.sprite && util.target.sprite.name) || '';
  },

  _addTaggedLine(icon, tagColor, serviceColor, spriteName, message) {
    const line = document.createElement('div');
    line.className = 'ext_kxTurboDev-terminal-line';

    line.style.paddingLeft = `${this.indentLevel * 24}px`;

    if (this.loaderStack.length > 0) {
      line.setAttribute('data-ancestor-ids', this.loaderStack.map(l => l.groupId).join(' '));
    }

    if (this.systemSettings.showTimestamps) {
      this._appendTimestamp(line);
    }

    const tagSpan = document.createElement('span');
    tagSpan.style.color = tagColor;
    tagSpan.textContent = icon + ' ';
    line.appendChild(tagSpan);

    if (spriteName) {
      const spriteSpan = document.createElement('span');
      spriteSpan.style.color = serviceColor;
      spriteSpan.textContent = spriteName + ': ';
      line.appendChild(spriteSpan);
    }

    const msgSpan = document.createElement('span');
    msgSpan.innerHTML = this._parseFormatting(message);
    msgSpan.style.color = 'var(--ext_kxTurboDev-term-text)';
    line.appendChild(msgSpan);

    this.outputContainer.appendChild(line);

    if (this.outputContainer.children.length > 500) {
      const activeLines = new Set(this.loaderStack.map(l => l.line));
      while (this.outputContainer.children.length > 500) {
        const evicted = this._firstEvictable(activeLines);
        if (!evicted) break;
        const groupId = evicted.getAttribute && evicted.getAttribute('data-group-id');
        if (groupId) this._collapsedGroups.delete(groupId);
        this.outputContainer.removeChild(evicted);
      }
    }

    if (this.isAutoScrolling) {
      this._scrollToBottom();
    }
  },

  _updateGroupVisibility() {
    this.outputContainer.querySelectorAll('[data-ancestor-ids]').forEach(el => {
      const ids = el.getAttribute('data-ancestor-ids').split(' ');
      const hidden = ids.some(id => this._collapsedGroups.has(id));
      el.style.display = hidden ? 'none' : '';
    });
  },

  _startLoadingGroup(spriteName, text) {
    const line = document.createElement('div');
    line.className =
      'ext_kxTurboDev-terminal-line ext_kxTurboDev-term-system ext_kxTurboDev-loader-sticky';

    // Generate unique group ID
    const groupId = `grp${++this._groupCounter}`;

    // Mark loader line as child of its parent loader (if nested)
    if (this.loaderStack.length > 0) {
      line.setAttribute('data-ancestor-ids', this.loaderStack.map(l => l.groupId).join(' '));
    }

    // Apply indentation
    line.style.paddingLeft = `${this.indentLevel * 24}px`;

    // Apply top offset for sticky nesting (approx 26px per level)
    line.style.top = `${this.indentLevel * 26}px`;

    // Add Timestamp
    const timestampsEnabled = this.systemSettings.showTimestamps;
    const startTime = new Date();
    if (timestampsEnabled) {
      this._appendTimestamp(line);
    }

    // Spinner Element (acts as the tag icon)
    const spinnerSpan = document.createElement('span');
    spinnerSpan.style.fontFamily = 'monospace';
    spinnerSpan.style.display = 'inline-block';
    spinnerSpan.style.width = '14px';
    spinnerSpan.style.marginRight = '8px';
    spinnerSpan.style.color = 'var(--ext_kxTurboDev-term-accent)';
    // Initial Frame (ASCII)
    spinnerSpan.textContent = this.ASCII_FRAMES[0];

    line.appendChild(spinnerSpan);

    if (spriteName) {
      const spriteSpan = document.createElement('span');
      spriteSpan.style.color = 'var(--ext_kxTurboDev-term-accent)';
      spriteSpan.style.opacity = '0.6';
      spriteSpan.textContent = spriteName + ': ';
      line.appendChild(spriteSpan);
    }

    const textSpan = document.createElement('span');
    textSpan.innerHTML = this._parseFormatting(text);

    line.appendChild(textSpan);

    // Progress bar (text-based, hidden until maxSteps > 0)
    const progressSpan = document.createElement('span');
    progressSpan.className = 'ext_kxTurboDev-loader-progress';
    progressSpan.style.display = 'none';
    line.appendChild(progressSpan);

    this.outputContainer.appendChild(line);

    // Enforce 500-line cap (same as _addLine / _addTaggedLine; never evict active loader lines)
    if (this.outputContainer.children.length > 500) {
      // Include `line` itself since it's not yet on loaderStack
      const activeLines = new Set([...this.loaderStack.map(l => l.line), line]);
      while (this.outputContainer.children.length > 500) {
        const evicted = this._firstEvictable(activeLines);
        if (!evicted) break;
        const gid = evicted.getAttribute && evicted.getAttribute('data-group-id');
        if (gid) this._collapsedGroups.delete(gid);
        this.outputContainer.removeChild(evicted);
      }
    }

    if (this.isAutoScrolling) {
      this._scrollToBottom();
    }

    // Start Animation
    let frame = 0;
    const interval = setInterval(() => {
      frame = (frame + 1) % this.ASCII_FRAMES.length;
      spinnerSpan.textContent = this.ASCII_FRAMES[frame];
    }, 100);

    // Push to stack to track this loader
    this.loaderStack.push({
      line: line,
      spinner: spinnerSpan,
      interval: interval,
      startTime: startTime,
      timestampsEnabled: timestampsEnabled,
      groupId: groupId,
      step: 0,
      maxSteps: 0,
      progressSpan: progressSpan,
    });

    // Increase indentation for subsequent logs
    this.indentLevel++;
  },

  _updateLoadingProgress(loader) {
    if (loader.maxSteps <= 0) {
      loader.progressSpan.style.display = 'none';
      return;
    }
    const pct = Math.min(100, Math.round((loader.step / loader.maxSteps) * 100));
    const total = 20;
    const filled = Math.round((pct / 100) * total);
    const bar = '\u2588'.repeat(filled) + '\u2592'.repeat(total - filled);
    loader.progressSpan.textContent = `${bar} ${pct}%`;
    loader.progressSpan.style.display = '';
  },

  _finishLoadingGroup(icon, tagColor, serviceColor, spriteName, message) {
    if (this.loaderStack.length === 0) return false;

    const loader = this.loaderStack.pop();
    clearInterval(loader.interval);

    // Remove sticky behavior
    loader.line.classList.remove('ext_kxTurboDev-loader-sticky');
    loader.line.style.top = '';

    // Decrease indentation
    this.indentLevel = Math.max(0, this.indentLevel - 1);

    // Replace the loader line in-place with the done/error tagged line format
    loader.line.replaceChildren();
    loader.line.className = 'ext_kxTurboDev-terminal-line';
    // Tag the finished group line so eviction can purge its collapse state
    loader.line.setAttribute('data-group-id', loader.groupId);

    // Re-add the original start timestamp and elapsed duration
    if (loader.timestampsEnabled && loader.startTime) {
      const timeSpan = document.createElement('span');
      timeSpan.className = 'ext_kxTurboDev-log-time';
      timeSpan.textContent = `[${loader.startTime.toLocaleTimeString('en-US', { hour12: false })}] `;
      loader.line.appendChild(timeSpan);
    }

    const tagSpan = document.createElement('span');
    tagSpan.style.color = tagColor;
    tagSpan.textContent = icon + ' ';
    loader.line.appendChild(tagSpan);

    if (spriteName) {
      const spriteSpan = document.createElement('span');
      spriteSpan.style.color = serviceColor;
      spriteSpan.textContent = spriteName + ': ';
      loader.line.appendChild(spriteSpan);
    }

    const msgSpan = document.createElement('span');
    msgSpan.innerHTML = this._parseFormatting(message);
    msgSpan.style.color = 'var(--ext_kxTurboDev-term-text)';
    loader.line.appendChild(msgSpan);

    // Append elapsed duration (always shown since startTime is always captured)
    const elapsed = Date.now() - loader.startTime.getTime();
    const durationSpan = document.createElement('span');
    durationSpan.className = 'ext_kxTurboDev-log-time';
    durationSpan.textContent = ` (${elapsed}ms)`;
    loader.line.appendChild(durationSpan);

    // Add collapse/expand toggle for child lines
    const groupId = loader.groupId;
    const toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'ext_kxTurboDev-group-toggle';
    toggleBtn.title = 'Expand/collapse group logs';
    toggleBtn.setAttribute('aria-label', 'Expand/collapse group logs');
    toggleBtn.setAttribute('aria-expanded', 'false');
    toggleBtn.textContent = '▸';
    loader.line.appendChild(toggleBtn);

    // Collapse children immediately on finish
    this._collapsedGroups.add(groupId);
    this._updateGroupVisibility();

    toggleBtn.addEventListener('click', () => {
      if (this._collapsedGroups.has(groupId)) {
        this._collapsedGroups.delete(groupId);
        toggleBtn.textContent = '▾';
        toggleBtn.setAttribute('aria-expanded', 'true');
      } else {
        this._collapsedGroups.add(groupId);
        toggleBtn.textContent = '▸';
        toggleBtn.setAttribute('aria-expanded', 'false');
      }
      this._updateGroupVisibility();
    });

    return true;
  }
});
