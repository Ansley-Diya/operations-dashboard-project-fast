// NEW imports: when (conditional rendering) + repeat (list rendering)
// observable replaces your manual setter + _render() pattern
import { FASTElement, observable, html, css, repeat, when } from "@microsoft/fast-element";

// ─── TEMPLATE ────────────────────────────────────────────────────────────────
const template = html`
  <div class="container">

    <div class="container-header">
      <div class="container-title">Alerts</div>
    </div>

    <!-- FILTER BAR
         Each button has two bindings:
         1. class binding  → x.currentFilter === 'all' ? 'active' : ''
                          → replaces your manual classList.add/remove loop
         2. @click binding → x.setFilter('all')
                          → replaces your querySelector + addEventListener loop
         x here is the AlertList component (not a list item — no repeat here)
    -->
    <div class="filter-bar" role="group" aria-label="Filter alerts by severity">

      <button
        class="filter-btn ${x => x.currentFilter === "all" ? "active" : ""}"
        aria-pressed="${x => x.currentFilter === "all"}"
        @click="${x => x.setFilter("all")}"
      >All</button>

      <button
        class="filter-btn ${x => x.currentFilter === "critical" ? "active" : ""}"
        aria-pressed="${x => x.currentFilter === "critical"}"
        @click="${x => x.setFilter("critical")}"
      >Critical</button>

      <button
        class="filter-btn ${x => x.currentFilter === "warning" ? "active" : ""}"
        aria-pressed="${x => x.currentFilter === "warning"}"
        @click="${x => x.setFilter("warning")}"
      >Warning</button>

      <button
        class="filter-btn ${x => x.currentFilter === "info" ? "active" : ""}"
        aria-pressed="${x => x.currentFilter === "info"}"
        @click="${x => x.setFilter("info")}"
      >Info</button>

    </div>

    <div class="alert-list" role="list">

      <!-- when() — conditional rendering
           Replaces: if (filtered.length === 0) { list.innerHTML = '...' }
           When x.filteredAlerts.length === 0 → this div is inserted into DOM
           When condition becomes false → this div is removed from DOM
           FAST watches filteredAlerts — re-evaluates when alerts or currentFilter changes
      -->
      ${when(x => x.filteredAlerts.length === 0, html`
        <div class="empty-state">No alerts found</div>
      `)}

      <!-- repeat() — list rendering
           Replaces: filtered.forEach(alert => { createElement + setAttribute + appendChild })
           x => x.filteredAlerts → the computed getter → returns filtered array
           Inside item template: x = individual alert object (not the component)
           <alert-item> receives real HTML attributes → its own attr() system reacts
           When filteredAlerts changes → repeat() surgically adds/removes/reorders DOM nodes
      -->
      ${repeat(x => x.filteredAlerts, html`
        <alert-item
          severity="${x => x.severity}"
          title="${x => x.title}"
          service="${x => x.service}"
          timestamp="${x => x.timestamp}"
          status="${x => x.status}"
        ></alert-item>
      `)}

    </div>

  </div>
`;

// ─── STYLES ───────────────────────────────────────────────────────────────────
// Identical CSS rules to your vanilla version
// css`...` removes the manual <style> creation + shadowRoot.appendChild boilerplate
const styles = css`
  :host { display: block; }

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
`;

// ─── CLASS ────────────────────────────────────────────────────────────────────
class AlertList extends FASTElement {

  // COMPUTED GETTER — replaces the filtering logic inside your vanilla _render()
  // Called by repeat(x => x.filteredAlerts, ...) and when(x => x.filteredAlerts.length === 0, ...)
  // When alerts or currentFilter changes → FAST re-calls this getter automatically
  // No need to call it manually — the bindings call it for you
  get filteredAlerts() {
    if (!this.alerts) return [];
    if (this.currentFilter === "all") return this.alerts;
    return this.alerts.filter(a => a.severity === this.currentFilter);
  }

  // setFilter — called by @click bindings on the filter buttons
  // Sets currentFilter → observable setter fires → FAST notified
  // → class bindings on buttons re-evaluate → active class moves to correct button
  // → filteredAlerts getter re-called → repeat() + when() update
  // Replaces: btn.classList.add('active') + this._currentFilter = val + this._render()
  setFilter(value) {
    this.currentFilter = value;
  }
}

// observable() for the alerts ARRAY
// Replaces: set alerts(data) { this._alerts = data; this._render(); }
// When this.alerts = newData → smart setter fires → FAST notified → repeat() updates
// CRITICAL: always reassign → this.alerts = newArray  ✅
//           never mutate   → this.alerts.push(...)    ❌
observable(AlertList.prototype, "alerts");

// observable() for the filter STRING
// When this.currentFilter = 'critical' → FAST notified
// → class bindings on all 4 buttons re-evaluate (active moves)
// → filteredAlerts getter re-called → repeat() reconciles DOM
// Replaces: this._currentFilter = val + manual classList manipulation + _render()
observable(AlertList.prototype, "currentFilter");

// ─── DEFINE ───────────────────────────────────────────────────────────────────
// 1. Associates template with AlertList
// 2. Associates styles with AlertList
// 3. Processes observable() declarations
// 4. Calls customElements.define('alert-list', AlertList) — browser still registers it
AlertList.define({
  name: "alert-list",
  template,
  styles,
});
