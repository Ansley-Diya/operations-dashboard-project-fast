const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      display: block;
      min-height: 100vh;
      background-color: var(--color-background);
    }

    .header {
      background: linear-gradient(135deg, #1a1a1a 0%, #2d1b69 60%, #1a1a1a 100%);
      color: white;
      padding: 0 32px;
      height: 68px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 4px 24px rgba(124, 58, 237, 0.3);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .header-logo {
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #7c3aed, #4f46e5);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 15px;
      font-weight: 800;
      color: white;
      box-shadow: 0 2px 8px rgba(124, 58, 237, 0.4);
      letter-spacing: -0.5px;
    }

    .header-title {
      font-size: 18px;
      font-weight: 700;
      letter-spacing: 0.3px;
      color: white;
    }

    .header-subtitle {
      font-size: 11px;
      color: rgba(255, 255, 255, 0.5);
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-top: 1px;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .status-pill {
      display: flex;
      align-items: center;
      gap: 6px;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.12);
      padding: 5px 12px;
      border-radius: 20px;
      font-size: 12px;
      color: rgba(255, 255, 255, 0.8);
      font-weight: 500;
    }

    .status-dot-live {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #22c55e;
      box-shadow: 0 0 6px #22c55e;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0.4; }
    }

    .theme-toggle {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: white;
      padding: 7px 16px;
      border-radius: 20px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 600;
      transition: all 0.2s ease;
      letter-spacing: 0.3px;
    }

    .theme-toggle:hover {
      background: rgba(124, 58, 237, 0.4);
      border-color: rgba(124, 58, 237, 0.6);
    }

    .main {
      padding: 16px;
    }
  </style>

  <div class="header" role="banner">
    <div class="header-left">
      <div class="header-logo" aria-hidden="true">D</div>
      <div>
        <div class="header-title">Operations Dashboard</div>
        <div class="header-subtitle">Platform Monitor</div>
      </div>
    </div>
    <div class="header-right">
      <div class="status-pill" role="status" aria-live="polite">
        <div class="status-dot-live" aria-hidden="true"></div>
        Live
      </div>
      <button class="theme-toggle" aria-label="Switch to dark mode">Dark Mode</button>
    </div>
  </div>

  <div class="main" role="main">
    <slot name="content"></slot>
  </div>
`;

class AppShell extends HTMLElement {
  connectedCallback() {
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(template.content.cloneNode(true));

    const toggle = shadow.querySelector('.theme-toggle');

    toggle.addEventListener('click', () => {
      const isDark = document.body.classList.toggle('dark');
      toggle.textContent = isDark ? 'Light Mode' : 'Dark Mode';
      toggle.setAttribute('aria-label',
        isDark ? 'Switch to light mode' : 'Switch to dark mode'
      );
    });
  }
}

customElements.define('app-shell', AppShell);
