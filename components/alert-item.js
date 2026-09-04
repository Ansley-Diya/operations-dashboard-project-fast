import { FASTElement, attr, html, css } from "@microsoft/fast-element";

const template = html`
  <div
    class="alert-item"
    role="listitem"
    tabindex="0"
    aria-label="${x => `${x.severity || "info"} alert: ${x.title || ""}`}"
    @click="${x => x.handleClick()}"
    @keydown="${(x, c) => x.handleKeyDown(c.event)}"
  >
    <span class="severity-badge ${x => x.severity || "info"}">
      ${x => x.severity || "info"}
    </span>
    <div class="alert-body">
      <div class="alert-title">${x => x.title}</div>
      <div class="alert-meta">
        ${x => x.service}
        &nbsp;·&nbsp;
        ${x => x.formattedDate}
        <span class="status-tag">${x => x.status}</span>
      </div>
    </div>
  </div>
`;

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

class AlertItem extends FASTElement {
  get formattedDate() {
    if (!this.timestamp) return "";
    const d = new Date(this.timestamp);
    return isNaN(d.getTime()) ? "" : d.toLocaleDateString();
  }

  handleClick() {
    this.dispatchEvent(new CustomEvent("alert-selected", {
      detail: {
        severity:  this.severity,
        title:     this.title,
        service:   this.service,
        timestamp: this.timestamp,
        status:    this.status,
      },
      bubbles:  true,
      composed: true,
    }));
  }

  handleKeyDown(e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      this.handleClick();
    }
  }
}

attr(AlertItem.prototype, "severity");
attr(AlertItem.prototype, "title");
attr(AlertItem.prototype, "service");
attr(AlertItem.prototype, "timestamp");
attr(AlertItem.prototype, "status");

AlertItem.define({
  name: "alert-item",
  template,
  styles,
});
