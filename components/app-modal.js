const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      display: none;
    }

    :host([open]) {
      display: flex;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(4px);
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 0.2s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }

    .modal {
      background: var(--color-surface);
      border-radius: 20px;
      min-width: 420px;
      max-width: 560px;
      width: 90%;
      box-shadow: 0 24px 64px rgba(0, 0, 0, 0.3), 0 0 0 1px var(--color-border);
      animation: slideUp 0.3s ease;
      overflow: hidden;
    }

    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to   { transform: translateY(0);    opacity: 1; }
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 24px;
      background: linear-gradient(135deg, #1a1a1a 0%, #2d1b69 100%);
      color: white;
    }

    .modal-title {
      font-size: 16px;
      font-weight: 700;
      color: white;
    }

    .close-button {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      font-size: 14px;
      cursor: pointer;
      color: white;
      width: 28px;
      height: 28px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      font-weight: 700;
    }

    .close-button:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    .modal-body {
      padding: 24px;
      color: var(--color-text);
      line-height: 1.7;
    }
  </style>

  <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-heading">
    <div class="modal-header">
      <div class="modal-title" id="modal-heading">
        <slot name="title">Details</slot>
      </div>
      <button class="close-button" aria-label="Close modal">x</button>
    </div>
    <div class="modal-body">
      <slot name="content"></slot>
    </div>
  </div>
`;

class AppModal extends HTMLElement {

  connectedCallback() {
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(template.content.cloneNode(true));

    shadow.querySelector('.close-button').addEventListener('click', () => {
      this.close();
    });

    this._onKeyDown = (e) => {
      if (e.key === 'Escape') this.close();
    };

    document.addEventListener('keydown', this._onKeyDown);
  }

  disconnectedCallback() {
    document.removeEventListener('keydown', this._onKeyDown);
  }

  openModal() {
    this.setAttribute('open', '');
  }

  close() {
    this.removeAttribute('open');
    this.dispatchEvent(new CustomEvent('modal-closed', {
      bubbles:  true,
      composed: true
    }));
  }
}

customElements.define('app-modal', AppModal);
