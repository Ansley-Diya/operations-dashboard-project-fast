const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      display: block;
    }

    .card {
      background: var(--color-surface);
      border-radius: 16px;
      padding: 24px;
      margin: 8px;
      box-shadow: 0 4px 20px var(--color-shadow);
      border: 1px solid var(--color-border);
      position: relative;
      overflow: hidden;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      cursor: default;
    }

    .card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 32px var(--color-shadow);
    }

    .card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, #7c3aed, #4f46e5);
      border-radius: 16px 16px 0 0;
    }

    .card-label {
      font-size: 11px;
      font-weight: 700;
      color: var(--color-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-bottom: 10px;
    }

    .card-value {
      font-size: 30px;
      font-weight: 800;
      color: var(--color-text);
      letter-spacing: -0.5px;
      line-height: 1;
    }

    .card-title {
      font-size: 13px;
      color: var(--color-text-muted);
      margin-top: 6px;
      font-weight: 500;
    }
  </style>

  <div class="card" role="region" aria-label="Metric">
    <div class="card-label"></div>
    <div class="card-value"></div>
    <div class="card-title"></div>
  </div>
`;

class MetricCard extends HTMLElement {

  static get observedAttributes() {
    return ['title', 'value'];
  }

  connectedCallback() {
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(template.content.cloneNode(true));
    this._render();
  }

  disconnectedCallback() {}

  attributeChangedCallback() {
    this._render();
  }

  _render() {
    if (!this.shadowRoot) return;

    const title = this.getAttribute('title') || '';
    const value = this.getAttribute('value') || '—';

    this.shadowRoot.querySelector('.card-label').textContent = title;
    this.shadowRoot.querySelector('.card-value').textContent = value;

    const card = this.shadowRoot.querySelector('.card');
    card.setAttribute('aria-label', `${title}: ${value}`);
  }
}

customElements.define('metric-card', MetricCard);
