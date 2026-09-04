import { FASTElement, html, css } from "@microsoft/fast-element";

// No attr, no observable, no repeat, no when
// This component has no reactive data — it's purely a container
// that listens on window and creates child elements
const template = html`
  <div
    class="toast-container"
    role="region"
    aria-label="Notifications"
    aria-live="polite"
  >
    <!-- No bindings here — toasts are appended imperatively in showToast()
         This is intentional — dynamic children created at runtime
         don't need FAST's declarative repeat() if the parent manages them manually -->
  </div>
`;

const styles = css`
  :host {
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    pointer-events: none;
    max-width: 360px;
    width: 100%;
  }

  .toast-container { pointer-events: all; width: 100%; }
`;

class ToastContainer extends FASTElement {

  // connectedCallback — register window listener
  // super.connectedCallback() first — FAST hydrates the (nearly empty) template
  // Then your window listener — exactly as in vanilla
  connectedCallback() {
    super.connectedCallback();
    // store reference so we can remove the exact same function in disconnectedCallback
    this._onToast = (e) => this.showToast(e.detail.message, e.detail.type);
    // window event listener — 100% unchanged from your vanilla version
    // FAST doesn't touch window. It doesn't touch global events.
    // This is pure browser API.
    window.addEventListener("show-toast", this._onToast);
  }

  // disconnectedCallback — clean up window listener
  // prevents memory leak if toast-container is ever removed from DOM
  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener("show-toast", this._onToast);
  }

  // showToast — creates a <toast-message> element imperatively
  // createElement + setAttribute + appendChild — pure vanilla DOM
  // This is intentionally imperative: we're creating elements dynamically at runtime
  showToast(message, type = "info") {
    const container = this.shadowRoot.querySelector(".toast-container");
    if (!container) return;

    const toast = document.createElement("toast-message");
    toast.setAttribute("message", message);
    toast.setAttribute("type",    type);
    container.appendChild(toast);
  }
}

// No attr() or observable() calls — this component has no reactive properties
// FASTElement base class is all we need for Shadow DOM + template + styles

ToastContainer.define({
  name: "toast-container",
  template,
  styles,
});
