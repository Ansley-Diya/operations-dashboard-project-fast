const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      display: block;
    }

    .toast {
      background: var(--color-surface);
      color: var(--color-text);
      padding: 12px 16px;
      border-radius: 12px;
      font-size: 13px;
      font-weight: 500;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15), 0 0 0 1px var(--color-border);
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 220px;
      max-width: 320px;
      animation: slideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    @keyframes slideIn {
      from { opacity: 0; transform: translateX(100%) scale(0.9); }
      to   { opacity: 1; transform: translateX(0)    scale(1); }
    }

    .toast-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .toast.success .toast-indicator { background: #22c55e; }
    .toast.error   .toast-indicator { background: #ef4444; }
    .toast.warning .toast-indicator { background: #f59e0b; }
    .toast.info    .toast-indicator { background: #7c3aed; }

    .toast.success { border-left: 3px solid #22c55e; }
    .toast.error   { border-left: 3px solid #ef4444; }
    .toast.warning { border-left: 3px solid #f59e0b; }
    .toast.info    { border-left: 3px solid #7c3aed; }
  </style>

  <div class="toast" role="alert" aria-live="assertive">
    <div class="toast-indicator" aria-hidden="true"></div>
    <span class="toast-message"></span>
  </div>
`;

class ToastMessage extends HTMLElement {

  constructor() {
    super();
    this.attachShadow({ mode: 'open' })
        .appendChild(template.content.cloneNode(true));
  }

  connectedCallback() {
    this._render();

    this._timer = setTimeout(() => {
      this.remove();
    }, 3000);
  }

  disconnectedCallback() {
    clearTimeout(this._timer);
  }

  static get observedAttributes() {
    return ['type', 'message'];
  }

  attributeChangedCallback() {
    this._render();
  }

  _render() {
    if (!this.shadowRoot) return;

    const type    = this.getAttribute('type')    || 'info';
    const message = this.getAttribute('message') || '';

    const toast = this.shadowRoot.querySelector('.toast');
    toast.className = `toast ${type}`;
    this.shadowRoot.querySelector('.toast-message').textContent = message;
  }
}

customElements.define('toast-message', ToastMessage);
