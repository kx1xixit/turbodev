import { TurboDevExtension } from './03-class.js';

/* global FLAG_NAME_RE, vm */

Object.assign(TurboDevExtension.prototype, {
  _parseCommandArgs(input) {
    // Regex for handling spaces inside quotes
    const regex = /[^\s"']+|"([^"]*)"|'([^']*)'/g;
    const args = [];
    let match;
    while ((match = regex.exec(input)) !== null) {
      // match[1] is double quotes content, match[2] is single quotes content
      // match[0] is the unquoted token
      args.push(match[1] || match[2] || match[0]);
    }
    return args;
  },

  _parseFlags(tokens) {
    const positional = [];
    const flags = {};
    let i = 0;
    while (i < tokens.length) {
      const token = tokens[i];
      if (token.startsWith('--')) {
        const rawName = token.slice(2);
        // Only accept valid flag names (letters, digits, hyphens; must start with letter/digit)
        if (FLAG_NAME_RE.test(rawName)) {
          const flagName = rawName.toLowerCase();
          if (i + 1 < tokens.length && !tokens[i + 1].startsWith('--')) {
            flags[flagName] = tokens[i + 1];
            i += 2;
          } else {
            flags[flagName] = 'true'; // boolean flag
            i++;
          }
        } else {
          i++; // skip invalid or bare '--'
        }
      } else {
        positional.push(token);
        i++;
      }
    }
    return { positional, flags };
  },

  _validateArguments(cmdName, args, subcommandName = '') {
    // Check alias resolution first just in case, though _handleCommand does it
    const realCmd = this.aliases.has(cmdName) ? this.aliases.get(cmdName) : cmdName;
    const cmdData = this.registeredCommands.get(realCmd);
    if (!cmdData) return true;

    let definedArgs;
    if (subcommandName && cmdData.subcommands && cmdData.subcommands.has(subcommandName)) {
      definedArgs = cmdData.subcommands.get(subcommandName).args || [];
    } else {
      definedArgs = cmdData.args || [];
    }
    if (definedArgs.length === 0) return true;

    // Check required arguments
    for (let i = 0; i < definedArgs.length; i++) {
      const def = definedArgs[i];
      const val = args[i];

      // Check presence
      if (val === undefined || val === '') {
        if (!def.optional) {
          this._addLine(`Error: Missing required argument '${def.name}' (${def.type})`, '#e74c3c');
          return false;
        }
        continue; // Skip type check for optional missing args
      }

      // Check Type
      if (def.type === 'number') {
        const parsed = parseFloat(val);
        if (isNaN(parsed) || !isFinite(parsed)) {
          this._addLine(`Error: Argument '${def.name}' expects number, got '${val}'`, '#e74c3c');
          return false;
        }
      } else if (def.type === 'boolean') {
        const low = val.toLowerCase();
        if (!['true', 'false', 't', 'f', 'yes', 'no'].includes(low)) {
          this._addLine(`Error: Argument '${def.name}' expects boolean, got '${val}'`, '#e74c3c');
          return false;
        }
      }
    }
    return true;
  },

  _addNode(node) {
    this.outputContainer.appendChild(node);
    this._scrollToBottom();
  },

  _handleCommand(text, echo = true) {
    // Hard Limit on Input Length
    if (text.length > 512) {
      this._addLine(`@c #e74c3c:Error: Input too long (max 512 chars).@c`);
      return;
    }

    if (!text.trim()) return;
    const cleanText = text.trim();

    // Parse arguments using new Regex parser
    const parsedArgs = this._parseCommandArgs(cleanText);
    let commandName = parsedArgs[0]; // Mutable for alias
    const args = parsedArgs.slice(1);

    try {
      // If we are pending a query, capture this input
      if (this.pendingQuery) {
        // Echo what user typed with a query-input tag
        this._addTaggedLine('( > )', '#C678DD', null, null, text);

        let isValid = false;
        let parsed = null;
        const type = this.pendingQuery.type;

        // Simple Validation
        if (type === 'number') {
          if (!isNaN(parseFloat(text)) && isFinite(text)) {
            isValid = true;
            parsed = parseFloat(text);
          }
        } else if (type === 'boolean') {
          const low = text.toLowerCase();
          if (['true', 't', 'yes', 'y'].includes(low)) {
            isValid = true;
            parsed = true;
          } else if (['false', 'f', 'no', 'n'].includes(low)) {
            isValid = true;
            parsed = false;
          }
        } else if (type === 'confirmation') {
          const low = text.toLowerCase();
          if (['yes', 'y'].includes(low)) {
            isValid = true;
            parsed = true;
          } else if (['no', 'n'].includes(low)) {
            isValid = true;
            parsed = false;
          }
        } else {
          // Text
          isValid = true;
          parsed = text;
        }

        if (isValid) {
          this.userAnswer = parsed;
          const wasCommandBarDisabled = this.pendingQuery.wasCommandBarDisabled;
          if (this.pendingQuery.resolve) {
            this.pendingQuery.resolve();
          }
          this.pendingQuery = null;
          this.promptLabel.textContent = this.customPrompt; // Reset prompt
          if (wasCommandBarDisabled) this._setCommandBarEnabled(false);
          // Apply any deferred disable that occurred mid-query (pendingQuery is now null)
          else if (!this.commandBarEnabled) this._setCommandBarEnabled(false);
        } else {
          this._addLine(`@c #e74c3c:Invalid input. Expected ${type}.@c`);
          // Shake Effect
          this.inputField.classList.add('ext_kxTurboDev-input-shake');
          setTimeout(() => this.inputField.classList.remove('ext_kxTurboDev-input-shake'), 300);
        }
        return;
      }

      // Standard Command Logic
      // Echo command with USER tag (only when echo is enabled)
      if (echo) this._addLine(`${this.promptLabel.textContent} ${text}`, '#9b59b6');

      // Store History
      this.commandHistory.push(text);
      if (this.commandHistory.length > this.MAX_HISTORY) this.commandHistory.shift();
      this.historyIndex = -1;

      // --- ALIAS RESOLUTION ---
      if (this.aliases.has(commandName)) {
        commandName = this.aliases.get(commandName);
      }

      // --- SUBCOMMAND DETECTION ---
      let subcommandName = '';
      let remainingArgs = args;
      const cmdEntry = this.registeredCommands.get(commandName);
      if (cmdEntry && cmdEntry.subcommands && args.length > 0) {
        const sub = args[0].toLowerCase();
        if (cmdEntry.subcommands.has(sub)) {
          subcommandName = sub;
          remainingArgs = args.slice(1);
        }
      }

      // --- FLAG PARSING ---
      const { positional, flags } = this._parseFlags(remainingArgs);

      // --- ARGUMENT VALIDATION ---
      if (!this._validateArguments(commandName, positional, subcommandName)) {
        this.inputField.classList.add('ext_kxTurboDev-input-shake');
        setTimeout(() => this.inputField.classList.remove('ext_kxTurboDev-input-shake'), 300);
        return; // STOP execution
      }

      this.lastCommand = commandName;
      this.currentCommandName = commandName;
      this.currentSubcommandName = subcommandName;
      this.currentCommandFlags = flags;
      this.currentCommandArgs = positional;

      // Internal Command Handling
      if (commandName === 'help') {
        const filter = positional[0];

        // Detailed Help
        if (filter) {
          const realCmd = this.aliases.has(filter) ? this.aliases.get(filter) : filter;
          const data = this.registeredCommands.get(realCmd);

          // Check if a subcommand name was also supplied: help <cmd> <sub>
          const subFilter = positional[1] ? positional[1].toLowerCase() : null;
          if (data && subFilter && data.subcommands && data.subcommands.has(subFilter)) {
            const subData = data.subcommands.get(subFilter);
            this._addLine(`@c #7f8c8d:--- Help: ${realCmd} ${subFilter} ---@c`);
            this._addLine(`@c #e4e4e4:${subData.desc}@c`);
            if (subData.args && subData.args.length > 0) {
              this._addLine(`@c #3498db:Arguments:@c`);
              subData.args.forEach(a => {
                this._addLine(
                  `  @c #94a3b8:${a.name}@c (@c #e67e22:${a.type}@c)${a.optional ? ' (optional)' : ''}`
                );
              });
            } else {
              this._addLine(`@c #7f8c8d:No arguments required.@c`);
            }
            if (subData.flags && subData.flags.length > 0) {
              this._addLine(`@c #3498db:Flags:@c`);
              subData.flags.forEach(f => {
                this._addLine(`  @c #94a3b8:--${f.name}@c - ${f.desc}`);
              });
            }
            return;
          }

          if (data) {
            this._addLine(`@c #7f8c8d:--- Help: ${realCmd} ---@c`);
            this._addLine(`@c #e4e4e4:${data.desc}@c`);
            if (data.args && data.args.length > 0) {
              this._addLine(`@c #3498db:Arguments:@c`);
              data.args.forEach(a => {
                this._addLine(
                  `  @c #94a3b8:${a.name}@c (@c #e67e22:${a.type}@c)${a.optional ? ' (optional)' : ''}`
                );
              });
            } else {
              this._addLine(`@c #7f8c8d:No arguments required.@c`);
            }
            if (data.subcommands && data.subcommands.size > 0) {
              this._addLine(`@c #3498db:Subcommands:@c`);
              data.subcommands.forEach((subData, subName) => {
                this._addLine(`  @c #94a3b8:${subName}@c - ${subData.desc}`);
                if (subData.flags && subData.flags.length > 0) {
                  subData.flags.forEach(f => {
                    this._addLine(`    @c #94a3b8:--${f.name}@c - ${f.desc}`);
                  });
                }
              });
            }
            if (data.flags && data.flags.length > 0) {
              this._addLine(`@c #3498db:Flags:@c`);
              data.flags.forEach(f => {
                this._addLine(`  @c #94a3b8:--${f.name}@c - ${f.desc}`);
              });
            }
          } else {
            this._addLine(`Command '${filter}' not found.`, '#e74c3c');
          }
          return;
        }

        // List All
        this._addLine('@c #7f8c8d:--- Command Reference ---@c');
        const grid = document.createElement('div');
        grid.className = 'ext_kxTurboDev-help-container';

        // Add Aliases to display or filter? For now, just primary commands
        this.registeredCommands.forEach((data, name) => {
          const card = document.createElement('div');
          card.className = 'ext_kxTurboDev-help-card';

          const title = document.createElement('span');
          title.className = 'ext_kxTurboDev-cmd-name';
          title.textContent = name;

          const desc = document.createElement('span');
          desc.className = 'ext_kxTurboDev-cmd-desc';
          desc.textContent = data.desc;

          const argsDiv = document.createElement('div');
          argsDiv.className = 'ext_kxTurboDev-cmd-args';

          if (data.args) {
            data.args.forEach(arg => {
              const badge = document.createElement('span');
              badge.className = `ext_kxTurboDev-arg-badge ${arg.optional ? '' : 'required'}`;
              badge.textContent = arg.name + (arg.optional ? '?' : '');
              argsDiv.appendChild(badge);
            });
          }

          card.appendChild(title);
          card.appendChild(desc);
          card.appendChild(argsDiv);
          if (data.subcommands && data.subcommands.size > 0) {
            const subDiv = document.createElement('div');
            subDiv.className = 'ext_kxTurboDev-cmd-args';
            data.subcommands.forEach((subData, subName) => {
              const badge = document.createElement('span');
              badge.className = 'ext_kxTurboDev-arg-badge';
              badge.textContent = subName;
              subDiv.appendChild(badge);
            });
            card.appendChild(subDiv);
          }
          if (data.flags && data.flags.length > 0) {
            const flagsDiv = document.createElement('div');
            flagsDiv.className = 'ext_kxTurboDev-cmd-args';
            data.flags.forEach(f => {
              const badge = document.createElement('span');
              badge.className = 'ext_kxTurboDev-arg-badge';
              badge.textContent = '--' + f.name;
              flagsDiv.appendChild(badge);
            });
            card.appendChild(flagsDiv);
          }
          grid.appendChild(card);
        });

        this._addNode(grid);
        return;
      }

      if (commandName === 'clear') {
        this.clearTerminal();
        return;
      }

      if (commandName === 'history') {
        const recent = this.commandHistory.slice(-10);
        this._addLine('@c #7f8c8d:--- Command History ---@c');
        recent.forEach((cmd, i) => {
          this._addLine(`${i + 1}. ${cmd}`, '#7f8c8d');
        });
        return;
      }

      if (commandName === 'echo') {
        // Echo args joined by space
        this._addLine(positional.join(' '));
        return;
      }

      if (commandName === 'theme') {
        const newTheme = positional[0] ? positional[0].toLowerCase() : '';
        if (['standard', 'matrix', 'ocean', 'retro'].includes(newTheme)) {
          this._setTheme(newTheme);
          this._saveSettings(); // Persist theme change
          this._addLine(`@c #2ecc71:Theme set to ${newTheme}@c`);
        } else {
          this._addLine('@c #e74c3c:Unknown theme. Available: standard, matrix, ocean, retro@c');
        }
        return;
      }

      if (commandName === 'sysinfo') {
        const targetCount = vm.runtime.targets.length;
        const threadCount = vm.runtime.threads.length;
        this._addLine(`@c #7f8c8d:--- System Info ---@c`);
        this._addLine(`@c #7f8c8d:Targets: ${targetCount}@c`);
        this._addLine(`@c #7f8c8d:Threads: ${threadCount}@c`);
        return;
      }

      // New Dev Commands
      if (commandName === 'listvars') {
        this._addLine('@c #7f8c8d:--- Global Variables ---@c');
        try {
          const stage = vm.runtime.getTargetForStage();
          if (stage && stage.variables) {
            for (const id in stage.variables) {
              const v = stage.variables[id];
              // Defensive check for v and v.value
              if (v && v.type === '' && v.value !== undefined) {
                this._addLine(`${v.name}: ${v.value}`, '#7f8c8d');
              }
            }
          }
        } catch (e) {
          this._addLine(`Error listing vars: ${e.message}`, '#e74c3c');
        }
        return;
      }

      if (commandName === 'listsprites') {
        this._addLine('@c #7f8c8d:--- Targets ---@c');
        const counts = {};
        vm.runtime.targets.forEach(t => {
          if (!t.sprite) return;
          const name = t.sprite.name;
          counts[name] = (counts[name] || 0) + 1;
        });
        for (const name in counts) {
          this._addLine(
            `${name}: ${counts[name]} (1 orig + ${counts[name] - 1} clones)`,
            '#7f8c8d'
          );
        }
        return;
      }

      // --- UNKNOWN COMMAND CHECK ---
      if (!this.registeredCommands.has(commandName)) {
        // Fuzzy Search Logic
        let bestMatch = null;
        let minDist = Infinity;
        // Check both commands and aliases
        const candidates = [...this.registeredCommands.keys(), ...this.aliases.keys()];

        candidates.forEach(cand => {
          const dist = this._levenshtein(commandName, cand);
          if (dist < minDist) {
            minDist = dist;
            bestMatch = cand;
          }
        });

        if (bestMatch && minDist <= 2) {
          this._addLine(
            `Unknown command '${commandName}'. Did you mean '${bestMatch}'?`,
            '#e67e22'
          );
        } else {
          // Warn user but still allow hat blocks to handle it
          this._addLine(`Unknown command '${commandName}'. No similar commands found.`, '#e67e22');
        }
      }

      // Trigger Scratch Hat Block for custom logic
      this._triggerHat = true;

      // 1. Generic Event (can remain Event or HAT, generic one worked as Event)
      const genericHatOpcode = `${this.getInfo().id}_whenCommandReceived`;

      // 2. Specific Event (Must be triggered generically without filter because it's a HAT block now)
      const specificHatOpcode = `${this.getInfo().id}_whenSpecificCommandReceived`;

      // 3. Subcommand Event
      const subcommandHatOpcode = `${this.getInfo().id}_whenSubcommandReceived`;

      // Wrap startHats in try-catch to prevent runtime crash
      try {
        vm.runtime.startHats(genericHatOpcode);
        vm.runtime.startHats(specificHatOpcode); // Trigger HAT check manually
        vm.runtime.startHats(subcommandHatOpcode); // Trigger subcommand HAT check
      } catch (e) {
        console.warn('TurboDev Hat Error:', e);
      }

      // Reset trigger after a short delay (single frame pulse)
      setTimeout(() => {
        this._triggerHat = false;
      }, 50);
    } catch (err) {
      console.error('TurboDev Command Error:', err);
      this._addLine(`@c #e74c3c:System Error: ${err.message}@c`);
    }
  },
});
