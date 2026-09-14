// FASTElement → base class (replaces HTMLElement + attachShadow + template clone boilerplate)
// attr         → makes an HTML attribute reactive (replaces observedAttributes + attributeChangedCallback + getter/setter), one call per attribute
// html         → tagged template literal for this component's Shadow DOM markup, with live ${x => ...} bindings
// css          → tagged template literal for this component's Shadow DOM styles
import { FASTElement, attr, html, css } from "@microsoft/fast-element";

// heading (not "title") — "title" is a reserved global HTML attribute that triggers a native
// browser tooltip on hover, which would fight with our own aria-label here
// x here = the AlertItem component instance (no repeat() in this file — one alert-item per element)
const template = html`
  <div
    class="alert-item"
    role="listitem"
    tabindex="0"
    aria-label="${x => `${x.severity || "info"} alert: ${x.heading || ""}`}"
    @click="${x => x.handleClick()}"
    @keydown="${(x, c) => x.handleKeyDown(c.event)}"
  >
    <!-- dynamic class "severity-badge critical/warning/info" — same pattern as service-status's status-dot -->
    <span class="severity-badge ${x => x.severity || "info"}">
      ${x => x.severity || "info"}
    </span>
    <div class="alert-body">
      <div class="alert-title">${x => x.heading}</div>
      <div class="alert-meta">
        <!-- serviceName is the friendly display name looked up in main.js; falls back to the raw id -->
        ${x => x.serviceName || x.service}
        &nbsp;·&nbsp;
        <!-- formattedDate is a getter below — re-runs automatically whenever timestamp changes -->
        ${x => x.formattedDate}
        <span class="status-tag">${x => x.status}</span>
      </div>
    </div>
  </div>
`;

// css`...` — identical CSS rules to the vanilla version, just without the manual
// <style> element creation + shadowRoot.appendChild boilerplate
const styles = css`
  :host { display: block; }
  .alert-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px 16px;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid transparent;
  }
  .alert-item:hover {
    background: var(--color-hover);
    border-color: var(--color-border);
  }
  .severity-badge {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 2px 8px;
    border-radius: 6px;
    white-space: nowrap;
    flex-shrink: 0;
    margin-top: 2px;
  }
  /* these three classes are applied dynamically via "severity-badge ${x => x.severity}" above */
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
`;

// ─── CLASS ────────────────────────────────────────────────────────────────────
class AlertItem extends FASTElement {

  // computed getter — reads this.timestamp (an ISO string attribute) and formats it
  // for display. Used by the template binding ${x => x.formattedDate} above; FAST
  // re-calls it automatically whenever the timestamp attribute changes.
  // Guarded against a missing/invalid timestamp so the user sees a blank space
  // instead of the string "Invalid Date".
  get formattedDate() {
    if (!this.timestamp) return "";
    const d = new Date(this.timestamp);
    return isNaN(d.getTime()) ? "" : d.toLocaleDateString();
  }

  // handleClick — called by the @click binding in the template above
  // dispatchEvent + CustomEvent = 100% unchanged from vanilla — FAST never touches events
  // bubbles: true  → event travels up through the DOM tree to document
  // composed: true → event also crosses this component's Shadow DOM boundary,
  //                  otherwise main.js (listening on document) would never hear it
  handleClick() {
    this.dispatchEvent(new CustomEvent("alert-selected", {
      detail: {
        severity:    this.severity,
        // event detail key stays "title" — that's the data field name in alerts.json,
        // unrelated to the "heading" HTML attribute rename above (which is just this
        // element's wire name, chosen only to dodge the reserved "title" attribute)
        title:       this.heading,
        service:     this.service,
        serviceName: this.serviceName,
        timestamp:   this.timestamp,
        status:      this.status,
        message:     this.message,
      },
      bubbles:  true,
      composed: true,
    }));
  }

  // handleKeyDown — called by @keydown in the template above
  // Enter or Space triggers the same action as a click (keyboard accessibility) —
  // preventDefault stops Space from also scrolling the page
  handleKeyDown(e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      this.handleClick();
    }
  }
}

// one attr() call per HTML attribute — each installs a getter/setter pair on the
// prototype that keeps the DOM attribute and the JS property in sync automatically
attr(AlertItem.prototype, "severity");
attr(AlertItem.prototype, "heading");
attr(AlertItem.prototype, "service");
attr(AlertItem.prototype, "serviceName");
attr(AlertItem.prototype, "timestamp");
attr(AlertItem.prototype, "status");
attr(AlertItem.prototype, "message");

// define() registers the template + styles + attrs, then calls the real
// customElements.define("alert-item", AlertItem) — the native browser API.
AlertItem.define({
  name: "alert-item",
  template,
  styles,
});
