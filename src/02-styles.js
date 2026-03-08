// --- UI STYLES ---
// Namespace: ext_kxTurboDev-...
export const STYLES = `
      :root {
          --ext_kxTurboDev-term-bg: rgba(15, 15, 15, 0.95);
          --ext_kxTurboDev-term-text: #e4e4e4;
          --ext_kxTurboDev-term-accent: #3498db;
          --ext_kxTurboDev-term-border: rgba(255, 255, 255, 0.1);
          --ext_kxTurboDev-term-header: linear-gradient(to bottom, rgba(255,255,255,0.05), rgba(255,255,255,0.01));
          --ext_kxTurboDev-term-input-bg: rgba(0, 0, 0, 0.25);
          --ext_kxTurboDev-term-font: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
          --ext_kxTurboDev-term-switch-track: rgba(255, 255, 255, 0.2);
          --ext_kxTurboDev-term-switch-knob: #ffffff;
      }
  
      /* Themes */
      .ext_kxTurboDev-theme-matrix {
          --ext_kxTurboDev-term-bg: #0d0d0d;
          --ext_kxTurboDev-term-text: #00ff41;
          --ext_kxTurboDev-term-accent: #008f11;
          --ext_kxTurboDev-term-border: #003b00;
          --ext_kxTurboDev-term-header: #0a0a0a;
          --ext_kxTurboDev-term-input-bg: #000000;
          --ext_kxTurboDev-term-font: 'Courier New', monospace;
      }
      .ext_kxTurboDev-theme-ocean {
          --ext_kxTurboDev-term-bg: rgba(15, 23, 42, 0.95);
          --ext_kxTurboDev-term-text: #94a3b8;
          --ext_kxTurboDev-term-accent: #38bdf8;
          --ext_kxTurboDev-term-border: rgba(56, 189, 248, 0.2);
          --ext_kxTurboDev-term-header: rgba(30, 41, 59, 0.8);
          --ext_kxTurboDev-term-input-bg: rgba(15, 23, 42, 0.5);
      }
      .ext_kxTurboDev-theme-retro {
          --ext_kxTurboDev-term-bg: #1a1a1a;
          --ext_kxTurboDev-term-text: #ffb000;
          --ext_kxTurboDev-term-accent: #ff9500;
          --ext_kxTurboDev-term-border: #594d00;
          --ext_kxTurboDev-term-header: #242424;
          --ext_kxTurboDev-term-input-bg: #111;
      }
      .ext_kxTurboDev-theme-nord {
          --ext_kxTurboDev-term-bg: #2e3440;
          --ext_kxTurboDev-term-text: #d8dee9;
          --ext_kxTurboDev-term-accent: #88c0d0;
          --ext_kxTurboDev-term-border: #4c566a;
          --ext_kxTurboDev-term-header: #3b4252;
          --ext_kxTurboDev-term-input-bg: #242933;
      }
      .ext_kxTurboDev-theme-solarized {
          --ext_kxTurboDev-term-bg: #002b36;
          --ext_kxTurboDev-term-text: #839496;
          --ext_kxTurboDev-term-accent: #268bd2;
          --ext_kxTurboDev-term-border: #073642;
          --ext_kxTurboDev-term-header: #073642;
          --ext_kxTurboDev-term-input-bg: #00212b;
      }
      .ext_kxTurboDev-theme-monokai {
          --ext_kxTurboDev-term-bg: #272822;
          --ext_kxTurboDev-term-text: #f8f8f2;
          --ext_kxTurboDev-term-accent: #a6e22e;
          --ext_kxTurboDev-term-border: #3e3d32;
          --ext_kxTurboDev-term-header: #1e1f1c;
          --ext_kxTurboDev-term-input-bg: #1e1f1c;
      }
      .ext_kxTurboDev-theme-light {
          --ext_kxTurboDev-term-bg: rgba(250, 250, 250, 0.97);
          --ext_kxTurboDev-term-text: #333333;
          --ext_kxTurboDev-term-accent: #0070cc;
          --ext_kxTurboDev-term-border: rgba(0, 0, 0, 0.12);
          --ext_kxTurboDev-term-header: rgba(0, 0, 0, 0.04);
          --ext_kxTurboDev-term-input-bg: rgba(0, 0, 0, 0.05);
          --ext_kxTurboDev-term-switch-track: rgba(0, 0, 0, 0.2);
          --ext_kxTurboDev-term-switch-knob: #ffffff;
      }
  
      /* Animation Keyframes */
      @keyframes ext_kxTurboDevTermSlideIn {
          0% { opacity: 0; transform: translateY(15px) scale(0.96); filter: blur(2px); }
          100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
      }
      
      @keyframes ext_kxTurboDevLineIn {
          0% { opacity: 0; transform: translateX(-10px); }
          100% { opacity: 1; transform: translateX(0); }
      }

      @keyframes ext_kxTurboDevShake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
      }
  
      .ext_kxTurboDev-terminal-wrapper {
          position: fixed;
          top: 40px;
          left: 40px;
          width: 550px;
          height: 380px;
          min-width: 320px;
          min-height: 200px;
          
          background: var(--ext_kxTurboDev-term-bg);
          /* Scanline effect */
          background-image: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
          background-size: 100% 2px, 3px 100%;

          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          
          border: 1px solid var(--ext_kxTurboDev-term-border);
          border-radius: 12px;
          box-shadow: 0 24px 48px rgba(0, 0, 0, 0.6), 
                      0 0 0 1px rgba(255,255,255,0.02) inset;
          
          display: flex;
          flex-direction: column;
          font-family: var(--ext_kxTurboDev-term-font);
          z-index: 9999;
          color: var(--ext_kxTurboDev-term-text);
          font-size: 13px;
          
          resize: both;
          overflow: hidden;
          
          animation: ext_kxTurboDevTermSlideIn 0.3s cubic-bezier(0.19, 1, 0.22, 1);
          transition: opacity 0.2s, background-color 0.2s, height 0.2s; 
      }
  
      /* Minimized State */
      .ext_kxTurboDev-terminal-wrapper.ext_kxTurboDev-minimized {
          height: 40px !important;
          min-height: 40px !important;
          resize: none !important;
          overflow: hidden !important;
      }
      .ext_kxTurboDev-terminal-wrapper.ext_kxTurboDev-minimized .ext_kxTurboDev-terminal-body,
      .ext_kxTurboDev-terminal-wrapper.ext_kxTurboDev-minimized .ext_kxTurboDev-terminal-input-area,
      .ext_kxTurboDev-terminal-wrapper.ext_kxTurboDev-minimized .ext_kxTurboDev-settings-panel,
      .ext_kxTurboDev-terminal-wrapper.ext_kxTurboDev-minimized .ext_kxTurboDev-scroll-btn,
      .ext_kxTurboDev-terminal-wrapper.ext_kxTurboDev-minimized .ext_kxTurboDev-performance-panel,
      .ext_kxTurboDev-terminal-wrapper.ext_kxTurboDev-minimized .ext_kxTurboDev-hint-bar {
          display: none !important;
      }
      
      /* CLI Mode: Opaque, No Borders (Positioning handled by JS) */
      .ext_kxTurboDev-terminal-wrapper.ext_kxTurboDev-cli-mode {
          border-radius: 0 !important;
          border: none !important;
          background: var(--ext_kxTurboDev-term-bg) !important;
          background-image: none !important;
          opacity: 1 !important;
          backdrop-filter: none !important;
          resize: none !important;
          box-shadow: none !important;
          z-index: 500 !important; /* Ensure it stays below TurboWarp modals */
      }
      
      /* Hide Close/Minimize/Clear Button in CLI Mode */
      .ext_kxTurboDev-terminal-wrapper.ext_kxTurboDev-cli-mode .ext_kxTurboDev-control-btn.close,
      .ext_kxTurboDev-terminal-wrapper.ext_kxTurboDev-cli-mode .ext_kxTurboDev-control-btn.minimize,
      .ext_kxTurboDev-terminal-wrapper.ext_kxTurboDev-cli-mode .ext_kxTurboDev-control-btn.clear {
          display: none;
      }

      /* True TUI Mode: Covers Scratch canvas, hides TurboDev chrome (Positioning handled by JS) */
      .ext_kxTurboDev-terminal-wrapper.ext_kxTurboDev-true-tui-mode {
          border-radius: 0 !important;
          border: none !important;
          background: #050505 !important; /* Solid Black */
          opacity: 1 !important;
          backdrop-filter: none !important;
          resize: none !important;
          box-shadow: none !important;
          z-index: 500 !important; /* Ensure it stays below TurboWarp modals */
      }

      /* Hide title bar entirely in True TUI mode */
      .ext_kxTurboDev-terminal-wrapper.ext_kxTurboDev-true-tui-mode .ext_kxTurboDev-terminal-header {
          display: none !important;
      }

      /* Hide settings panel in True TUI mode (use the settings command instead) */
      .ext_kxTurboDev-terminal-wrapper.ext_kxTurboDev-true-tui-mode .ext_kxTurboDev-settings-panel {
          display: none !important;
      }

      /* Style input area as a seamless inline terminal line in True TUI mode */
      .ext_kxTurboDev-terminal-wrapper.ext_kxTurboDev-true-tui-mode .ext_kxTurboDev-terminal-input-area {
          background: transparent !important;
          border-top: none !important;
          padding: 4px 16px !important;
      }
  
      /* Resize handle corner hint */
      .ext_kxTurboDev-terminal-wrapper::after {
          content: '';
          position: absolute;
          bottom: 4px;
          right: 4px;
          width: 8px;
          height: 8px;
          pointer-events: none;
          background: radial-gradient(circle at center, var(--ext_kxTurboDev-term-text) 1px, transparent 1px);
          background-size: 4px 4px;
          opacity: 0.3;
      }
      .ext_kxTurboDev-terminal-wrapper.ext_kxTurboDev-cli-mode::after,
      .ext_kxTurboDev-terminal-wrapper.ext_kxTurboDev-true-tui-mode::after,
      .ext_kxTurboDev-terminal-wrapper.ext_kxTurboDev-minimized::after { display: none; }
  
      .ext_kxTurboDev-terminal-header {
          background: var(--ext_kxTurboDev-term-header);
          padding: 0 12px;
          height: 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: grab;
          user-select: none;
          border-bottom: 1px solid var(--ext_kxTurboDev-term-border);
          box-sizing: border-box;
          flex-shrink: 0;
      }
  
      .ext_kxTurboDev-terminal-header:active { cursor: grabbing; }
  
      .ext_kxTurboDev-terminal-title {
          font-weight: 600;
          font-size: 13px;
          color: var(--ext_kxTurboDev-term-text);
          display: flex;
          align-items: center;
          gap: 10px;
          pointer-events: none;
      }
  
      /* Status Dot */
      .ext_kxTurboDev-terminal-status {
          width: 8px;
          height: 8px;
          background-color: var(--ext_kxTurboDev-term-accent);
          border-radius: 50%;
          box-shadow: 0 0 8px var(--ext_kxTurboDev-term-accent);
          flex-shrink: 0;
          margin-top: 1px; /* Micro-adjustment for visual center */
      }
  
      .ext_kxTurboDev-terminal-controls {
          display: flex;
          gap: 4px;
          align-items: center;
      }
  
      .ext_kxTurboDev-control-btn {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          background: transparent;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          color: var(--ext_kxTurboDev-term-text);
          opacity: 0.7;
      }
  
      .ext_kxTurboDev-control-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          opacity: 1;
      }
      
      .ext_kxTurboDev-control-btn.active {
          background: var(--ext_kxTurboDev-term-accent);
          color: #000;
          opacity: 1;
      }
  
      .ext_kxTurboDev-control-btn.close:hover { background: rgba(231, 76, 60, 0.2); color: #e74c3c; }
      .ext_kxTurboDev-control-btn.clear:hover { background: rgba(241, 196, 15, 0.2); color: #f1c40f; }
  
      .ext_kxTurboDev-control-btn svg {
          width: 16px;
          height: 16px;
          fill: currentColor;
      }
  
      .ext_kxTurboDev-terminal-body {
          flex: 1;
          padding: 12px 16px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          scroll-behavior: smooth;
          position: relative;
          contain: content; /* Rendering Optimization */
      }
  
      /* Custom Scrollbar */
      .ext_kxTurboDev-terminal-body::-webkit-scrollbar { width: 10px; }
      .ext_kxTurboDev-terminal-body::-webkit-scrollbar-track { background: transparent; }
      .ext_kxTurboDev-terminal-body::-webkit-scrollbar-thumb { 
          background: var(--ext_kxTurboDev-term-border); 
          border-radius: 5px; 
          border: 2px solid transparent;
          background-clip: content-box;
      }
      .ext_kxTurboDev-terminal-body::-webkit-scrollbar-thumb:hover { background-color: var(--ext_kxTurboDev-term-text); opacity: 0.5; }
  
      /* Jump to Bottom Button */
      .ext_kxTurboDev-scroll-btn {
          position: absolute;
          bottom: 60px;
          right: 25px;
          width: 32px;
          height: 32px;
          background: var(--ext_kxTurboDev-term-accent);
          color: #000;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0,0,0,0.5);
          z-index: 50;
          opacity: 0;
          pointer-events: none;
          transition: all 0.2s;
          transform: translateY(10px);
          font-size: 14px;
          font-weight: bold;
      }
      .ext_kxTurboDev-scroll-btn.visible {
          opacity: 1;
          pointer-events: auto;
          transform: translateY(0);
      }
      .ext_kxTurboDev-scroll-btn:hover {
          transform: scale(1.1);
          filter: brightness(1.2);
      }
  
      .ext_kxTurboDev-terminal-line {
          margin-bottom: 2px;
          word-wrap: break-word;
          white-space: pre-wrap;
          line-height: 1.35;
          display: flex;
          align-items: center;
          /* Entry Animation */
          animation: ext_kxTurboDevLineIn 0.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
      }
      
      /* Help Grid Styles */
      .ext_kxTurboDev-help-container {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 12px;
          padding: 10px 0;
          margin-bottom: 10px;
          animation: ext_kxTurboDevLineIn 0.3s ease forwards;
      }

      .ext_kxTurboDev-help-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--ext_kxTurboDev-term-border);
          border-radius: 8px;
          padding: 12px;
          transition: all 0.2s;
          cursor: default;
      }
      .ext_kxTurboDev-help-card:hover {
          background: rgba(255,255,255,0.08);
          transform: translateY(-2px);
          border-color: var(--ext_kxTurboDev-term-accent);
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      }
      .ext_kxTurboDev-cmd-name {
          color: var(--ext_kxTurboDev-term-accent);
          font-weight: 800;
          font-size: 14px;
          margin-bottom: 6px;
          display: block;
          letter-spacing: 0.5px;
      }
      .ext_kxTurboDev-cmd-desc {
          color: var(--ext_kxTurboDev-term-text);
          font-size: 12px;
          opacity: 0.7;
          margin-bottom: 10px;
          display: block;
          line-height: 1.3;
          font-style: italic;
      }
      .ext_kxTurboDev-cmd-args {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: auto;
      }
      .ext_kxTurboDev-arg-badge {
          font-size: 10px;
          padding: 3px 8px;
          border-radius: 4px;
          background: rgba(0,0,0,0.4);
          border: 1px solid var(--ext_kxTurboDev-term-border);
          color: #999;
          font-family: monospace;
          letter-spacing: 0.5px;
      }
      .ext_kxTurboDev-arg-badge.required {
          border-color: rgba(230, 126, 34, 0.5);
          color: #e67e22;
          background: rgba(230, 126, 34, 0.1);
      }

      /* Highlighted Log Tags */
      .ext_kxTurboDev-log-tag {
          font-weight: 700;
          margin-right: 10px;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 11px;
          letter-spacing: 0.5px;
          flex-shrink: 0; /* Prevent tag from shrinking */
          user-select: none;
          line-height: normal;
          position: relative;
          bottom: 2px; /* Fix vertical alignment with text */
      }
      
      .ext_kxTurboDev-tag-info { background: #3498db; color: #000; }
      .ext_kxTurboDev-tag-warn { background: #f1c40f; color: #000; }
      .ext_kxTurboDev-tag-fail { background: #e74c3c; color: #fff; }
      .ext_kxTurboDev-tag-okay { background: #2ecc71; color: #000; }
      .ext_kxTurboDev-tag-syst { background: #7f8c8d; color: #fff; }
      .ext_kxTurboDev-tag-load { background: #3498db; color: #fff; }
      .ext_kxTurboDev-tag-user { background: #9b59b6; color: #fff; }
      .ext_kxTurboDev-tag-quer { background: #e67e22; color: #fff; } /* Orange for Query */
  
      /* Timestamp */
      .ext_kxTurboDev-log-time {
          color: var(--ext_kxTurboDev-term-text);
          opacity: 0.4;
          font-size: 11px;
          margin-right: 8px;
          font-family: inherit;
          flex-shrink: 0;
          letter-spacing: 0.5px;
      }
  
      /* Sticky Loading Line */
      .ext_kxTurboDev-loader-sticky {
          position: sticky;
          z-index: 10;
          background: var(--ext_kxTurboDev-term-bg);
          border-bottom: 1px solid var(--ext_kxTurboDev-term-border);
          margin-bottom: 0; /* Tight spacing for groups */
          padding-top: 4px;
          padding-bottom: 4px;
          backdrop-filter: blur(4px);
      }

      /* Loading Group Progress Bar */
      .ext_kxTurboDev-loader-progress {
          margin-left: 8px;
          font-family: monospace;
          font-size: 11px;
          opacity: 0.7;
          flex-shrink: 0;
      }

      /* Loading Group Collapse Toggle */
      .ext_kxTurboDev-group-toggle {
          cursor: pointer;
          opacity: 0.55;
          font-size: 11px;
          user-select: none;
          flex-shrink: 0;
          background: none;
          border: none;
          color: inherit;
          padding: 0 2px;
          font-family: inherit;
          line-height: 1;
      }
      .ext_kxTurboDev-group-toggle:hover { opacity: 1; }
  
      .ext_kxTurboDev-terminal-input-area {
          display: flex;
          padding: 12px 16px;
          background: var(--ext_kxTurboDev-term-input-bg);
          border-top: 1px solid var(--ext_kxTurboDev-term-border);
          align-items: center;
          flex-shrink: 0;
          position: relative; /* For Hint Bar absolute positioning */
          transition: box-shadow 0.2s ease;
      }
      /* Input Glow on Valid Command */
      .ext_kxTurboDev-terminal-input-area.valid-cmd {
          box-shadow: inset 0 -2px 0 var(--ext_kxTurboDev-term-accent);
      }
      /* Disabled Command Bar Overlay */
      .ext_kxTurboDev-terminal-input-area.ext_kxTurboDev-input-disabled > :not(.ext_kxTurboDev-hint-bar) {
          filter: blur(2px);
          opacity: 0.35;
          pointer-events: none;
          user-select: none;
      }
      .ext_kxTurboDev-terminal-input-area.ext_kxTurboDev-input-disabled::after {
          content: '✕';
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1em;
          font-weight: bold;
          color: var(--ext_kxTurboDev-term-accent);
          background: rgba(0, 0, 0, 0.15);
          cursor: not-allowed;
          pointer-events: all;
      }
      
      /* Hint Bar for Autocomplete/Syntax */
      .ext_kxTurboDev-hint-bar {
          position: absolute;
          bottom: 100%;
          left: 0;
          right: 0;
          background: rgba(0,0,0,0.8);
          border-top: 1px solid var(--ext_kxTurboDev-term-border);
          padding: 4px 16px;
          font-size: 11px;
          color: var(--ext_kxTurboDev-term-text);
          opacity: 0;
          pointer-events: none;
          transform: translateY(5px);
          transition: all 0.2s ease;
          display: flex;
          gap: 10px;
      }
      .ext_kxTurboDev-hint-bar.visible {
          opacity: 1;
          transform: translateY(0);
      }
      .ext_kxTurboDev-hint-cmd { color: var(--ext_kxTurboDev-term-accent); font-weight: bold; }
      .ext_kxTurboDev-hint-arg { color: #7f8c8d; }
      .ext_kxTurboDev-hint-arg.required { color: #e67e22; }

      /* Shake Animation Class */
      .ext_kxTurboDev-input-shake {
          animation: ext_kxTurboDevShake 0.3s ease-in-out;
          border: 1px solid #e74c3c !important;
      }
  
      .ext_kxTurboDev-terminal-prompt {
          color: var(--ext_kxTurboDev-term-accent);
          margin-right: 12px;
          font-weight: 700;
          user-select: none;
      }
  
      .ext_kxTurboDev-terminal-input {
          flex: 1;
          background: transparent;
          border: none;
          color: var(--ext_kxTurboDev-term-text);
          font-family: inherit;
          font-size: inherit;
          outline: none;
          caret-color: var(--ext_kxTurboDev-term-accent);
      }
  
      /* --- Settings Panel --- */
      .ext_kxTurboDev-settings-panel {
          position: absolute;
          top: 40px;
          right: 0;
          bottom: 0;
          width: 260px; /* Slightly wider for better controls */
          background: var(--ext_kxTurboDev-term-bg);
          border-left: 1px solid var(--ext_kxTurboDev-term-border);
          transform: translateX(100%);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 100;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
      }
  
      .ext_kxTurboDev-settings-panel.open {
          transform: translateX(0);
      }
  
      .ext_kxTurboDev-settings-header {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: var(--ext_kxTurboDev-term-text);
          opacity: 0.6;
          font-weight: 700;
          border-bottom: 1px solid var(--ext_kxTurboDev-term-border);
          padding: 15px 20px;
          background: rgba(255,255,255,0.02);
      }
      
      .ext_kxTurboDev-settings-content {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 20px;
      }
      
      /* Setting Section Headers */
      .ext_kxTurboDev-settings-section-title {
          font-size: 10px;
          text-transform: uppercase;
          color: var(--ext_kxTurboDev-term-accent);
          font-weight: bold;
          margin-bottom: -10px;
          letter-spacing: 0.5px;
      }
  
      .ext_kxTurboDev-setting-item {
          display: flex;
          flex-direction: column;
          gap: 8px;
      }
  
      .ext_kxTurboDev-setting-item label {
          font-size: 12px;
          color: var(--ext_kxTurboDev-term-text);
          opacity: 0.9;
          font-family: sans-serif;
          display: flex;
          justify-content: space-between;
          align-items: center;
      }
  
      /* --- Custom Controls --- */
      
      /* Input Field */
      .ext_kxTurboDev-setting-input, .ext_kxTurboDev-setting-select {
          width: 100%;
          background: rgba(0,0,0,0.3);
          border: 1px solid var(--ext_kxTurboDev-term-border);
          color: var(--ext_kxTurboDev-term-text);
          padding: 8px 10px;
          border-radius: 6px;
          font-size: 12px;
          box-sizing: border-box;
          transition: all 0.2s;
      }
      .ext_kxTurboDev-setting-input:focus, .ext_kxTurboDev-setting-select:focus {
          border-color: var(--ext_kxTurboDev-term-accent);
          background: rgba(0,0,0,0.5);
          outline: none;
      }
      input[type=color].ext_kxTurboDev-setting-color {
          -webkit-appearance: none;
          width: 36px;
          height: 28px;
          padding: 2px;
          border: 1px solid var(--ext_kxTurboDev-term-border);
          border-radius: 6px;
          background: rgba(0,0,0,0.3);
          cursor: pointer;
          flex-shrink: 0;
      }
      input[type=color].ext_kxTurboDev-setting-color::-webkit-color-swatch-wrapper {
          padding: 0;
          border-radius: 4px;
      }
      input[type=color].ext_kxTurboDev-setting-color::-webkit-color-swatch {
          border: none;
          border-radius: 4px;
      }
  
      /* Slider Styling */
      input[type=range].ext_kxTurboDev-setting-slider {
          -webkit-appearance: auto;
          width: 100%;
          background: transparent;
      }
      input[type=range].ext_kxTurboDev-setting-slider::-webkit-slider-thumb {
          -webkit-appearance: auto;
          height: 14px;
          width: 14px;
          border-radius: 50%;
          background: var(--ext_kxTurboDev-term-text);
          cursor: pointer;
          margin-top: -5px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.5);
      }
      input[type=range].ext_kxTurboDev-setting-slider::-webkit-slider-runnable-track {
          width: 100%;
          height: 4px;
          cursor: pointer;
          background: rgba(255,255,255,0.2);
          border-radius: 2px;
      }
      
      /* Toggle Switch */
      .ext_kxTurboDev-toggle-switch {
          position: relative;
          display: inline-block;
          width: 36px;
          height: 20px;
      }
      .ext_kxTurboDev-toggle-switch input { opacity: 0; width: 0; height: 0; }
      .ext_kxTurboDev-slider {
          position: absolute;
          cursor: pointer;
          top: 0; left: 0; right: 0; bottom: 0;
          background-color: var(--ext_kxTurboDev-term-switch-track);
          transition: .3s;
          border-radius: 20px;
      }
      .ext_kxTurboDev-slider:before {
          position: absolute;
          content: "";
          height: 14px;
          width: 14px;
          left: 3px;
          bottom: 3px;
          background-color: var(--ext_kxTurboDev-term-switch-knob);
          transition: .3s;
          border-radius: 50%;
      }
      input:checked + .ext_kxTurboDev-slider { background-color: var(--ext_kxTurboDev-term-accent); }
      input:checked + .ext_kxTurboDev-slider:before { transform: translateX(16px); }
  
      .ext_kxTurboDev-settings-footer {
          padding: 15px 20px;
          border-top: 1px solid var(--ext_kxTurboDev-term-border);
          display: flex;
          justify-content: flex-end;
      }
      
      .ext_kxTurboDev-settings-btn-close {
          padding: 8px 16px;
          background: rgba(255,255,255,0.1);
          color: var(--ext_kxTurboDev-term-text);
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-family: sans-serif;
          font-size: 12px;
          font-weight: 600;
          transition: all 0.2s;
      }
      .ext_kxTurboDev-settings-btn-close:hover { background: rgba(255,255,255,0.2); }
      
      /* Action Button (e.g., Copy) */
      .ext_kxTurboDev-settings-btn-action {
          padding: 8px 12px;
          background: transparent;
          color: var(--ext_kxTurboDev-term-accent);
          border: 1px solid var(--ext_kxTurboDev-term-accent);
          border-radius: 6px;
          cursor: pointer;
          font-size: 11px;
          font-weight: 600;
          transition: all 0.2s;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          width: 100%;
          margin-top: 5px;
          opacity: 0.8;
      }
      .ext_kxTurboDev-settings-btn-action:hover {
          background: var(--ext_kxTurboDev-term-accent);
          color: #000;
          opacity: 1;
      }
  
      /* Disabled state for inputs (Locked) */
      .ext_kxTurboDev-setting-input:disabled, 
      .ext_kxTurboDev-setting-slider:disabled,
      .ext_kxTurboDev-toggle-switch input:disabled + .ext_kxTurboDev-slider {
          opacity: 0.5;
          cursor: not-allowed;
          filter: grayscale(1);
      }
  
      /* Toast Notification */
      .ext_kxTurboDev-toast {
          position: absolute;
          bottom: 60px;
          left: 50%;
          transform: translateX(-50%) translateY(20px);
          background: var(--ext_kxTurboDev-term-accent);
          color: #000;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
          opacity: 0;
          transition: all 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28);
          pointer-events: none;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          z-index: 200;
      }
      .ext_kxTurboDev-toast.show {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
      }
  
      /* --- Performance Panel (GLOW UP) --- */
      .ext_kxTurboDev-performance-panel {
          flex: 1;
          display: none;
          flex-direction: column;
          padding: 20px;
          overflow-y: auto;
          color: var(--ext_kxTurboDev-term-text);
          background: linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.6));
      }
      .ext_kxTurboDev-performance-panel.visible {
          display: flex;
      }
      .ext_kxTurboDev-stat-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 20px;
      }
      .ext_kxTurboDev-stat-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          padding: 16px;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          transition: transform 0.2s ease, background-color 0.2s ease;
      }
      .ext_kxTurboDev-stat-card:hover {
          background: rgba(255,255,255,0.06);
          transform: translateY(-2px);
      }
      
      /* Top Colored Line */
      .ext_kxTurboDev-stat-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 3px;
          background: currentColor;
          opacity: 0.7;
          box-shadow: 0 0 10px currentColor;
      }

      .ext_kxTurboDev-stat-value {
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          font-size: 28px;
          font-weight: 800;
          margin-bottom: 6px;
          text-shadow: 0 0 15px currentColor;
      }
      .ext_kxTurboDev-stat-label {
          font-size: 11px;
          text-transform: uppercase;
          opacity: 0.6;
          letter-spacing: 1px;
          font-weight: 600;
      }
      
      .ext_kxTurboDev-graph-container {
          background: rgba(0,0,0,0.3);
          border: 1px solid var(--ext_kxTurboDev-term-border);
          border-radius: 12px;
          padding: 16px;
          height: 180px;
          position: relative;
          margin-bottom: 20px;
          display: flex;
          flex-direction: column;
          box-shadow: inset 0 0 30px rgba(0,0,0,0.5);
      }
      .ext_kxTurboDev-graph-header {
          font-size: 10px;
          text-transform: uppercase;
          opacity: 0.5;
          margin-bottom: 8px;
          font-weight: 700;
          letter-spacing: 0.5px;
      }
      .ext_kxTurboDev-graph-canvas {
          width: 100%;
          height: 100%;
          display: block;
      }
  `;

export const FLAG_NAME_RE = /^[a-zA-Z0-9][a-zA-Z0-9-]*$/;

