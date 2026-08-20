const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 2000;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      pointer-events: none;
      gap: 8px;
    }

    ::slotted(toast-message) {
      pointer-events: all;
    }
  </style>
  <slot></slot>
`;

class ToastContainer extends HTMLElement {

  connectedCallback() {
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(template.content.cloneNode(true));

    this._onToast = (event) => {
      this._showToast(event.detail.message, event.detail.type);
    };

    window.addEventListener('show-toast', this._onToast);
  }

  disconnectedCallback() {
    window.removeEventListener('show-toast', this._onToast);
  }

  _showToast(message, type = 'info') {
    const toast = document.createElement('toast-message');
    toast.setAttribute('message', message);
    toast.setAttribute('type',    type);
    this.appendChild(toast);
  }
}

customElements.define('toast-container', ToastContainer);
