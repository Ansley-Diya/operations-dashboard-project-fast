import {
  FASTElement,
  attr,
  css,
  html,
} from 'https://cdn.jsdelivr.net/npm/@microsoft/fast-element@3.0.2/+esm';

const metricCardTemplate = html`
  <div class="card" role="region" aria-label="${x => `${x.heading || ''}: ${x.value || '-'}`} ">
    <div class="card-label">${x => x.heading}</div>
    <div class="card-value">${x => x.value || '-'}</div>
  </div>
`;

const metricCardStyles = css`
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
`;

class MetricCard extends FASTElement {
  heading = '';
  value = '';
}

attr(MetricCard.prototype, 'heading');
attr(MetricCard.prototype, 'value');

MetricCard.define({
  name: 'metric-card',
  template: metricCardTemplate,
  styles: metricCardStyles,
});
