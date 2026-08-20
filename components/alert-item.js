const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      display: block;
    }

    .alert-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s ease;
      margin-bottom: 4px;
      border: 1px solid transparent;
    }

    .alert-item:hover {
      background-color: var(--color-hover);
      border-color: var(--color-border);
    }

    .severity-badge {
      font-size: 10px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 6px;
      text-transform: uppercase;
      white-space: nowrap;
      margin-top: 2px;
      letter-spacing: 0.5px;
      flex-shrink: 0;
    }

    .severity-badge.critical {
      background: rgba(220, 38, 38, 0.1);
      color: #dc2626;
      border: 1px solid rgba(220, 38, 38, 0.2);
    }

    .severity-badge.warning {
      background: rgba(217, 119, 6, 0.1);
      color: #d97706;
      border: 1px solid rgba(217, 119, 6, 0.2);
    }

    .severity-badge.info {
      background: rgba(37, 99, 235, 0.1);
      color: #2563eb;
      border: 1px solid rgba(37, 99, 235, 0.2);
    }

    .alert-body { flex: 1; }

    .alert-title {
      font-size: 13px;
      font-weight: 600;
      color: var(--color-text);
      margin-bottom: 4px;
      line-height: 1.4;
    }

    .alert-meta {
      font-size: 11px;
      color: var(--color-text-muted);
    }

    .status-tag {
      display: inline-block;
      padding: 1px 6px;
      border-radius: 4px;
      font-size: 10px;
      margin-left: 6px;
      background-color: var(--color-border);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
  </style>

  <div class="alert-item" role="listitem" tabindex="0">
    <span class="severity-badge"></span>
    <div class="alert-body">
      <div class="alert-title"></div>
      <div class="alert-meta"></div>
    </div>
  </div>
`;

class AlertItem extends HTMLElement {

  static get observedAttributes() {
    return ['severity', 'title', 'service', 'timestamp', 'status'];
  }

  connectedCallback() {
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(template.content.cloneNode(true));
    this._render();

    const item = shadow.querySelector('.alert-item');

    item.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('alert-selected', {
        detail: {
          severity:  this.getAttribute('severity'),
          title:     this.getAttribute('title'),
          service:   this.getAttribute('service'),
          timestamp: this.getAttribute('timestamp'),
          status:    this.getAttribute('status')
        },
        bubbles:  true,
        composed: true
      }));
    });

    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        item.click();
      }
    });
  }

  attributeChangedCallback() {
    this._render();
  }

  _render() {
    if (!this.shadowRoot) return;

    const severity  = this.getAttribute('severity')  || 'info';
    const title     = this.getAttribute('title')     || '';
    const service   = this.getAttribute('service')   || '';
    const timestamp = this.getAttribute('timestamp') || '';
    const status    = this.getAttribute('status')    || '';
    const date      = new Date(timestamp).toLocaleDateString();

    const badge = this.shadowRoot.querySelector('.severity-badge');
    badge.textContent = severity;
    badge.className   = `severity-badge ${severity}`;

    this.shadowRoot.querySelector('.alert-title').textContent = title;
    this.shadowRoot.querySelector('.alert-meta').innerHTML =
      `${service} · ${date} <span class="status-tag">${status}</span>`;

    const item = this.shadowRoot.querySelector('.alert-item');
    item.setAttribute('aria-label', `${severity} alert: ${title}`);
  }
}

customElements.define('alert-item', AlertItem);
