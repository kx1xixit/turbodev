import { TurboDevExtension } from './03-class.js';

/* global FLAG_NAME_RE */

// --- Block Implementations ---
Object.assign(TurboDevExtension.prototype, {
  runCommand(args) {
    const echo = args.ECHO === 'yes' || args.ECHO === true || args.ECHO === 'true';
    this._handleCommand(String(args.COMMAND), echo);
  },

  queryText(args, util) {
    // Settle any previous pending query before starting a new one
    this._cancelPendingQuery();

    const prompt = String(args.TEXT);
    const type = args.TYPE;
    const sprite = this._getSpriteName(util);

    // Show terminal if hidden
    if (!this.isVisible) this.showTerminal();

    // Temporarily enable command bar for query if it was disabled
    const wasCommandBarDisabled = !this.commandBarEnabled;
    if (wasCommandBarDisabled) this._setCommandBarEnabled(true);

    this._addTaggedLine('{ ? }', '#C678DD', '#9B5EB0', sprite, prompt);
    this.promptLabel.textContent = '?'; // Visual cue
    this.inputField.focus(); // Focus input

    return new Promise(resolve => {
      this.pendingQuery = {
        type: type,
        resolve: resolve,
        wasCommandBarDisabled: wasCommandBarDisabled,
      };
    });
  },

  getAnswer() {
    return this.userAnswer;
  },

  getCommandArg(args) {
    const index = parseInt(args.INDEX) || 0;
    if (index < 1 || index > this.currentCommandArgs.length) return '';
    return this.currentCommandArgs[index - 1] || '';
  },

  getArgumentCount() {
    return this.currentCommandArgs.length;
  },

  getNamedArg(args) {
    const name = String(args.NAME).trim().toLowerCase();
    // Check flags first
    if (Object.prototype.hasOwnProperty.call(this.currentCommandFlags, name)) {
      return String(this.currentCommandFlags[name]);
    }
    // Fall back to positional arg by registered name
    const cmdData = this.registeredCommands.get(this.currentCommandName);
    if (!cmdData) return '';
    let definedArgs;
    if (
      this.currentSubcommandName &&
      cmdData.subcommands &&
      cmdData.subcommands.has(this.currentSubcommandName)
    ) {
      definedArgs = cmdData.subcommands.get(this.currentSubcommandName).args || [];
    } else {
      definedArgs = cmdData.args || [];
    }
    const idx = definedArgs.findIndex(a => a.name.toLowerCase() === name);
    if (idx === -1) return '';
    return this.currentCommandArgs[idx] !== undefined ? String(this.currentCommandArgs[idx]) : '';
  },

  getFlag(args) {
    const name = String(args.NAME).trim().toLowerCase();
    return Object.prototype.hasOwnProperty.call(this.currentCommandFlags, name)
      ? String(this.currentCommandFlags[name])
      : '';
  },

  hasFlag(args) {
    const name = String(args.NAME).trim().toLowerCase();
    return Object.prototype.hasOwnProperty.call(this.currentCommandFlags, name);
  },

  whenCommandReceived() {
    // Return the trigger state - effectively polling + event support
    return this._triggerHat;
  },

  whenSpecificCommandReceived(args) {
    // Changed to HAT block logic: manual check inside function
    if (!this._triggerHat) return false;
    // Check if the command matches (case-insensitive)
    return this.currentCommandName.toLowerCase() === String(args.CMD).toLowerCase();
  },

  whenSubcommandReceived(args) {
    if (!this._triggerHat) return false;
    const parent = String(args.PARENT).toLowerCase();
    const sub = String(args.SUB).toLowerCase();
    return (
      this.currentCommandName.toLowerCase() === parent &&
      this.currentSubcommandName.toLowerCase() === sub
    );
  },

  getCurrentSubcommand() {
    return this.currentSubcommandName;
  },

  registerCommand(args) {
    const name = String(args.NAME).trim();
    const desc = String(args.DESC);

    const protectedCmds = [
      'help',
      'clear',
      'sysinfo',
      'history',
      'echo',
      'theme',
      'listvars',
      'listsprites',
    ];
    if (protectedCmds.includes(name)) {
      this._addLine(`@c #f1c40f:Warning: Cannot overwrite protected command '${name}'.@c`);
      return;
    }

    if (name) {
      if (this.registeredCommands.has(name)) {
        // preserve args and flags if re-registering just description
        const existing = this.registeredCommands.get(name);
        this.registeredCommands.set(name, {
          desc: desc,
          args: existing.args,
          subcommands: existing.subcommands || new Map(),
          flags: existing.flags || [],
        });
      } else {
        this.registeredCommands.set(name, { desc: desc, args: [], subcommands: new Map(), flags: [] });
      }
    }
  },

  registerCommandArg(args) {
    const cmd = String(args.CMD).trim();
    if (!this.registeredCommands.has(cmd)) return;

    const argData = {
      name: String(args.NAME),
      type: String(args.TYPE),
      optional: args.REQ !== 'yes' && args.REQ !== 'true' && args.REQ !== true, // Scratch bool weirdness
    };

    const entry = this.registeredCommands.get(cmd);
    // Avoid duplicate args with same name
    const exists = entry.args.find(a => a.name === argData.name);
    if (!exists) {
      entry.args.push(argData);
    }
  },

  registerSubcommand(args) {
    const parent = String(args.PARENT).trim();
    const name = String(args.NAME).trim().toLowerCase();
    const desc = String(args.DESC);

    if (!this.registeredCommands.has(parent)) {
      this._addLine(`@c #f1c40f:Warning: Parent command '${parent}' not registered.@c`);
      return;
    }
    if (!name) return;

    const entry = this.registeredCommands.get(parent);
    if (!entry.subcommands) entry.subcommands = new Map();
    if (!entry.subcommands.has(name)) {
      entry.subcommands.set(name, { desc: desc, args: [], flags: [] });
    } else {
      // Update description only
      entry.subcommands.get(name).desc = desc;
    }
  },

  registerSubcommandArg(args) {
    const parent = String(args.PARENT).trim();
    const sub = String(args.SUB).trim().toLowerCase();
    if (!this.registeredCommands.has(parent)) return;
    const entry = this.registeredCommands.get(parent);
    if (!entry.subcommands || !entry.subcommands.has(sub)) return;

    const argData = {
      name: String(args.NAME),
      type: String(args.TYPE),
      optional: args.REQ !== 'yes' && args.REQ !== 'true' && args.REQ !== true, // Scratch bool weirdness
    };

    const subEntry = entry.subcommands.get(sub);
    const exists = subEntry.args.find(a => a.name === argData.name);
    if (!exists) {
      subEntry.args.push(argData);
    }
  },

  registerCommandFlag(args) {
    const cmd = String(args.CMD).trim();
    if (!this.registeredCommands.has(cmd)) return;

    // Strip optional leading '--' and validate against the same regex as _parseFlags
    const rawName = String(args.NAME).trim().replace(/^--/, '').toLowerCase();
    if (!FLAG_NAME_RE.test(rawName)) {
      const displayName = String(args.NAME).trim().replace(/@/g, '');
      this._addLine(
        `Warning: '${displayName}' is not a valid flag name. Use letters, digits, and hyphens only (must start with a letter or digit).`,
        '#f1c40f'
      );
      return;
    }

    const flagData = { name: rawName, desc: String(args.DESC) };

    const entry = this.registeredCommands.get(cmd);
    if (!entry.flags) entry.flags = [];
    const exists = entry.flags.find(f => f.name === rawName);
    if (!exists) {
      entry.flags.push(flagData);
    }
  },

  registerSubcommandFlag(args) {
    const parent = String(args.PARENT).trim();
    const sub = String(args.SUB).trim().toLowerCase();
    if (!this.registeredCommands.has(parent)) return;
    const entry = this.registeredCommands.get(parent);
    if (!entry.subcommands || !entry.subcommands.has(sub)) return;

    // Strip optional leading '--' and validate against the same regex as _parseFlags
    const rawName = String(args.NAME).trim().replace(/^--/, '').toLowerCase();
    if (!FLAG_NAME_RE.test(rawName)) {
      const displayName = String(args.NAME).trim().replace(/@/g, '');
      this._addLine(
        `Warning: '${displayName}' is not a valid flag name. Use letters, digits, and hyphens only (must start with a letter or digit).`,
        '#f1c40f'
      );
      return;
    }

    const flagData = { name: rawName, desc: String(args.DESC) };

    const subEntry = entry.subcommands.get(sub);
    if (!subEntry.flags) subEntry.flags = [];
    const exists = subEntry.flags.find(f => f.name === rawName);
    if (!exists) {
      subEntry.flags.push(flagData);
    }
  },

  // New Settings Blocks
  registerSettingToggle(args) {
    const id = String(args.ID);

    // Protect against Spam
    if (this.customSettings.size >= this.MAX_SETTINGS) return;

    if (!this.customSettings.has(id)) {
      this.customSettings.set(id, {
        type: 'toggle',
        name: String(args.NAME),
        value: args.DEF === 'yes' || args.DEF === true || String(args.DEF).toLowerCase() === 'true', // Bug fix
      });
    }
  },

  registerSettingSlider(args) {
    const id = String(args.ID);

    // Protect against Spam
    if (this.customSettings.size >= this.MAX_SETTINGS) return;

    if (!this.customSettings.has(id)) {
      this.customSettings.set(id, {
        type: 'slider',
        name: String(args.NAME),
        min: parseFloat(args.MIN),
        max: parseFloat(args.MAX),
        value: parseFloat(args.DEF),
      });
    }
  },

  registerSettingInput(args) {
    const id = String(args.ID);

    // Protect against Spam
    if (this.customSettings.size >= this.MAX_SETTINGS) return;

    if (!this.customSettings.has(id)) {
      this.customSettings.set(id, {
        type: 'text',
        name: String(args.NAME),
        value: String(args.DEF),
      });
    }
  },

  getSettingValue(args) {
    const id = String(args.ID);
    if (this.customSettings.has(id)) {
      return this.customSettings.get(id).value;
    }
    return '';
  },

  showTerminal() {
    if (!this.container) this._createUI();
    this.container.style.display = 'flex';
    this.isVisible = true;
    this.container.style.animation = 'none';
    this.container.offsetHeight;
    this.container.style.animation =
      'ext_kxTurboDevTermSlideIn 0.25s cubic-bezier(0.19, 1, 0.22, 1)';

    // Resume perf loop if mode is active
    if (this.isPerfMode) this._startPerfLoop();

    setTimeout(() => this.inputField.focus(), 50);
  },

  hideTerminal() {
    if (this.container) {
      this.container.style.display = 'none';
      this.isVisible = false;
      this.settingsPanel.classList.remove('open');

      // Safety: Resolve any pending query to unblock thread
      this._cancelPendingQuery();
      this._stopPerfLoop();
    }
  },

  clearTerminal() {
    if (this.outputContainer) {
      this.outputContainer.innerHTML = '';
    }
    this.indentLevel = 0;
    this.loaderStack.forEach(l => clearInterval(l.interval));
    this.loaderStack = [];
    this._collapsedGroups.clear();
    this._groupCounter = 0;

    // Safety: Resolve any pending query
    this._cancelPendingQuery();
  },

  printText(args) {
    // Ensure string conversion to prevent crashes if input is null/undefined
    this._addLine(String(args.TEXT));
  },

  logText(args, util) {
    const type = String(args.TYPE);
    const text = String(args.TEXT);
    const sprite = this._getSpriteName(util);
    switch (type) {
      case 'hint':
        this._addTaggedLine('[ i ]', '#56B6C2', '#3E8A93', sprite, text);
        break;
      case 'warn':
        this._addTaggedLine('[ ! ]', '#E5C07B', '#B3965D', sprite, text);
        break;
      case 'error':
        if (!this._finishLoadingGroup('[ X ]', '#E06C75', '#B0555C', sprite, text)) {
          this._addTaggedLine('[ X ]', '#E06C75', '#B0555C', sprite, text);
        }
        break;
      case 'verbose':
        if (!this.verboseLogging) return;
        this._addTaggedLine('( . )', '#5C6370', '#444B56', sprite, text);
        break;
      case 'done':
        if (!this._finishLoadingGroup('[ # ]', '#A6E22E', '#7EAD23', sprite, text)) {
          this._addTaggedLine('[ # ]', '#A6E22E', '#7EAD23', sprite, text);
        }
        break;
      case 'load':
        this._startLoadingGroup(sprite, text);
        break;
      case 'headless':
        this._addLine(text);
        break;
      default:
        this._addTaggedLine('( i )', '#61AFEF', '#4A89C5', sprite, text);
    }
  },

  setPrompt(args) {
    this.customPrompt = String(args.TEXT);
    if (this.promptLabel) {
      this.promptLabel.textContent = this.customPrompt;
    }
  },

  setLoadingStep(args) {
    if (this.loaderStack.length === 0) return;
    const loader = this.loaderStack[this.loaderStack.length - 1];
    loader.step = Math.max(0, Number(args.STEP) || 0);
    this._updateLoadingProgress(loader);
  },

  setLoadingMaxSteps(args) {
    if (this.loaderStack.length === 0) return;
    const loader = this.loaderStack[this.loaderStack.length - 1];
    loader.maxSteps = Math.max(0, Number(args.STEPS) || 0);
    this._updateLoadingProgress(loader);
  },

  changeLoadingStep(args) {
    if (this.loaderStack.length === 0) return;
    const loader = this.loaderStack[this.loaderStack.length - 1];
    if (String(args.DIRECTION).toLowerCase() === 'decrease') {
      loader.step = Math.max(0, loader.step - 1);
    } else {
      loader.step =
        loader.maxSteps > 0 ? Math.min(loader.maxSteps, loader.step + 1) : loader.step + 1;
    }
    this._updateLoadingProgress(loader);
  },

  getLastCommand() {
    return this.lastCommand || '';
  },

  isTerminalOpen() {
    return this.isVisible;
  },

  getTerminalText() {
    if (!this.outputContainer) return '';
    return Array.from(this.outputContainer.children)
      .map(line => line.textContent)
      .join('\n');
  },

  setCommandBarEnabled(args) {
    const enabled = args.ENABLED === true || String(args.ENABLED).toLowerCase() === 'true';
    this._setCommandBarEnabled(enabled);
  }
});
