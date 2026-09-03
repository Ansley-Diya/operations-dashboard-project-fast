import {
  FASTElement,
  css,
  html,
  observable,
  repeat,
} from 'https://cdn.jsdelivr.net/npm/@microsoft/fast-element@3.0.2/+esm';

const serviceRowTemplate = html`
  <div
    class="service-item"
    role="listitem"
    aria-label="${service => `${service.name}: ${service.status}`}"
    tabindex="0"
    @click="${(service, context) => context.parent.selectService(service)}"
    @keydown="${(service, context) => context.parent.handleKeydown(service, context.event)}"
  >
    <div class="status-dot ${service => service.status}" aria-hidden="true"></div>
    <span class="service-name">${service => service.name}</span>
    <span class="service-status-label ${service => service.status}">${service => service.status}</span>
  </div>
`;

const serviceStatusTemplate = html`
  <div class="container">
    <div class="container-header">
      <div class="container-title">Service Status</div>
      <div class="count-badge" aria-live="polite">
        ${x => `${x.operationalCount} / ${x.services.length} Online`}
      </div>
    </div>
    <div class="service-list" role="list">
      ${repeat(x => x.services, serviceRowTemplate)}
    </div>
  </div>
`;

const serviceStatusStyles = css`
  :host { display: block; }
  .container { background: var(--color-surface); border-radius: 16px; padding: 24px; margin: 8px; box-shadow: 0 4px 20px var(--color-shadow); border: 1px solid var(--color-border); }
  .container-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
  .container-title { font-size: 11px; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.8px; }
  .count-badge { background: linear-gradient(135deg, #7c3aed, #4f46e5); color: white; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 10px; }
  .service-item { display: flex; align-items: center; padding: 10px 12px; border-radius: 10px; margin-bottom: 4px; cursor: pointer; transition: all 0.2s ease; border: 1px solid transparent; }
  .service-item:hover { background-color: var(--color-hover); border-color: var(--color-border); transform: translateX(2px); }
  .status-dot { width: 10px; height: 10px; border-radius: 50%; margin-right: 12px; flex-shrink: 0; }
  .status-dot.operational { background-color: #22c55e; box-shadow: 0 0 8px rgba(34, 197, 94, 0.5); }
  .status-dot.degraded { background-color: #f59e0b; box-shadow: 0 0 8px rgba(245, 158, 11, 0.5); }
  .status-dot.down { background-color: #ef4444; box-shadow: 0 0 8px rgba(239, 68, 68, 0.5); }
  .service-name { font-size: 13px; font-weight: 500; color: var(--color-text); flex: 1; }
  .service-status-label { font-size: 11px; font-weight: 600; text-transform: capitalize; padding: 2px 8px; border-radius: 8px; }
  .service-status-label.operational { color: #16a34a; background: rgba(34, 197, 94, 0.1); }
  .service-status-label.degraded { color: #d97706; background: rgba(245, 158, 11, 0.1); }
  .service-status-label.down { color: #dc2626; background: rgba(239, 68, 68, 0.1); }
`;

class ServiceStatus extends FASTElement {
  constructor() {
    super();
    this.services = [];
  }

  get operationalCount() {
    return this.services.filter(service => service.status === 'operational').length;
  }

  selectService(service) {
    this.dispatchEvent(new CustomEvent('service-selected', {
      detail: service,
      bubbles: true,
      composed: true,
    }));
  }

  handleKeydown(service, event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.selectService(service);
    }
  }
}

observable(ServiceStatus.prototype, 'services');

ServiceStatus.define({
  name: 'service-status',
  template: serviceStatusTemplate,
  styles: serviceStatusStyles,
});
