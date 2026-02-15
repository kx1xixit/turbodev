const vm = Scratch.vm;
const runtime = vm.runtime;

// --- Singleton & Cleanup ---
// Check for existing instance in runtime or window to prevent duplicates
// Using 'ext_kxTurboDev' to match the ID and standard naming convention
if (runtime.ext_kxTurboDev) {
  try {
    runtime.ext_kxTurboDev.dispose();
  } catch (e) {
    console.warn('TurboDev: Failed to dispose previous instance', e);
  }
}

// --- UI STYLES ---
// Namespace: ext_kxTurboDev-...
const STYLES = `
      :root {
          --ext_kxTurboDev-term-bg: rgba(15, 15, 15, 0.95);
          --ext_kxTurboDev-term-text: #e4e4e4;
          --ext_kxTurboDev-term-accent: #3498db;
          --ext_kxTurboDev-term-border: rgba(255, 255, 255, 0.1);
          --ext_kxTurboDev-term-header: linear-gradient(to bottom, rgba(255,255,255,0.05), rgba(255,255,255,0.01));
          --ext_kxTurboDev-term-input-bg: rgba(0, 0, 0, 0.25);
          --ext_kxTurboDev-term-font: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
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
  
      /* Animation Keyframes */
      @keyframes ext_kxTurboDevTermSlideIn {
          0% { opacity: 0; transform: translateY(10px) scale(0.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
      }
      
      @keyframes ext_kxTurboDevShake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
      }
  
      .ext_kxTurboDev-terminal-wrapper {
          position: absolute;
          top: 40px;
          left: 40px;
          width: 550px;
          height: 380px;
          min-width: 320px;
          min-height: 200px;
          
          background: var(--ext_kxTurboDev-term-bg);
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
          
          animation: ext_kxTurboDevTermSlideIn 0.25s cubic-bezier(0.19, 1, 0.22, 1);
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
      .ext_kxTurboDev-terminal-wrapper.ext_kxTurboDev-minimized .ext_kxTurboDev-performance-panel {
          display: none !important;
      }
      
      /* CLI Mode: Opaque, No Borders (Positioning handled by JS) */
      .ext_kxTurboDev-terminal-wrapper.ext_kxTurboDev-cli-mode {
          border-radius: 0 !important;
          border: none !important;
          background: #050505 !important; /* Solid Black */
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
          margin-bottom: 1px; /* Reduced Spacing */
          word-wrap: break-word;
          white-space: pre-wrap;
          line-height: 1.25; /* Tighter line height */
          transition: padding-left 0.2s ease;
          display: flex;
          align-items: center; /* Center boxes, offset used for visual alignment */
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
  
      .ext_kxTurboDev-terminal-input-area {
          display: flex;
          padding: 12px 16px;
          background: var(--ext_kxTurboDev-term-input-bg);
          border-top: 1px solid var(--ext_kxTurboDev-term-border);
          align-items: center;
          flex-shrink: 0;
      }
      
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
          background-color: rgba(255,255,255,0.15);
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
          background-color: white;
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

class TurboDevExtension {
  constructor() {
    this.container = null;
    this.outputContainer = null;
    this.perfContainer = null;
    this.inputField = null;
    this.settingsPanel = null;
    this.scrollBtn = null;
    this.settingsBtn = null;
    this.perfBtn = null;
    this.toast = null;

    this.isVisible = false;
    this.isMinimized = false;
    this.isAutoScrolling = true;
    this.isPerfMode = false;

    this.lastCommand = '';
    this.commandHistory = [];
    this.historyIndex = -1;
    this.cliReqId = null;
    this.scrollReqId = null;
    this.perfReqId = null; // Safety: Single RAF ID for perf loop

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
      showTimestamps: false,
      theme: 'standard',
    };

    this.prevRect = null;
    this.customSettings = new Map();

    // Locking State
    this.lockedSettings = new Set();
    this.isSettingsMenuLocked = false;

    this.registeredCommands = new Map();
    this.registeredCommands.set('help', 'Lists all available commands');
    this.registeredCommands.set('clear', 'Clears the terminal output');
    this.registeredCommands.set('sysinfo', 'Displays system statistics');
    this.registeredCommands.set('history', 'Shows command history');
    this.registeredCommands.set('echo', 'Prints text back to console');
    this.registeredCommands.set('theme', 'Sets theme (standard/matrix/ocean/retro)');
    this.registeredCommands.set('listvars', 'Lists global variables');
    this.registeredCommands.set('listsprites', 'Lists sprites and clones');

    // Query state
    this.pendingQuery = null;
    this.userAnswer = '';

    // Hybrid Trigger for Hat Block
    this._triggerHat = false;

    this.indentLevel = 0;
    this.loaderStack = [];
    this.ASCII_FRAMES = ['|', '/', '-', '\\'];

    // Caps
    this.MAX_HISTORY = 50;
    this.MAX_SETTINGS = 100;

    // Cleanup & Bindings
    this.boundKeyDown = this._handleKeyDown.bind(this);
    this.boundStopAll = this._onStopAll.bind(this);

    // CRITICAL FIX: Bind block methods to 'this'
    this.printText = this.printText.bind(this);
    this.getLastCommand = this.getLastCommand.bind(this);
    this.getAnswer = this.getAnswer.bind(this);
    this.getSettingValue = this.getSettingValue.bind(this);
    this.queryUser = this.queryUser.bind(this);
    this.runCommand = this.runCommand.bind(this);
    // REMOVED: this.whenCommandReceived = this.whenCommandReceived.bind(this);
    // ^ Event blocks must not have a bound function or they conflict with Scratch runtime.

    this._loadSettings();
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

  dispose() {
    if (this.container) this.container.remove();
    if (document.getElementById('ext_kxTurboDev-terminal-extension-style')) {
      document.getElementById('ext_kxTurboDev-terminal-extension-style').remove();
    }

    document.removeEventListener('keydown', this.boundKeyDown);
    vm.runtime.off('PROJECT_STOP_ALL', this.boundStopAll);

    this._cancelPendingQuery();

    if (this.cliReqId) cancelAnimationFrame(this.cliReqId);
    if (this.scrollReqId) cancelAnimationFrame(this.scrollReqId);
    this._stopPerfLoop();

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

  getInfo() {
    return {
      id: 'kxTurboDev',
      name: 'TurboDev',
      color1: '#3498db',
      color2: '#2872a3',
      color3: '#10496f',
      blocks: [
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
          opcode: 'runCommand',
          blockType: Scratch.BlockType.COMMAND,
          text: 'run command [COMMAND]',
          arguments: {
            COMMAND: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'help',
            },
          },
        },
        '---',
        {
          opcode: 'queryUser',
          blockType: Scratch.BlockType.COMMAND,
          text: 'query user [PROMPT] expecting [TYPE]',
          arguments: {
            PROMPT: { type: Scratch.ArgumentType.STRING, defaultValue: 'Confirm action?' },
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
        '---',
        {
          opcode: 'registerSettingToggle',
          blockType: Scratch.BlockType.COMMAND,
          text: 'register toggle setting [ID] name [NAME] default [DEF]',
          arguments: {
            ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'darkMode' },
            NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'Dark Mode' },
            DEF: { type: Scratch.ArgumentType.BOOLEAN, defaultValue: 'false' },
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
        '---',
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
        '---',
        {
          opcode: 'printText',
          blockType: Scratch.BlockType.COMMAND,
          text: 'print [TEXT]',
          arguments: {
            TEXT: { type: Scratch.ArgumentType.STRING, defaultValue: 'System Ready...' },
          },
        },
        {
          opcode: 'startLoading',
          blockType: Scratch.BlockType.COMMAND,
          text: 'start loading group [TEXT]',
          arguments: {
            TEXT: { type: Scratch.ArgumentType.STRING, defaultValue: 'Loading assets...' },
          },
        },
        {
          opcode: 'finishLoading',
          blockType: Scratch.BlockType.COMMAND,
          text: 'finish loading group [STATUS]',
          arguments: {
            STATUS: {
              type: Scratch.ArgumentType.STRING,
              menu: 'LOADING_STATUS',
              defaultValue: 'success',
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
        '---',
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
          opcode: 'whenCommandReceived',
          blockType: Scratch.BlockType.EVENT,
          text: 'when command received',
          isEdgeActivated: false, // REQUIRED boilerplate for Event blocks
        },
        {
          opcode: 'getLastCommand',
          blockType: Scratch.BlockType.REPORTER,
          text: 'last command',
        },
        {
          opcode: 'getCommandArg',
          blockType: Scratch.BlockType.REPORTER,
          text: 'argument [INDEX] of last command',
          arguments: {
            INDEX: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
          },
        },
        {
          opcode: 'isTerminalOpen',
          blockType: Scratch.BlockType.BOOLEAN,
          text: 'is terminal open?',
        },
      ],
      menus: {
        LOADING_STATUS: {
          acceptReporters: true,
          items: ['success', 'error'],
        },
        QUERY_TYPES: {
          acceptReporters: true,
          items: ['text', 'number', 'boolean', 'confirmation'],
        },
        SYSTEM_SETTINGS: {
          acceptReporters: true,
          items: ['fontSize', 'opacity', 'cliMode', 'showTimestamps', 'theme'],
        },
      },
    };
  }

  _cancelPendingQuery() {
    if (this.pendingQuery && this.pendingQuery.resolve) {
      this.pendingQuery.resolve(); // Resolve empty string/null to unblock stack
      this.pendingQuery = null;
      this.promptLabel.textContent = '>';
      this.inputField.classList.remove('ext_kxTurboDev-input-shake');
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
    const titleText = document.createTextNode('TurboDev');
    titleGroup.appendChild(statusDot);
    titleGroup.appendChild(titleText);

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

    this.inputField.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        this._handleCommand(this.inputField.value);
        this.inputField.value = '';
      } else if (e.key === 'Tab') {
        e.preventDefault();
        this._handleTabCompletion();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (this.historyIndex < this.commandHistory.length - 1) {
          this.historyIndex++;
          const idx = this.commandHistory.length - 1 - this.historyIndex;
          this.inputField.value = this.commandHistory[idx];
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (this.historyIndex > 0) {
          this.historyIndex--;
          const idx = this.commandHistory.length - 1 - this.historyIndex;
          this.inputField.value = this.commandHistory[idx];
        } else if (this.historyIndex === 0) {
          this.historyIndex = -1;
          this.inputField.value = '';
        }
      }
    });

    this.container.addEventListener('click', e => {
      if (this.isMinimized) return;

      // Only boost z-index if NOT in CLI mode to avoid covering modals
      if (!this.systemSettings.cliMode) {
        this.container.style.zIndex = '99999';
      }

      if (this.settingsPanel.classList.contains('open') && this.settingsPanel.contains(e.target)) {
        return;
      }

      // Only focus input if in normal mode
      if (!this.isPerfMode) {
        const sel = window.getSelection();
        if (sel.toString().length === 0) {
          this.inputField.focus();
        }
      }
    });
  }

  _applySystemSettings() {
    this._setTheme(this.systemSettings.theme);
    if (this.systemSettings.cliMode) {
      this._setCliMode(true);
    } else {
      if (this.container) this.container.style.opacity = this.systemSettings.opacity;
    }
    if (this.outputContainer)
      this.outputContainer.style.fontSize = `${this.systemSettings.fontSize}px`;
    if (this.inputField) this.inputField.style.fontSize = `${this.systemSettings.fontSize}px`;
  }

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
  }

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
  }

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
  }

  _startPerfLoop() {
    if (this.perfReqId) return; // Already running
    this._loopPerformance();
  }

  _stopPerfLoop() {
    if (this.perfReqId) {
      cancelAnimationFrame(this.perfReqId);
      this.perfReqId = null;
    }
  }

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

  _showToast(message, duration = 2000) {
    this.toast.textContent = message;
    this.toast.classList.add('show');
    setTimeout(() => {
      this.toast.classList.remove('show');
    }, duration);
  }

  _toggleMinimize() {
    this.isMinimized = !this.isMinimized;
    if (this.isMinimized) {
      this.container.classList.add('ext_kxTurboDev-minimized');
    } else {
      this.container.classList.remove('ext_kxTurboDev-minimized');
      setTimeout(() => this.inputField.focus(), 50);
    }
  }

  _handleTabCompletion() {
    const current = this.inputField.value;
    if (!current) return;
    const matches = Array.from(this.registeredCommands.keys()).filter(cmd =>
      cmd.startsWith(current)
    );
    if (matches.length === 1) {
      this.inputField.value = matches[0] + ' ';
    } else if (matches.length > 1) {
      this._addLine(`@c #7f8c8d:Possible commands: ${matches.join(', ')}@c`);
    }
  }

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
      if (!this.systemSettings.cliMode) {
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
      const text = this.outputContainer.innerText;
      // Add try-catch for robustness
      navigator.clipboard
        .writeText(text)
        .then(() => {
          this._showToast('Copied to Clipboard!');
        })
        .catch(err => {
          this._showToast('Writing to the clipboard is not allowed', 2000);
        });
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
  }

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
  }

  _exportLogs() {
    try {
      const lines = [];
      for (let i = 0; i < this.outputContainer.children.length; i++) {
        lines.push(this.outputContainer.children[i].textContent);
      }
      const text = lines.join('\n');
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
  }

  _updateCliPosition() {
    if (!this.systemSettings.cliMode) return;

    const canvas = vm.renderer.canvas;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      this.container.style.position = 'fixed';
      this.container.style.left = rect.left + 'px';
      this.container.style.top = rect.top + 'px';
      this.container.style.width = rect.width + 'px';
      this.container.style.height = rect.height + 'px';
    }
    this.cliReqId = requestAnimationFrame(this._updateCliPosition.bind(this));
  }

  _setCliMode(enabled) {
    this.systemSettings.cliMode = enabled;
    if (enabled) {
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
      this.cliReqId = requestAnimationFrame(this._updateCliPosition.bind(this));
    } else {
      this.container.classList.remove('ext_kxTurboDev-cli-mode');

      // Stop tracking loop
      if (this.cliReqId) {
        cancelAnimationFrame(this.cliReqId);
        this.cliReqId = null;
      }

      // Restore manual positioning
      this.container.style.position = 'absolute';
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
  }

  setSystemSetting(args) {
    const setting = args.SETTING;
    let val = args.VALUE;

    // Type conversion
    if (setting === 'fontSize') val = parseInt(val) || 13;
    if (setting === 'opacity') val = parseFloat(val) || 1.0;
    if (setting === 'cliMode' || setting === 'showTimestamps') {
      val = String(val).toLowerCase() === 'true';
    }

    this.systemSettings[setting] = val;
    this._saveSettings();

    // Apply side effects
    if (setting === 'fontSize') {
      this.outputContainer.style.fontSize = `${val}px`;
      this.inputField.style.fontSize = `${val}px`;
    } else if (setting === 'opacity' && !this.systemSettings.cliMode) {
      this.container.style.opacity = val;
    } else if (setting === 'cliMode') {
      this._setCliMode(val);
    } else if (setting === 'theme') {
      this._setTheme(val);
    }

    if (this.settingsPanel.classList.contains('open')) this._refreshSettingsUI();
  }

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
  }

  lockSetting(args) {
    this.lockedSettings.add(String(args.ID));
    if (this.settingsPanel.classList.contains('open')) this._refreshSettingsUI();
  }

  unlockSetting(args) {
    this.lockedSettings.delete(String(args.ID));
    if (this.settingsPanel.classList.contains('open')) this._refreshSettingsUI();
  }

  lockSettingsMenu() {
    this.isSettingsMenuLocked = true;
    this.settingsBtn.style.display = 'none';
    // Force close if open
    if (this.settingsPanel.classList.contains('open')) {
      this.settingsPanel.classList.remove('open');
    }
  }

  unlockSettingsMenu() {
    this.isSettingsMenuLocked = false;
    // Only show if not in CLI mode (which hides it by default css)
    if (!this.container.classList.contains('ext_kxTurboDev-cli-mode')) {
      this.settingsBtn.style.display = 'flex';
    }
  }

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
  }

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
  }

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

    input.onchange = e => {
      let val = parseFloat(e.target.value);
      if (val < min) val = min;
      if (val > max) val = max;
      e.target.value = val;
      onChange(val);
    };

    row.appendChild(label);
    row.appendChild(input);
    container.appendChild(row);
  }

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
  }

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
  }

  _makeDraggable(dragHandle) {
    let isDragging = false;
    let startX, startY, initialLeft, initialTop;

    dragHandle.addEventListener('mousedown', e => {
      // Don't drag if clicking a button or if in CLI mode
      if (e.target.closest('.ext_kxTurboDev-control-btn')) return;
      if (this.systemSettings.cliMode) return;

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
      const newLeft = initialLeft + dx;
      let newTop = initialTop + dy;

      // Don't allow top bar to go off bottom or too far top
      if (newTop < 0) newTop = 0;
      if (newTop > window.innerHeight - 30) newTop = window.innerHeight - 30;

      this.container.style.left = `${newLeft}px`;
      this.container.style.top = `${newTop}px`;
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });
  }

  _handleCommand(text) {
    // Hard Limit on Input Length
    if (text.length > 512) {
      this._addLine(`@c #e74c3c:Error: Input too long (max 512 chars).@c`);
      return;
    }

    if (!text.trim()) return;
    const cleanText = text.trim();
    const commandName = cleanText.split(' ')[0];

    try {
      // If we are pending a query, capture this input
      if (this.pendingQuery) {
        // Echo what user typed
        this._addLine(`@c #9b59b6:${text}@c`);

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
          if (this.pendingQuery.resolve) {
            this.pendingQuery.resolve();
          }
          this.pendingQuery = null;
          this.promptLabel.textContent = '>'; // Reset prompt
        } else {
          this._addLine(`@c #e74c3c:Invalid input. Expected ${type}.@c`);
          // Shake Effect
          this.inputField.classList.add('ext_kxTurboDev-input-shake');
          setTimeout(() => this.inputField.classList.remove('ext_kxTurboDev-input-shake'), 300);
        }
        return;
      }

      // Standard Command Logic
      // Echo command with USER tag
      this._addLine(`@c #9b59b6:${this.promptLabel.textContent} ${text}@c`);

      // Store History
      this.lastCommand = text;
      this.commandHistory.push(text);
      // Cap history
      if (this.commandHistory.length > this.MAX_HISTORY) this.commandHistory.shift();
      this.historyIndex = -1;

      // Internal Command Handling
      if (commandName === 'help') {
        this._addLine('@c #7f8c8d:--- Registered Commands ---@c');
        this.registeredCommands.forEach((desc, name) => {
          this._addLine(`@c #7f8c8d:${name.padEnd(12)} : ${desc}@c`);
        });
        return;
      }

      if (commandName === 'clear') {
        this.clearTerminal();
        return;
      }

      if (commandName === 'history') {
        const recent = this.commandHistory.slice(-10);
        this._addLine('@c #7f8c8d:--- Command History ---@c');
        recent.forEach((cmd, i) => this._addLine(`@c #7f8c8d:${i + 1}. ${cmd}@c`));
        return;
      }

      if (commandName === 'echo') {
        const msg = cleanText.substring(5);
        this._addLine(msg);
        return;
      }

      if (commandName === 'theme') {
        const newTheme = cleanText.substring(6).trim();
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
        const stage = vm.runtime.getTargetForStage();
        if (stage && stage.variables) {
          for (const id in stage.variables) {
            const v = stage.variables[id];
            if (v.type === '') {
              // Standard var
              this._addLine(`@c #7f8c8d:${v.name}: ${v.value}@c`);
            }
          }
        }
        return;
      }

      if (commandName === 'listsprites') {
        this._addLine('@c #7f8c8d:--- Targets ---@c');
        const counts = {};
        vm.runtime.targets.forEach(t => {
          const name = t.sprite.name;
          counts[name] = (counts[name] || 0) + 1;
        });
        for (const name in counts) {
          this._addLine(
            `@c #7f8c8d:${name}: ${counts[name]} (1 orig + ${counts[name] - 1} clones)@c`
          );
        }
        return;
      }

      // Trigger Scratch Hat Block for custom logic
      // We set a flag to ensure polling works if startHats fails to run the thread immediately
      this._triggerHat = true;

      const hatOpcode = `${this.getInfo().id}_whenCommandReceived`;
      console.log(`[TurboDev] Firing hat block: ${hatOpcode}`);
      const threads = vm.runtime.startHats(hatOpcode);
      console.log(`[TurboDev] Threads started: ${threads.length}`);

      // Reset trigger after a short delay (single frame pulse)
      setTimeout(() => {
        this._triggerHat = false;
      }, 50);
    } catch (err) {
      console.error('TurboDev Command Error:', err);
      this._addLine(`@c #e74c3c:System Error: ${err.message}@c`);
    }
  }

  _scrollToBottom() {
    if (this.scrollReqId) cancelAnimationFrame(this.scrollReqId);
    this.scrollReqId = requestAnimationFrame(() => {
      this.outputContainer.scrollTop = this.outputContainer.scrollHeight;
      this.scrollReqId = null;
    });
  }

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
  }

  _addLine(text) {
    const line = document.createElement('div');
    line.className = 'ext_kxTurboDev-terminal-line';

    // Add Indentation
    line.style.paddingLeft = `${this.indentLevel * 24}px`;

    // Add Timestamp
    if (this.systemSettings.showTimestamps) {
      const timeSpan = document.createElement('span');
      timeSpan.className = 'ext_kxTurboDev-log-time';
      const now = new Date();
      timeSpan.textContent = `[${now.toLocaleTimeString('en-US', { hour12: false })}] `;
      line.appendChild(timeSpan);
    }

    const textSpan = document.createElement('span');
    // Parse for custom formatting codes
    textSpan.innerHTML = this._parseFormatting(text);

    // Default styling is now handled by CSS var, no specific type class logic
    textSpan.style.color = 'var(--ext_kxTurboDev-term-text)';

    line.appendChild(textSpan);

    this.outputContainer.appendChild(line);

    // Limit line count to 500 to prevent lag
    while (this.outputContainer.children.length > 500) {
      this.outputContainer.removeChild(this.outputContainer.firstChild);
    }

    // Only auto-scroll if at bottom
    if (this.isAutoScrolling) {
      this._scrollToBottom();
    }
  }

  // --- Loading Group Logic ---

  startLoading(args) {
    const text = String(args.TEXT);
    const line = document.createElement('div');
    line.className =
      'ext_kxTurboDev-terminal-line ext_kxTurboDev-term-system ext_kxTurboDev-loader-sticky';

    // Apply indentation
    line.style.paddingLeft = `${this.indentLevel * 24}px`;

    // Apply top offset for sticky nesting (approx 26px per level)
    line.style.top = `${this.indentLevel * 26}px`;

    // Spinner Element
    const spinnerSpan = document.createElement('span');
    spinnerSpan.style.fontFamily = 'monospace';
    spinnerSpan.style.display = 'inline-block';
    spinnerSpan.style.width = '14px';
    spinnerSpan.style.marginRight = '8px';
    spinnerSpan.style.color = 'var(--ext_kxTurboDev-term-accent)'; // Changed to var
    // Initial Frame (ASCII)
    spinnerSpan.textContent = this.ASCII_FRAMES[0];

    const textSpan = document.createElement('span');
    textSpan.innerHTML = this._parseFormatting(text);

    line.appendChild(spinnerSpan);
    line.appendChild(textSpan);
    this.outputContainer.appendChild(line);

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
    });

    // Increase indentation for subsequent logs
    this.indentLevel++;
  }

  finishLoading(args) {
    if (this.loaderStack.length === 0) return;

    const loader = this.loaderStack.pop();
    clearInterval(loader.interval);

    // Remove sticky behavior
    loader.line.classList.remove('ext_kxTurboDev-loader-sticky');
    loader.line.style.top = ''; // Reset top

    // Decrease indentation
    this.indentLevel = Math.max(0, this.indentLevel - 1);

    // Update Tag & Icon
    const isSuccess = args.STATUS === 'success';

    // Update Spinner to Status Symbol (ASCII)
    // OK or X
    loader.spinner.textContent = isSuccess ? '[OK]' : '[X]';
    loader.spinner.style.color = isSuccess ? '#2ecc71' : '#e74c3c';
    loader.spinner.style.width = 'auto';
    loader.spinner.style.marginRight = '8px';
  }

  // --- Block Implementations ---

  runCommand(args) {
    this._handleCommand(String(args.COMMAND));
  }

  // Implements Ask and Wait Pattern
  queryUser(args) {
    const prompt = String(args.PROMPT);
    const type = args.TYPE;

    // Show terminal if hidden
    if (!this.isVisible) this.showTerminal();

    this._addLine(`@c #e67e22:${prompt}@c`);
    this.promptLabel.textContent = '?'; // Visual cue
    this.inputField.focus(); // Focus input

    return new Promise(resolve => {
      this.pendingQuery = {
        type: type,
        resolve: resolve,
      };
    });
  }

  getAnswer() {
    return this.userAnswer;
  }

  getCommandArg(args) {
    const index = parseInt(args.INDEX) || 0;
    if (index < 0) return '';
    const parts = this.lastCommand.trim().split(/\s+/);
    if (index >= parts.length) return '';
    return parts[index] || '';
  }

  whenCommandReceived() {
    // Return the trigger state - effectively polling + event support
    return this._triggerHat;
  }

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
      this.registeredCommands.set(name, desc);
    }
  }

  // New Settings Blocks
  registerSettingToggle(args) {
    const id = String(args.ID);

    // Protect against Spam
    if (this.customSettings.size >= this.MAX_SETTINGS) return;

    if (!this.customSettings.has(id)) {
      this.customSettings.set(id, {
        type: 'toggle',
        name: String(args.NAME),
        value: String(args.DEF).toLowerCase() === 'true', // Bug fix
      });
    }
  }

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
  }

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
  }

  getSettingValue(args) {
    const id = String(args.ID);
    if (this.customSettings.has(id)) {
      return this.customSettings.get(id).value;
    }
    return '';
  }

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
  }

  hideTerminal() {
    if (this.container) {
      this.container.style.display = 'none';
      this.isVisible = false;
      this.settingsPanel.classList.remove('open');

      // Safety: Resolve any pending query to unblock thread
      this._cancelPendingQuery();
      this._stopPerfLoop();
    }
  }

  clearTerminal() {
    if (this.outputContainer) {
      this.outputContainer.innerHTML = '';
    }
    this.indentLevel = 0;
    this.loaderStack.forEach(l => clearInterval(l.interval));
    this.loaderStack = [];

    // Safety: Resolve any pending query
    this._cancelPendingQuery();
  }

  printText(args) {
    // Debugging
    console.log('[TurboDev] printText called with:', args);
    // Ensure string conversion to prevent crashes if input is null/undefined
    this._addLine(String(args.TEXT));
  }

  setPrompt(args) {
    if (this.promptLabel) {
      this.promptLabel.textContent = args.TEXT;
    }
  }

  getLastCommand() {
    console.log('[TurboDev] getLastCommand called. Value:', this.lastCommand);
    return this.lastCommand || '';
  }

  isTerminalOpen() {
    return this.isVisible;
  }
}

Scratch.extensions.register(new TurboDevExtension());
