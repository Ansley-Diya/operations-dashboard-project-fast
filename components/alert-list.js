import {
  FASTElement,
  css,
  html,
  observable,
  repeat,
  when,
} from 'https://cdn.jsdelivr.net/npm/@microsoft/fast-element@3.0.2/+esm';

const filterOptions = [
  { label: 'All', value: 'all' },
  { label: 'Critical', value: 'critical' },
  { label: 'Warning', value: 'warning' },
  { label: 'Info', value: 'info' },
];

const filterButtonTemplate = html`
  <button
    class="filter-btn ${(filter, context) => filter.value === context.parent.currentFilter ? 'active' : ''}"
    aria-pressed="${(filter, context) => filter.value === context.parent.currentFilter ? 'true' : 'false'}"
    @click="${(filter, context) => context.parent.setFilter(filter.value)}"
  >${filter => filter.label}</button>
`;

const alertListTemplate = html`
  <div class="container">
    <div class="container-header">
      <div class="container-title">Alerts</div>
    </div>
    <div class="filter-bar" role="group" aria-label="Filter alerts by severity">
      ${repeat(() => filterOptions, filterButtonTemplate)}
    </div>
    <div class="alert-list" role="list">
      ${when(x => x.filteredAlerts.length === 0, html`<div class="empty-state">No alerts found</div>`)}
      ${repeat(x => x.filteredAlerts, html`
        <alert-item :alert="${alert => alert}"></alert-item>
      `)}
    </div>
  </div>
`;

const alertListStyles = css`
  :host { display: block; }
  .container { background: var(--color-surface); border-radius: 16px; padding: 24px; margin: 8px; box-shadow: 0 4px 20px var(--color-shadow); border: 1px solid var(--color-border); }
  .container-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
  .container-title { font-size: 11px; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.8px; }
  .filter-bar { display: flex; gap: 6px; margin-bottom: 16px; flex-wrap: wrap; }
  .filter-btn { padding: 5px 14px; border: 1px solid var(--color-border); border-radius: 20px; background: var(--color-surface); font-size: 11px; font-weight: 600; cursor: pointer; color: var(--color-text-muted); transition: all 0.2s ease; letter-spacing: 0.3px; }
  .filter-btn:hover { background-color: var(--color-hover); border-color: var(--color-accent); color: var(--color-accent); }
  .filter-btn.active { background: linear-gradient(135deg, #7c3aed, #4f46e5); color: white; border-color: transparent; box-shadow: 0 2px 8px rgba(124, 58, 237, 0.3); }
  .alert-list { max-height: 340px; overflow-y: auto; }
  .alert-list::-webkit-scrollbar { width: 4px; }
  .alert-list::-webkit-scrollbar-track { background: transparent; }
  .alert-list::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 4px; }
  .empty-state { text-align: center; padding: 32px 0; color: var(--color-text-muted); font-size: 13px; }
`;

class AlertList extends FASTElement {
  constructor() {
    super();
    this.alerts = [];
    this.currentFilter = 'all';
  }

  get filteredAlerts() {
    return this.currentFilter === 'all'
      ? this.alerts
      : this.alerts.filter(alert => alert.severity === this.currentFilter);
  }

  setFilter(value) {
    this.currentFilter = value;
  }
}

observable(AlertList.prototype, 'alerts');
observable(AlertList.prototype, 'currentFilter');

AlertList.define({
  name: 'alert-list',
  template: alertListTemplate,
  styles: alertListStyles,
});
