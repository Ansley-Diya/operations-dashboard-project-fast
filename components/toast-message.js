// FASTElement → base class (replaces HTMLElement + attachShadow + template clone boilerplate)
// attr         → makes an HTML attribute reactive (type/message are set once by toast-container via setAttribute)
// html / css   → tagged template literals for this component's Shadow DOM markup + styles
import { FASTElement, attr, html, css } from "@microsoft/fast-element";

// x here = the ToastMessage component instance — one toast per element, no repeat() needed
const template = html`
  <div
    class="toast ${x => x.type || "info"}"
    role="alert"
    aria-live="assertive"
  >
    <span class="toast-icon">${x => x.getIcon()}</span>
    <span class="toast-message">${x => x.message}</span>
    <!-- @click → dismiss early — same as vanilla, just declared in template -->
    <button
      class="toast-close"
      @click="${x => x.dismiss()}"
      aria-label="Dismiss notification"
    >✕</button>
  </div>
`;

const styles = css`
  :host { display: block; }

  .toast {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    border-radius: 12px;
    margin-bottom: 8px;
    font-size: 13px;
    font-weight: 500;
    box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    border: 1px solid transparent;
    animation: slideIn 0.3s ease;
    cursor: default;
  }

  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to   { transform: translateX(0);   opacity: 1; }
  }

  .toast.success { background: #f0fdf4; border-color: #bbf7d0; color: #15803d; }
  .toast.error   { background: #fef2f2; border-color: #fecaca; color: #dc2626; }
  .toast.warning { background: #fffbeb; border-color: #fde68a; color: #d97706; }
  .toast.info    { background: #eff6ff; border-color: #bfdbfe; color: #2563eb; }

  .toast-icon  { font-size: 16px; flex-shrink: 0; }
  .toast-message { flex: 1; line-height: 1.4; }

  .toast-close {
    background: none;
    border: none;
    cursor: pointer;
    color: inherit;
    opacity: 0.6;
    font-size: 14px;
    padding: 2px 4px;
    border-radius: 4px;
    line-height: 1;
    flex-shrink: 0;
  }

  .toast-close:hover { opacity: 1; }
`;

class ToastMessage extends FASTElement {

  // connectedCallback — auto-dismiss timer
  // super.connectedCallback() FIRST — FAST hydrates template here
  // Then your setTimeout runs after — same as your vanilla connectedCallback
  connectedCallback() {
    super.connectedCallback();
    this._timer = setTimeout(() => this.dismiss(), 4000);
  }

  // disconnectedCallback — clear the timer if toast is removed early
  // prevents calling dismiss() on an element that's already gone from DOM
  disconnectedCallback() {
    super.disconnectedCallback();
    clearTimeout(this._timer);
  }

  // getIcon — called by ${x => x.getIcon()} binding in template
  // returns an emoji based on the type attribute
  getIcon() {
    const icons = { success: "✓", error: "✕", warning: "⚠", info: "ℹ" };
    return icons[this.type] || "ℹ";
  }

  // dismiss — removes the element from the DOM entirely
  // this.parentNode.removeChild(this) — pure vanilla DOM, unchanged
  dismiss() {
    clearTimeout(this._timer);
    if (this.parentNode) this.parentNode.removeChild(this);
  }
}

// Two attr() calls — type and message are HTML attributes
// toast-container sets them via setAttribute when creating each toast
attr(ToastMessage.prototype, "type");
attr(ToastMessage.prototype, "message");

ToastMessage.define({
  name: "toast-message",
  template,
  styles,
});
