const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      display: block;
    }

    .container {
      background: var(--color-surface);
      border-radius: 16px;
      padding: 24px;
      margin: 8px;
      box-shadow: 0 4px 20px var(--color-shadow);
      border: 1px solid var(--color-border);
    }

    .container-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }

    .container-title {
      font-size: 11px;
      font-weight: 700;
      color: var(--color-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.8px;
    }

    .filter-bar {
      display: flex;
      gap: 6px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }

    .filter-btn {
      padding: 5px 14px;
      border: 1px solid var(--color-border);
      border-radius: 20px;
      background: var(--color-surface);
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      color: var(--color-text-muted);
      transition: all 0.2s ease;
      letter-spacing: 0.3px;
    }

    .filter-btn:hover {
      background-color: var(--color-hover);
      border-color: var(--color-accent);
      color: var(--color-accent);
    }

    .filter-btn.active {
      background: linear-gradient(135deg, #7c3aed, #4f46e5);
      color: white;
      border-color: transparent;
      box-shadow: 0 2px 8px rgba(124, 58, 237, 0.3);
    }

    .alert-list {
      max-height: 340px;
      overflow-y: auto;
    }

    .alert-list::-webkit-scrollbar       { width: 4px; }
    .alert-list::-webkit-scrollbar-track { background: transparent; }
    .alert-list::-webkit-scrollbar-thumb {
      background: var(--color-border);
      border-radius: 4px;
    }

    .empty-state {
      text-align: center;
      padding: 32px 0;
      color: var(--color-text-muted);
      font-size: 13px;
    }
  </style>

  <div class="container">
    <div class="container-header">
      <div class="container-title">Alerts</div>
    </div>
    <div class="filter-bar" role="group" aria-label="Filter alerts by severity">
      <button class="filter-btn active" data-filter="all">All</button>
      <button class="filter-btn" data-filter="critical">Critical</button>
      <button class="filter-btn" data-filter="warning">Warning</button>
      <button class="filter-btn" data-filter="info">Info</button>
    </div>
    <div class="alert-list" role="list"></div>
  </div>
`;

class AlertList extends HTMLElement {

  constructor() {
    super();
    this.attachShadow({ mode: 'open' })
        .appendChild(template.content.cloneNode(true));
  }

  connectedCallback() {
    this._currentFilter = 'all';

    this.shadowRoot.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.shadowRoot.querySelectorAll('.filter-btn').forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
        this._currentFilter = btn.getAttribute('data-filter');
        this._render();
      });
    });
  }

  set alerts(data) {
    this._alerts = data;
    this._render();
  }

  _render() {
    if (!this.shadowRoot || !this._alerts) return;

    const filtered = this._currentFilter === 'all'
      ? this._alerts
      : this._alerts.filter(a => a.severity === this._currentFilter);

    const list = this.shadowRoot.querySelector('.alert-list');
    list.innerHTML = '';

    if (filtered.length === 0) {
      list.innerHTML = '<div class="empty-state">No alerts found</div>';
      return;
    }

    filtered.forEach(alert => {
      const item = document.createElement('alert-item');
      item.setAttribute('severity',  alert.severity);
      item.setAttribute('heading',   alert.title);
      item.setAttribute('service',   alert.service);
      item.setAttribute('timestamp', alert.timestamp);
      item.setAttribute('status',    alert.status);
      item.setAttribute('message',   alert.message || '');
      list.appendChild(item);
    });
  }
}

customElements.define('alert-list', AlertList);
