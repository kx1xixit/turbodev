/* global vm */

export class TurboDevExtension {
  constructor() {
    this.container = null;
    this.outputContainer = null;
    this.perfContainer = null;
    this.inputField = null;
    this.hintLabel = null; // New UI Element
    this.settingsPanel = null;
    this.scrollBtn = null;
    this.settingsBtn = null;
    this.perfBtn = null;
    this.toast = null;

    this.isVisible = false;
    this.isMinimized = false;
    this.isAutoScrolling = true;
    this.isPerfMode = false;

    // Command State
    this.lastCommand = '';
    this.commandHistory = [];
    this.historyIndex = -1;
    this.currentCommandName = ''; // For introspection
    this.currentCommandArgs = []; // For introspection
    this.currentSubcommandName = ''; // For introspection
    this.currentCommandFlags = {}; // For introspection

    // Loop IDs
    this.cliReqId = null;
    this.scrollReqId = null;
    this.perfReqId = null;

    // Performance Data
    this.perfData = {
      fps: new Array(50).fill(0),
      clones: new Array(50).fill(0),
      lastTime: performance.now(),
      frameCount: 0,
      fpsValue: 0,
    };
    this.perfCanvas = null;
    this.perfCtx = null;

    // Core System Settings
    this.systemSettings = {
      fontSize: 13,
      opacity: 1.0,
      cliMode: false,
      trueTuiMode: false,
      showTimestamps: false,
      theme: 'standard',
    };

    this.prevRect = null;
    this.customSettings = new Map();
    this.aliases = new Map(); // Store aliases

    // Default Aliases
    this.aliases.set('cls', 'clear');
    this.aliases.set('?', 'help');
    this.aliases.set('man', 'help');

    // Locking State
    this.lockedSettings = new Set();
    this.isSettingsMenuLocked = false;

    // Command Registry: Key = Name, Value = { desc: string, args: [] }
    this.registeredCommands = new Map();
    // Pre-populate built-ins (args array matches format: { name, type, optional })
    this._registerBuiltIn('help', 'Lists available commands or detailed help', [
      { name: 'command', type: 'string', optional: true },
    ]);
    this._registerBuiltIn('clear', 'Clears the terminal output');
    this._registerBuiltIn('sysinfo', 'Displays system statistics');
    this._registerBuiltIn('history', 'Shows command history');
    this._registerBuiltIn('echo', 'Prints text back to console', [
      { name: 'text', type: 'string', optional: false },
    ]);
    this._registerBuiltIn('theme', 'Sets theme', [
      { name: 'name', type: 'string', optional: false },
    ]);
    this._registerBuiltIn('listvars', 'Lists global variables');
    this._registerBuiltIn('listsprites', 'Lists sprites and clones');
    this._registerBuiltIn('settings', 'View or change system settings');
    const settingsEntry = this.registeredCommands.get('settings');
    settingsEntry.subcommands.set('get', {
      desc: 'Get a setting value',
      args: [{ name: 'key', type: 'string', optional: false }],
      flags: [],
    });
    settingsEntry.subcommands.set('set', {
      desc: 'Set a setting value',
      args: [
        { name: 'key', type: 'string', optional: false },
        { name: 'value', type: 'string', optional: false },
      ],
      flags: [],
    });

    // Query state
    this.pendingQuery = null;
    this.userAnswer = '';
    this.customPrompt = '>';

    // Command Bar state
    this.commandBarEnabled = true;

    // Hybrid Trigger for Hat Block
    this._triggerHat = false;

    // Verbose logging toggle (per-project)
    this.verboseLogging = false;

    this.indentLevel = 0;
    this.loaderStack = [];
    this.ASCII_FRAMES = ['|', '/', '-', '\\'];
    this._groupCounter = 0;
    this._collapsedGroups = new Set();

    // Caps
    this.MAX_HISTORY = 50;
    this.MAX_SETTINGS = 100;

    // Cleanup & Bindings
    this.boundKeyDown = this._handleKeyDown.bind(this);
    this.boundStopAll = this._onStopAll.bind(this);
    this.boundCliScroll = this._onCliScroll.bind(this);
    this.boundTuiScroll = this._onTuiScroll.bind(this);
    this.boundUpdateTuiPosition = this._updateTuiPosition.bind(this);

    // CRITICAL FIX: Bind block methods to 'this'
    this.logText = this.logText.bind(this);
    this.getLastCommand = this.getLastCommand.bind(this);
    this.getAnswer = this.getAnswer.bind(this);
    this.getTerminalText = this.getTerminalText.bind(this);
    this.getSettingValue = this.getSettingValue.bind(this);
    this.queryText = this.queryText.bind(this);
    this.runCommand = this.runCommand.bind(this);
    this.getArgumentCount = this.getArgumentCount.bind(this);
    this.whenSpecificCommandReceived = this.whenSpecificCommandReceived.bind(this);
    this.registerSubcommand = this.registerSubcommand.bind(this);
    this.registerSubcommandArg = this.registerSubcommandArg.bind(this);
    this.registerCommandFlag = this.registerCommandFlag.bind(this);
    this.registerSubcommandFlag = this.registerSubcommandFlag.bind(this);
    this.whenSubcommandReceived = this.whenSubcommandReceived.bind(this);
    this.getCurrentSubcommand = this.getCurrentSubcommand.bind(this);
    this.getFlag = this.getFlag.bind(this);
    this.hasFlag = this.hasFlag.bind(this);
    this.getNamedArg = this.getNamedArg.bind(this);
    this.setLoadingStep = this.setLoadingStep.bind(this);
    this.setLoadingMaxSteps = this.setLoadingMaxSteps.bind(this);
    this.changeLoadingStep = this.changeLoadingStep.bind(this);

    this._loadSettings();
    this._loadProjectSettings();
    this._createUI();
    this._setupGlobalHotkeys();

    // Use off/on to prevent stacking (defensive)
    vm.runtime.off('PROJECT_STOP_ALL', this.boundStopAll);
    vm.runtime.on('PROJECT_STOP_ALL', this.boundStopAll);

    // Start Perf Loop
    requestAnimationFrame(this._loopPerformance.bind(this));

    // Register Global Instance and Runtime Instance with kxTurboDev namespace
    Scratch.vm.runtime.ext_kxTurboDev = this;
    Scratch.vm.runtime.__TurboDev = this; // Explicit request
    window.__TurboDev = this; // Maintain existing behavior
  }

