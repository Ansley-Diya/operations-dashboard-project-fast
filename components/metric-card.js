// FASTElement → base class (replaces HTMLElement + attachShadow + template clone boilerplate)
// attr         → makes an HTML attribute reactive (replaces observedAttributes + attributeChangedCallback + getter/setter)
// html         → tagged template literal for the component's Shadow DOM markup, with live ${x => ...} bindings
// css          → tagged template literal for the component's Shadow DOM styles
import { FASTElement, attr, html, css } from "@microsoft/fast-element";

// x here = the MetricCard component instance (not a list item — this component has no repeat())
// NOTE: the attribute is called "heading", not "title" — "title" is a reserved global HTML attribute
// that makes the browser show a native tooltip on hover, which fights with our own aria-label.
const template = html`
  <div
    class="metric-card"
    role="region"
    aria-label="${x => `${x.heading || ''}: ${x.value || '-'}`}"
  >
    <div class="card-label">${x => x.heading}</div>
    <div class="card-value">${x => x.value || '-'}</div>
  </div>
`;

const styles = css`
  :host { display: block; }

  .metric-card {
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

  .metric-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 32px var(--color-shadow);
  }

  .metric-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
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

// No constructor, no methods — this component only ever displays data it's given.
class MetricCard extends FASTElement {}

// attr() installs a real getter/setter pair on the prototype for each HTML attribute below.
// main.js sets these with cards[i].setAttribute("heading", ...) / setAttribute("value", ...) —
// attr() keeps the attribute and the JS property in sync automatically in both directions.
attr(MetricCard.prototype, "heading");
attr(MetricCard.prototype, "value");

// define() registers the template + styles + attrs, then calls the real
// customElements.define("metric-card", MetricCard) — the native browser API.
MetricCard.define({
  name: "metric-card",
  template,
  styles,
});
