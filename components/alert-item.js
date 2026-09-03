import {
  FASTElement,
  css,
  html,
  observable,
} from 'https://cdn.jsdelivr.net/npm/@microsoft/fast-element@3.0.2/+esm';

const formatDate = timestamp => {
  const date = new Date(timestamp);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString();
};

const alertItemTemplate = html`
  <div
    class="alert-item"
    role="listitem"
    tabindex="0"
    aria-label="${x => `${x.alert.severity || 'info'} alert: ${x.alert.title}`}"
    @click="${x => x.selectAlert()}"
    @keydown="${(x, context) => x.handleKeydown(context.event)}"
  >
    <span class="severity-badge ${x => x.alert.severity || 'info'}">${x => x.alert.severity || 'info'}</span>
    <div class="alert-body">
      <div class="alert-title">${x => x.alert.title}</div>
      <div class="alert-meta">
        ${x => x.alert.service} - ${x => formatDate(x.alert.timestamp)}
        <span class="status-tag">${x => x.alert.status}</span>
      </div>
    </div>
  </div>
`;

const alertItemStyles = css`
  :host { display: block; }
  .alert-item { display: flex; align-items: flex-start; gap: 12px; padding: 12px; border-radius: 10px; cursor: pointer; transition: all 0.2s ease; margin-bottom: 4px; border: 1px solid transparent; }
  .alert-item:hover { background-color: var(--color-hover); border-color: var(--color-border); }
  .severity-badge { font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 6px; text-transform: uppercase; white-space: nowrap; margin-top: 2px; letter-spacing: 0.5px; flex-shrink: 0; }
  .severity-badge.critical { background: rgba(220, 38, 38, 0.1); color: #dc2626; border: 1px solid rgba(220, 38, 38, 0.2); }
  .severity-badge.warning { background: rgba(217, 119, 6, 0.1); color: #d97706; border: 1px solid rgba(217, 119, 6, 0.2); }
  .severity-badge.info { background: rgba(37, 99, 235, 0.1); color: #2563eb; border: 1px solid rgba(37, 99, 235, 0.2); }
  .alert-body { flex: 1; }
  .alert-title { font-size: 13px; font-weight: 600; color: var(--color-text); margin-bottom: 4px; line-height: 1.4; }
  .alert-meta { font-size: 11px; color: var(--color-text-muted); }
  .status-tag { display: inline-block; padding: 1px 6px; border-radius: 4px; font-size: 10px; margin-left: 6px; background-color: var(--color-border); font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; }
`;

class AlertItem extends FASTElement {
  constructor() {
    super();
    this.alert = {};
  }

  selectAlert() {
    this.dispatchEvent(new CustomEvent('alert-selected', {
      detail: this.alert,
      bubbles: true,
      composed: true,
    }));
  }

  handleKeydown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.selectAlert();
    }
  }
}

observable(AlertItem.prototype, 'alert');

AlertItem.define({
  name: 'alert-item',
  template: alertItemTemplate,
  styles: alertItemStyles,
});
