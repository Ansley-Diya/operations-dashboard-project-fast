// FASTElement → base class (replaces HTMLElement + attachShadow + template clone boilerplate)
// observable   → makes a plain JS property reactive (not an HTML attribute — isDark never
//                needs to be set from outside as a string, so attr() isn't the right tool here)
// html / css   → tagged template literals for this component's Shadow DOM markup + styles
import { FASTElement, observable, html, css } from "@microsoft/fast-element";

// x here = the AppShell component instance — this template has no repeat(), so there's
// only ever one "x" in scope: the component itself
const template = html`
  <div class="header" role="banner">
    <div class="header-left">
      <div class="header-logo" aria-hidden="true">D</div>
      <div>
        <div class="header-title">Operations Dashboard</div>
        <div class="header-subtitle">Platform Monitor</div>
      </div>
    </div>
    <div class="header-right">
      <div class="status-pill" role="status" aria-live="polite">
        <div class="status-dot-live" aria-hidden="true"></div>
        Live
      </div>
      <!-- @click calls toggleTheme() below; aria-label + button text both flip with isDark
           so the accessible name always matches what the button is about to do -->
      <button
        class="theme-toggle"
        @click="${x => x.toggleTheme()}"
        aria-label="${x => x.isDark ? 'Switch to light mode' : 'Switch to dark mode'}"
      >
        ${x => x.isDark ? "Light Mode" : "Dark Mode"}
      </button>
    </div>
  </div>
  <!-- named slot — main.js/index.html puts <div slot="content"> here; the browser
       projects it into this exact spot, FAST is not involved in slot projection -->
  <div class="main" role="main">
    <slot name="content"></slot>
  </div>
`;

const styles = css`
  :host { display: block; }
  .header {
    background: linear-gradient(135deg, #1a1a1a 0%, #2d1b69 60%, #1a1a1a 100%);
    color: white;
    padding: 0 32px;
    height: 68px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 4px 24px rgba(124, 58, 237, 0.3);
    position: sticky;
    top: 0;
    z-index: 100;
  }
  .header-left { display: flex; align-items: center; gap: 12px; }
  .header-logo {
    width: 32px; height: 32px;
    background: linear-gradient(135deg, #7c3aed, #4f46e5);
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 15px; font-weight: 800; color: white;
    box-shadow: 0 2px 8px rgba(124, 58, 237, 0.4);
    letter-spacing: -0.5px;
  }
  .header-title { font-size: 18px; font-weight: 700; letter-spacing: 0.3px; color: white; }
  .header-subtitle { font-size: 11px; color: rgba(255,255,255,0.5); letter-spacing: 1px; text-transform: uppercase; margin-top: 1px; }
  .header-right { display: flex; align-items: center; gap: 12px; }
  .status-pill {
    display: flex; align-items: center; gap: 6px;
    background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12);
    padding: 5px 12px; border-radius: 20px;
    font-size: 12px; color: rgba(255,255,255,0.8); font-weight: 500;
  }
  .status-dot-live {
    width: 7px; height: 7px; border-radius: 50%;
    background: #22c55e; box-shadow: 0 0 6px #22c55e;
    animation: pulse 2s infinite;
  }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
  .theme-toggle {
    background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15);
    color: white; padding: 7px 16px; border-radius: 20px;
    cursor: pointer; font-size: 12px; font-weight: 600;
    transition: all 0.2s ease; letter-spacing: 0.3px;
  }
  .theme-toggle:hover { background: rgba(124,58,237,0.4); border-color: rgba(124,58,237,0.6); }
  .main { padding: 16px; }
`;

class AppShell extends FASTElement {

  // Gotcha: never default an observable/attr property with class-field syntax
  // (e.g. "isDark = false;") — it shadows the accessor observable() installs below.
  // A real assignment inside an explicit constructor goes through the setter instead.
  constructor() {
    super();
    // seed the theme from a saved choice; if the user has never toggled it,
    // fall back to their OS-level light/dark preference instead of always light
    const saved = localStorage.getItem("theme");
    this.isDark = saved ? saved === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  // body is outside this component's Shadow DOM, so its class can't be set via a
  // template binding — apply the seeded theme here as soon as the element connects
  connectedCallback() {
    super.connectedCallback();
    document.body.classList.toggle("dark", this.isDark);
  }

  // toggleTheme — called by the header button's @click binding
  // flips isDark, mirrors it onto <body class="dark"> (styles.css reads that class),
  // and persists the choice so it survives a page reload
  toggleTheme() {
    this.isDark = !this.isDark;
    document.body.classList.toggle("dark", this.isDark);
    localStorage.setItem("theme", this.isDark ? "dark" : "light");
  }
}

// observable() replaces manually calling _render() from a custom setter — when
// toggleTheme() assigns this.isDark, FAST re-runs the two ${x => x.isDark ...} bindings
observable(AppShell.prototype, "isDark");

// define() registers the template + styles, then calls the native
// customElements.define("app-shell", AppShell)
AppShell.define({
  name: "app-shell",
  template,
  styles,
});
