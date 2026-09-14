// ─── IMPORTS ──────────────────────────────────────────────────────────────────
import { FASTElement, observable, html, css, repeat } from "@microsoft/fast-element";
// FASTElement  → base class (replaces HTMLElement + all constructor boilerplate)
// observable   → makes a JS property reactive (replaces manual property setter + _render())
// html         → creates a reactive template (replaces innerHTML + querySelector + textContent)
// css          → packages styles for Shadow DOM (replaces createElement("style") + appendChild)
// repeat       → renders a list from an array (replaces forEach + createElement + appendChild)


// ─── TEMPLATE ─────────────────────────────────────────────────────────────────
const template = html`
  <div class="container">

    <div class="container-header">
      <div class="container-title">Service Status</div>

      <!-- binding expression: x = component instance, re-runs when services changes -->
      <!-- replaces: badge.textContent = ... inside _render() -->
      <div class="count-badge" aria-live="polite">
        ${x => `${x.operationalCount} / ${(x.services || []).length} Online`}
      </div>
    </div>

    <div class="service-list" role="list">

      <!--
        repeat(x => x.services, itemTemplate)
        arg 1: x => x.services   → returns the array to loop over (x = component)
        arg 2: html\`...\`         → template for EACH item in the array
        replaces: services.forEach(s => { createElement... appendChild... })
        when services is reassigned → repeat() reconciles DOM automatically (no full rebuild)
      -->
      ${repeat(x => x.services, html`

        <!-- x here = individual service object (NOT the component) -->
        <!-- e.g. x.name = "Auth API", x.status = "operational" -->

        <!--
          @click event binding: replaces addEventListener("click", ...)
          (x, c) gives two things:
            x        → the individual service object
            c.parent → the component instance (ServiceStatus)
          calling c.parent.handleServiceClick(x) passes the service to the component method
          same (x, c) pattern for keyboard accessibility on @keydown
        -->
        <div
          class="service-item"
          role="listitem"
          tabindex="0"
          aria-label="${x => `${x.name}: ${x.status}`}"
          @click="${(x, c) => c.parent.handleServiceClick(x)}"
          @keydown="${(x, c) => c.parent.handleKeyDown(x, c.event)}"
        >
          <!-- "status-dot ${x => x.status}" → renders as "status-dot operational" etc -->
          <!-- matches your CSS: .status-dot.operational { background: #22c55e } -->
          <div class="status-dot ${x => x.status}" aria-hidden="true"></div>

          <!-- x.name = service.name — x is the individual item inside repeat -->
          <span class="service-name">${x => x.name}</span>

          <!-- dynamic class + text — same pattern, x = individual service -->
          <span class="service-status-label ${x => x.status}">${x => x.status}</span>
        </div>

      `)}
    </div>

  </div>
`;


// ─── STYLES ───────────────────────────────────────────────────────────────────
// css`...` = identical CSS rules to vanilla, just removes the 3-line attachment boilerplate
// var(--color-*) still works — CSS custom properties cross Shadow DOM by design (browser feature)
const styles = css`
  :host { display: block; }
  /* :host targets the <service-status> element itself */

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
    margin-bottom: 20px;
  }

  .container-title {
    font-size: 11px;
    font-weight: 700;
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.8px;
  }

  .count-badge {
    background: linear-gradient(135deg, #7c3aed, #4f46e5);
    color: white;
    font-size: 11px;
    font-weight: 700;
    padding: 3px 10px;
    border-radius: 10px;
  }

  .service-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .service-item {
    display: flex;
    align-items: center;
    padding: 10px 12px;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid transparent;
  }

  .service-item:hover {
    background-color: var(--color-hover);
    border-color: var(--color-border);
    transform: translateX(2px);
  }

  .status-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    margin-right: 12px;
    flex-shrink: 0;
  }

  /* these classes are applied dynamically via "status-dot ${x => x.status}" */
  .status-dot.operational { background: #22c55e; box-shadow: 0 0 8px rgba(34,197,94,0.5); }
  .status-dot.degraded    { background: #f59e0b; box-shadow: 0 0 8px rgba(245,158,11,0.5); }
  .status-dot.down        { background: #ef4444; box-shadow: 0 0 8px rgba(239,68,68,0.5); }

  .service-name {
    font-size: 13px;
    font-weight: 500;
    color: var(--color-text);
    flex: 1;
  }

  .service-status-label {
    font-size: 11px;
    font-weight: 600;
    text-transform: capitalize;
    padding: 2px 8px;
    border-radius: 8px;
  }

  /* dynamic class applied via "service-status-label ${x => x.status}" */
  .service-status-label.operational { color: #16a34a; background: rgba(34,197,94,0.1); }
  .service-status-label.degraded    { color: #d97706; background: rgba(245,158,11,0.1); }
  .service-status-label.down        { color: #dc2626; background: rgba(239,68,68,0.1); }
`;


// ─── CLASS ────────────────────────────────────────────────────────────────────
class ServiceStatus extends FASTElement {

  // computed getter — reads this.services and returns a count
  // used by the count badge binding: ${x => x.operationalCount}
  // re-runs automatically when services changes (because it reads an observable property)
  get operationalCount() {
    return (this.services || []).filter(s => s.status === "operational").length;
  }

  // called by @click in the repeat item template via c.parent.handleServiceClick(x)
  // dispatchEvent + CustomEvent = 100% unchanged from vanilla — FAST never touches events
  // bubbles: true  → event travels up the DOM tree
  // composed: true → event crosses the Shadow DOM boundary so main.js can hear it
  handleServiceClick(service) {
    this.dispatchEvent(new CustomEvent("service-selected", {
      detail:   { service },
      bubbles:  true,
      composed: true,
    }));
  }

  // called by @keydown in the repeat item template
  // Enter or Space triggers the same action as a click (keyboard accessibility)
  handleKeyDown(service, e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      this.handleServiceClick(service);
    }
  }
}


// ─── observable() ─────────────────────────────────────────────────────────────
// replaces your vanilla:
//   set services(data) { this._services = data; this._render(); }
//
// installs a smart getter + setter on the prototype:
//   getter → returns the stored array
//   setter → stores the new array AND notifies FAST: "services changed"
//            → FAST finds the repeat() binding and reconciles the DOM
//
// RULE: always reassign, never mutate
//   this.services = newArray     ✅ setter fires, FAST is notified
//   this.services.push(item)     ❌ setter never fires, FAST sees nothing
observable(ServiceStatus.prototype, "services");


// ─── define() ─────────────────────────────────────────────────────────────────
// 1. associates template with ServiceStatus
// 2. associates styles with ServiceStatus
// 3. processes the observable() declaration
// 4. calls customElements.define("service-status", ServiceStatus)
//    — the browser still does the real registration, FAST just prepares everything first
ServiceStatus.define({
  name: "service-status",
  template,
  styles,
});