  _registerBuiltIn(name, desc, args = []) {
    this.registeredCommands.set(name, {
      desc: desc,
      args: args,
      subcommands: new Map(),
      flags: [],
    });
  }

  // Calculate Levenshtein Distance for fuzzy matching
  _levenshtein(a, b) {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) == a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[b.length][a.length];
  }

  dispose() {
    if (this.container) this.container.remove();
    if (document.getElementById('ext_kxTurboDev-terminal-extension-style')) {
      document.getElementById('ext_kxTurboDev-terminal-extension-style').remove();
    }

    document.removeEventListener('keydown', this.boundKeyDown);
    vm.runtime.off('PROJECT_STOP_ALL', this.boundStopAll);
    window.removeEventListener('scroll', this.boundCliScroll, { capture: true, passive: true });
    window.removeEventListener('scroll', this.boundTuiScroll, { capture: true, passive: true });

    this._cancelPendingQuery();

    if (this.cliReqId) cancelAnimationFrame(this.cliReqId);
    if (this.tuiReqId) cancelAnimationFrame(this.tuiReqId);
    if (this.scrollReqId) cancelAnimationFrame(this.scrollReqId);
    this._stopPerfLoop();

    for (const l of this.loaderStack) {
      clearInterval(l.interval);
    }
    this.loaderStack = [];
    this._collapsedGroups.clear();
    this._groupCounter = 0;

    this.isPerfMode = false;
    this.isVisible = false;

    // Clean up globals
    if (window.__TurboDev === this) {
      delete window.__TurboDev;
    }
    if (Scratch.vm.runtime.ext_kxTurboDev === this) {
      delete Scratch.vm.runtime.ext_kxTurboDev;
    }
    if (Scratch.vm.runtime.__TurboDev === this) {
      delete Scratch.vm.runtime.__TurboDev;
    }
  }

  _loadSettings() {
    try {
      // Updated storage key to match namespace
      const stored = localStorage.getItem('ext_kxTurboDev_settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.systemSettings = { ...this.systemSettings, ...parsed };
      }
    } catch (e) {
      console.warn('TurboDev: Failed to load settings', e);
    }
  }

  _saveSettings() {
    try {
      localStorage.setItem('ext_kxTurboDev_settings', JSON.stringify(this.systemSettings));
    } catch (e) {
      console.warn('TurboDev: Failed to save settings', e);
    }
  }

  _getProjectKey() {
    return `ext_kxTurboDev_proj_${window.location.pathname}`;
  }

  _loadProjectSettings() {
    try {
      const stored = localStorage.getItem(this._getProjectKey());
      if (stored) {
        const parsed = JSON.parse(stored);
        this.verboseLogging = !!parsed.verboseLogging;
      }
    } catch (e) {
      console.warn('TurboDev: Failed to load project settings', e);
    }
  }

  _saveProjectSettings() {
    try {
      localStorage.setItem(
        this._getProjectKey(),
        JSON.stringify({ verboseLogging: this.verboseLogging })
      );
    } catch (e) {
      console.warn('TurboDev: Failed to save project settings', e);
    }
  }

  getInfo() {
    return {
      id: 'kxTurboDev',
      name: 'TurboDev',
      color1: '#3498db',
      color2: '#2872a3',
      color3: '#10496f',
      blocks: [
        { blockType: Scratch.BlockType.LABEL, text: Scratch.translate('Terminal') },
        {
          opcode: 'showTerminal',
          blockType: Scratch.BlockType.COMMAND,
          text: 'show terminal',
        },
        {
          opcode: 'hideTerminal',
          blockType: Scratch.BlockType.COMMAND,
          text: 'hide terminal',
        },
        {
          opcode: 'clearTerminal',
          blockType: Scratch.BlockType.COMMAND,
          text: 'clear terminal',
        },
        {
          opcode: 'isTerminalOpen',
          blockType: Scratch.BlockType.BOOLEAN,
          text: 'is terminal open?',
        },
        {
          opcode: 'getTerminalText',
          blockType: Scratch.BlockType.REPORTER,
          text: 'terminal contents',
        },
        { blockType: Scratch.BlockType.LABEL, text: Scratch.translate('Logging') },
        {
          opcode: 'logText',
          blockType: Scratch.BlockType.COMMAND,
          text: 'log [TYPE] [TEXT]',
          arguments: {
            TYPE: { type: Scratch.ArgumentType.STRING, menu: 'LOG_LEVELS', defaultValue: 'log' },
            TEXT: { type: Scratch.ArgumentType.STRING, defaultValue: 'System Ready...' },
          },
        },
        {
          opcode: 'setLoadingStep',
          blockType: Scratch.BlockType.COMMAND,
          text: 'set loading step to [STEP]',
          arguments: {
            STEP: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
          },
        },
        {
          opcode: 'setLoadingMaxSteps',
          blockType: Scratch.BlockType.COMMAND,
          text: 'set loading max steps to [STEPS]',
          arguments: {
            STEPS: { type: Scratch.ArgumentType.NUMBER, defaultValue: 10 },
          },
        },
        {
          opcode: 'changeLoadingStep',
          blockType: Scratch.BlockType.COMMAND,
          text: '[DIRECTION] step counter',
          arguments: {
            DIRECTION: {
              type: Scratch.ArgumentType.STRING,
              menu: 'STEP_DIRECTION',
              defaultValue: 'increase',
            },
          },
        },
        {
          opcode: 'setPrompt',
          blockType: Scratch.BlockType.COMMAND,
          text: 'set prompt to [TEXT]',
          arguments: {
            TEXT: { type: Scratch.ArgumentType.STRING, defaultValue: '>' },
          },
        },
        { blockType: Scratch.BlockType.LABEL, text: Scratch.translate('Input') },
        {
          opcode: 'queryText',
          blockType: Scratch.BlockType.COMMAND,
          text: 'query [TEXT] expecting [TYPE]',
          arguments: {
            TEXT: { type: Scratch.ArgumentType.STRING, defaultValue: 'Confirm action?' },
            TYPE: {
              type: Scratch.ArgumentType.STRING,
              menu: 'QUERY_TYPES',
              defaultValue: 'confirmation',
            },
          },
        },
        {
          opcode: 'getAnswer',
          blockType: Scratch.BlockType.REPORTER,
          text: 'last answer',
        },
        {
          opcode: 'setCommandBarEnabled',
          blockType: Scratch.BlockType.COMMAND,
          text: 'set command bar enabled [ENABLED]',
          arguments: {
            ENABLED: { type: Scratch.ArgumentType.STRING, defaultValue: 'true' },
          },
        },
        {
          opcode: 'runCommand',
          blockType: Scratch.BlockType.COMMAND,
          text: 'run command [COMMAND] echo to log [ECHO]',
          arguments: {
            COMMAND: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'help',
            },
            ECHO: {
              type: Scratch.ArgumentType.STRING,
              menu: 'YES_NO',
              defaultValue: 'no',
            },
          },
        },
        { blockType: Scratch.BlockType.LABEL, text: Scratch.translate('Commands') },
        {
          opcode: 'registerCommand',
          blockType: Scratch.BlockType.COMMAND,
          text: 'register command [NAME] description [DESC]',
          arguments: {
            NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'spawn' },
            DESC: { type: Scratch.ArgumentType.STRING, defaultValue: 'Spawns an enemy' },
          },
        },
        {
          opcode: 'registerCommandArg',
          blockType: Scratch.BlockType.COMMAND,
          text: 'define argument [NAME] for [CMD] type [TYPE] is required? [REQ]',
          arguments: {
            NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'count' },
            CMD: { type: Scratch.ArgumentType.STRING, defaultValue: 'spawn' },
            TYPE: { type: Scratch.ArgumentType.STRING, menu: 'ARG_TYPES', defaultValue: 'number' },
            REQ: { type: Scratch.ArgumentType.STRING, menu: 'YES_NO', defaultValue: 'yes' },
          },
        },
        {
          opcode: 'registerCommandFlag',
          blockType: Scratch.BlockType.COMMAND,
          text: 'define flag [NAME] for [CMD] description [DESC]',
          arguments: {
            NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'verbose' },
            CMD: { type: Scratch.ArgumentType.STRING, defaultValue: 'spawn' },
            DESC: { type: Scratch.ArgumentType.STRING, defaultValue: 'Enable verbose output' },
          },
        },
        {
          opcode: 'whenCommandReceived',
          blockType: Scratch.BlockType.EVENT,
          text: 'when any command received',
          isEdgeActivated: false,
        },
        {
          opcode: 'whenSpecificCommandReceived',
          blockType: Scratch.BlockType.HAT,
          text: 'when command [CMD] received',
          arguments: {
            CMD: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'spawn',
            },
          },
        },
        {
          opcode: 'getLastCommand',
          blockType: Scratch.BlockType.REPORTER,
          text: 'last command name',
        },
        {
          opcode: 'getCommandArg',
          blockType: Scratch.BlockType.REPORTER,
          text: 'argument [INDEX] of command',
          arguments: {
            INDEX: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
          },
        },
        {
          opcode: 'getArgumentCount',
          blockType: Scratch.BlockType.REPORTER,
          text: 'number of arguments',
        },
        {
          opcode: 'getNamedArg',
          blockType: Scratch.BlockType.REPORTER,
          text: 'argument named [NAME] of command',
          arguments: {
            NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'count' },
          },
        },
        {
          opcode: 'getFlag',
          blockType: Scratch.BlockType.REPORTER,
          text: 'flag [NAME] value',
          arguments: {
            NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'verbose' },
          },
        },
        {
          opcode: 'hasFlag',
          blockType: Scratch.BlockType.BOOLEAN,
          text: 'has flag [NAME]?',
          arguments: {
            NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'verbose' },
          },
        },
        { blockType: Scratch.BlockType.LABEL, text: Scratch.translate('Subcommands') },
        {
          opcode: 'registerSubcommand',
          blockType: Scratch.BlockType.COMMAND,
          text: 'register subcommand [NAME] of [PARENT] description [DESC]',
          arguments: {
            NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'enemy' },
            PARENT: { type: Scratch.ArgumentType.STRING, defaultValue: 'spawn' },
            DESC: { type: Scratch.ArgumentType.STRING, defaultValue: 'Spawns an enemy' },
          },
        },
        {
          opcode: 'registerSubcommandArg',
          blockType: Scratch.BlockType.COMMAND,
          text: 'define argument [NAME] for subcommand [SUB] of [PARENT] type [TYPE] is required? [REQ]',
          arguments: {
            NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'count' },
            SUB: { type: Scratch.ArgumentType.STRING, defaultValue: 'enemy' },
            PARENT: { type: Scratch.ArgumentType.STRING, defaultValue: 'spawn' },
            TYPE: { type: Scratch.ArgumentType.STRING, menu: 'ARG_TYPES', defaultValue: 'number' },
            REQ: { type: Scratch.ArgumentType.STRING, menu: 'YES_NO', defaultValue: 'yes' },
          },
        },
        {
          opcode: 'registerSubcommandFlag',
          blockType: Scratch.BlockType.COMMAND,
          text: 'define flag [NAME] for subcommand [SUB] of [PARENT] description [DESC]',
          arguments: {
            NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'verbose' },
            SUB: { type: Scratch.ArgumentType.STRING, defaultValue: 'enemy' },
            PARENT: { type: Scratch.ArgumentType.STRING, defaultValue: 'spawn' },
            DESC: { type: Scratch.ArgumentType.STRING, defaultValue: 'Enable verbose output' },
          },
        },
        {
          opcode: 'whenSubcommandReceived',
          blockType: Scratch.BlockType.HAT,
          text: 'when subcommand [SUB] of [PARENT] received',
          arguments: {
            SUB: { type: Scratch.ArgumentType.STRING, defaultValue: 'enemy' },
            PARENT: { type: Scratch.ArgumentType.STRING, defaultValue: 'spawn' },
          },
        },
        {
          opcode: 'getCurrentSubcommand',
          blockType: Scratch.BlockType.REPORTER,
          text: 'current subcommand',
        },
        { blockType: Scratch.BlockType.LABEL, text: Scratch.translate('User Settings') },
        {
          opcode: 'registerSettingToggle',
          blockType: Scratch.BlockType.COMMAND,
          text: 'register toggle setting [ID] name [NAME] default [DEF]',
          arguments: {
            ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'darkMode' },
            NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'Dark Mode' },
            DEF: { type: Scratch.ArgumentType.STRING, menu: 'YES_NO', defaultValue: 'no' },
          },
        },
        {
          opcode: 'registerSettingSlider',
          blockType: Scratch.BlockType.COMMAND,
          text: 'register slider setting [ID] name [NAME] min [MIN] max [MAX] default [DEF]',
          arguments: {
            ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'volume' },
            NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'Volume' },
            MIN: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
            MAX: { type: Scratch.ArgumentType.NUMBER, defaultValue: 100 },
            DEF: { type: Scratch.ArgumentType.NUMBER, defaultValue: 50 },
          },
        },
        {
          opcode: 'registerSettingInput',
          blockType: Scratch.BlockType.COMMAND,
          text: 'register text setting [ID] name [NAME] default [DEF]',
          arguments: {
            ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'playerName' },
            NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'Player Name' },
            DEF: { type: Scratch.ArgumentType.STRING, defaultValue: 'Guest' },
          },
        },
        {
          opcode: 'getSettingValue',
          blockType: Scratch.BlockType.REPORTER,
          text: 'get setting [ID]',
          arguments: {
            ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'darkMode' },
          },
        },
        { blockType: Scratch.BlockType.LABEL, text: Scratch.translate('System') },
        {
          opcode: 'setSystemSetting',
          blockType: Scratch.BlockType.COMMAND,
          text: 'set system setting [SETTING] to [VALUE]',
          arguments: {
            SETTING: { type: Scratch.ArgumentType.STRING, menu: 'SYSTEM_SETTINGS' },
            VALUE: { type: Scratch.ArgumentType.STRING, defaultValue: '14' },
          },
        },
        {
          opcode: 'setCustomSetting',
          blockType: Scratch.BlockType.COMMAND,
          text: 'set custom setting [ID] to [VALUE]',
          arguments: {
            ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'darkMode' },
            VALUE: { type: Scratch.ArgumentType.STRING, defaultValue: 'true' },
          },
        },
        {
          opcode: 'lockSetting',
          blockType: Scratch.BlockType.COMMAND,
          text: 'lock setting [ID]',
          arguments: { ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'darkMode' } },
        },
        {
          opcode: 'unlockSetting',
          blockType: Scratch.BlockType.COMMAND,
          text: 'unlock setting [ID]',
          arguments: { ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'darkMode' } },
        },
        {
          opcode: 'lockSettingsMenu',
          blockType: Scratch.BlockType.COMMAND,
          text: 'lock settings menu',
        },
        {
          opcode: 'unlockSettingsMenu',
          blockType: Scratch.BlockType.COMMAND,
          text: 'unlock settings menu',
        },
      ],
      menus: {
        STEP_DIRECTION: {
          acceptReporters: true,
          items: ['increase', 'decrease'],
        },
        YES_NO: {
          acceptReporters: true,
          items: ['yes', 'no'],
        },
        LOG_LEVELS: {
          acceptReporters: true,
          items: ['log', 'hint', 'warn', 'error', 'verbose', 'done', 'load', 'headless'],
        },
        QUERY_TYPES: {
          acceptReporters: true,
          items: ['text', 'number', 'boolean', 'confirmation'],
        },
        SYSTEM_SETTINGS: {
          acceptReporters: true,
          items: ['fontSize', 'opacity', 'cliMode', 'showTimestamps', 'theme'],
        },
        ARG_TYPES: {
          acceptReporters: true,
          items: ['string', 'number', 'boolean'],
        },
      },
    };
  }

  _cancelPendingQuery() {
    if (this.pendingQuery && this.pendingQuery.resolve) {
      const wasCommandBarDisabled = this.pendingQuery.wasCommandBarDisabled;
      this.pendingQuery.resolve(); // Resolve empty string/null to unblock stack
      this.pendingQuery = null;
      this.userAnswer = ''; // Clear stale answer so getAnswer() returns '' after cancellation
      this.promptLabel.textContent = this.customPrompt;
      this.inputField.classList.remove('ext_kxTurboDev-input-shake');
      if (wasCommandBarDisabled) this._setCommandBarEnabled(false);
      // Apply any deferred disable that occurred mid-query (pendingQuery is now null)
      else if (!this.commandBarEnabled) this._setCommandBarEnabled(false);
    }
  }

  _onStopAll() {
    this.clearTerminal();
    this._cancelPendingQuery();
  }

  _setupGlobalHotkeys() {
    document.addEventListener('keydown', this.boundKeyDown);
  }

  _handleKeyDown(e) {
    // Ctrl + Backtick (`) to toggle
    if (e.key === '`' && e.ctrlKey) {
      e.preventDefault();
      if (this.isVisible) {
        this.hideTerminal();
      } else {
        this.showTerminal();
      }
    }
  }
}
