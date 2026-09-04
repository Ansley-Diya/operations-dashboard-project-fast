// FASTElement → base class (replaces HTMLElement + attachShadow + template clone boilerplate)
// attr         → makes an HTML attribute reactive (here: a BOOLEAN attribute, see attr({mode:"boolean"}) below)
// html / css   → tagged template literals for this component's Shadow DOM markup + styles
import { FASTElement, attr, html, css } from "@microsoft/fast-element";

// x here = the AppModal component instance — no repeat() in this file, one modal for the whole page
const template = html`
  <!-- @click on backdrop → close when clicking outside the modal box -->
  <div
    class="modal-backdrop"
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
    @click="${(x, c) => x.handleBackdropClick(c.event)}"
  >
    <div class="modal-box">

      <div class="modal-header">
        <span id="modal-title" class="modal-title">
          <!-- named slot — browser projects <span slot="title"> from light DOM here
               FAST does not touch this. The browser does all projection.              -->
          <slot name="title">Details</slot>
        </span>

        <!-- @click → x.closeModal() — replaces querySelector('.close-btn') + addEventListener -->
        <button
          class="modal-close"
          @click="${x => x.closeModal()}"
          aria-label="Close modal"
        >✕</button>
      </div>

      <div class="modal-body">
        <!-- named slot — browser projects <div slot="content"> from light DOM here -->
        <slot name="content"></slot>
      </div>

    </div>
  </div>
`;

const styles = css`
  :host {
    display: none; /* hidden by default — :host([open]) overrides this */
  }

  /* :host([open]) — when the 'open' attribute exists on <app-modal>
     This is pure CSS + browser DOM attribute query — unchanged from vanilla
     attr({ mode:'boolean' }) manages setAttribute/removeAttribute
     The CSS selector reads the real DOM attribute — it doesn't know FAST exists */
  :host([open]) {
    display: flex;
    position: fixed;
    inset: 0;
    z-index: 1000;
  }

  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }

  .modal-box {
    background: var(--color-surface);
    border-radius: 16px;
    padding: 28px;
    max-width: 540px;
    width: 100%;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 24px 64px rgba(0, 0, 0, 0.4);
    border: 1px solid var(--color-border);
    position: relative;
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--color-border);
  }

  .modal-title {
    font-size: 16px;
    font-weight: 700;
    color: var(--color-text);
  }

  .modal-close {
    background: none;
    border: none;
    color: var(--color-text-muted);
    cursor: pointer;
    font-size: 18px;
    padding: 4px 8px;
    border-radius: 6px;
    transition: all 0.2s;
    line-height: 1;
  }

  .modal-close:hover {
    background: var(--color-hover);
    color: var(--color-text);
  }

  .modal-body { color: var(--color-text); font-size: 14px; line-height: 1.6; }
`;

class AppModal extends FASTElement {

  // connectedCallback — still exists in FAST, still yours to use
  // MUST call super.connectedCallback() first
  // FAST hydrates the template and connects all bindings inside super()
  // Your code runs after — safe to add your own listeners here
  connectedCallback() {
    super.connectedCallback(); // FAST does its work first
    this._onKeyDown = (e) => {
      if (e.key === "Escape" && this.open) this.closeModal();
    };
    document.addEventListener("keydown", this._onKeyDown);
  }

  // disconnectedCallback — same rule: call super first
  // FAST disconnects bindings and cleans up inside super()
  // Then you remove your own listeners
  disconnectedCallback() {
    super.disconnectedCallback(); // FAST cleans up first
    document.removeEventListener("keydown", this._onKeyDown);
  }

  // closeModal — sets this.open = false
  // attr({ mode:'boolean' }) setter → calls removeAttribute('open')
  // :host([open]) CSS rule no longer matches → display: none
  // dispatchEvent — completely unchanged from vanilla
  // guard: if the modal is already closed, do nothing — otherwise any Escape press
  // anywhere on the page (even with the modal shut) would broadcast a spurious event
  closeModal() {
    if (!this.open) return;
    this.open = false;
    this.dispatchEvent(new CustomEvent("modal-closed", {
      bubbles:  true,
      composed: true,
    }));
  }

  // handleBackdropClick — close only if clicking the backdrop itself
  // not the modal-box inside it (same logic as your vanilla version)
  handleBackdropClick(e) {
    if (e.target === e.currentTarget) this.closeModal();
  }

  // openChanged — attr() calls this automatically whenever "open" changes, because
  // its name follows the "<propertyName>Changed" convention FAST looks for.
  // Manages focus the way an accessible dialog should: move focus INTO the modal
  // when it opens, and give it back to whatever triggered the modal when it closes —
  // otherwise a keyboard/screen-reader user stays "behind" the modal the whole time.
  openChanged(oldValue, newValue) {
    if (newValue) {
      this._previouslyFocused = document.activeElement;
      // wait a frame — the modal only just became visible (display: flex), so it
      // isn't focusable yet on this exact tick
      requestAnimationFrame(() => {
        const closeButton = this.shadowRoot.querySelector(".modal-close");
        if (closeButton) closeButton.focus();
      });
    } else if (this._previouslyFocused && document.contains(this._previouslyFocused)) {
      this._previouslyFocused.focus();
      this._previouslyFocused = null;
    }
  }
}

// attr with mode: "boolean"
// this.open = true  → setAttribute('open', '')   → :host([open]) matches → display:flex
// this.open = false → removeAttribute('open')    → :host([open]) unmatches → display:none
// main.js can still call: modal.open = true  (property)
// or:                      modal.setAttribute('open', '') (attribute)
// Both work identically — attr() keeps them in sync
// NOTE: attr(target, prop, options) silently drops "options" — attr() only accepts
// (configOrTarget, prop). To pass a config in this no-decorator style, call
// attr(config) to get the decorator function back, then invoke it with (target, prop).
attr({ mode: "boolean" })(AppModal.prototype, "open");

AppModal.define({
  name: "app-modal",
  template,
  styles,
});
