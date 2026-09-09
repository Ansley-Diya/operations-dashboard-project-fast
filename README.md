# Operations Dashboard — FAST Implementation

A parallel implementation of the Operations/SaaS Dashboard built using
[@microsoft/fast-element](https://www.fast.design/), demonstrating how
Microsoft's FAST framework maps directly onto native Web Component APIs.

---

## Project Structure

```
operations-dashboard-project-fast/
├── components/
│   ├── metric-card.js       ← attr() · html · css · define()
│   ├── app-shell.js         ← @click · observable · slots
│   ├── service-status.js    ← observable · repeat()
│   ├── alert-item.js        ← 7× attr · dynamic classes
│   ├── alert-list.js        ← when() · computed getters · composition
│   ├── activity-table.js    ← 5× observable · ?disabled · @input
│   ├── app-modal.js         ← boolean attr · named slots · super lifecycle
│   ├── toast-message.js     ← attr · setTimeout · connectedCallback
│   └── toast-container.js   ← window events · FASTElement base
├── data/
│   ├── services.json        ← 6 backend services with status and metrics
│   ├── alerts.json          ← 7 alerts with severity, service, and timestamp
│   └── activity.json        ← 20 user activity records
├── index.html               ← identical structure to vanilla version
├── main.js                  ← nearly identical to vanilla version
├── styles.css               ← identical to vanilla version
├── package.json
└── README.md
```

> **Note on decorators:** FAST's docs usually show `@attr title;` class-field decorator
> syntax. That requires a build step (Babel/TypeScript) to compile decorators down to
> something the browser understands. This project has no build step — everything runs
> as plain ES modules straight from the browser — so every component instead calls the
> exact same underlying function directly: `attr(MetricCard.prototype, "title")`. Same
> behavior, same FAST internals, zero tooling required.

---

## Setup

```bash
npm install
```

Then open `index.html` with Live Server (VS Code) or any static file server.

---

## What This Project Demonstrates

### The Core Thesis

FAST is a **thin productivity layer** over native Web Component APIs.
It eliminates boilerplate. It does not replace the browser platform.

Every FAST component in this project is a real Custom Element registered
with `customElements.define()`. The browser still owns:

- Custom Elements instantiation and lifecycle
- Shadow DOM creation and management
- Slot projection and composition
- CSS cascade and custom property inheritance
- Event dispatching and bubbling
- `connectedCallback` / `disconnectedCallback`

FAST owns:
- Eliminating `observedAttributes` boilerplate → `attr()`
- Eliminating `attributeChangedCallback` boilerplate → `attr()`
- Eliminating manual getter/setter boilerplate → `attr()`
- Eliminating `querySelector + textContent` → `${x => x.prop}` bindings
- Eliminating `_render()` → reactive binding engine
- Eliminating `createElement + appendChild` loops → `repeat()`
- Eliminating conditional `innerHTML` → `when()`
- Eliminating `<style>` attachment boilerplate → `css\`...\``
- Eliminating scattered `customElements.define()` → `define()`

---

## Evaluation Criteria — How This Project Meets Each One

### 1. Custom Elements / API Knowledge (20%)

**What `FASTElement.define()` does under the hood:**

```js
MetricCard.define({
  name: "metric-card",
  template,
  styles,
});
```

Internally this does 4 things in order:
1. Associates `template` with the `MetricCard` class
2. Associates `styles` with the `MetricCard` class
3. Processes all `attr()` / `observable()` declarations to build `observedAttributes`
4. Calls `customElements.define("metric-card", MetricCard)` — the native browser call

The browser still does the real registration. FAST prepares the class and then
hands it to `customElements.define()` through the standard Web Component API.

**Evidence in codebase:** Every component file ends with `ComponentName.define({...})`.
Every `main.js` call (`setAttribute`, `element.services = data`) works identically
on FAST components as on vanilla components — because they are still Custom Elements.

---

### 2. Shadow DOM / CSS Encapsulation (20%)

FAST creates Shadow DOM automatically in `FASTElement`'s constructor:
```js
// Vanilla — you write this manually
this.attachShadow({ mode: "open" });

// FAST — FASTElement's constructor does this for you
class MetricCard extends FASTElement {} // Shadow DOM auto-created
```

The Shadow DOM itself is unchanged. CSS encapsulation rules are identical.
`:host` selectors work identically. CSS custom properties cross the Shadow DOM
boundary by browser design — FAST does not change this.

**Evidence in codebase:**
- Every component uses `:host { display: block; }` — same as vanilla
- `var(--color-surface)`, `var(--color-text)` etc. work inside every Shadow DOM
- Dark mode toggle in `app-shell.js` sets `document.body.classList.toggle("dark")`
  and every component's `var()` values update automatically — pure browser behaviour
- `app-modal.js` uses `:host([open])` — CSS attribute selector on real DOM attribute,
  unchanged from vanilla

---

### 3. Templates and Slots (15%)

**How `html\`...\`` maps to a component template:**

```js
// Vanilla
const template = document.createElement("template");
template.innerHTML = `<div class="card-label"></div>`; // empty — filled by _render()
// then in connectedCallback:
shadow.appendChild(template.content.cloneNode(true));
// then _render() runs querySelector + textContent

// FAST
const template = html`
  <div class="card-label">${x => x.heading}</div>
`; // live binding — FAST clones + connects at connectedCallback automatically
```

The `html` tagged template literal:
1. Receives static HTML parts and dynamic `${x => ...}` expressions separately
2. Builds a template object with DOM locations pre-mapped to expressions
3. On first `connectedCallback`, FAST clones the template into Shadow DOM
4. Each `${x => x.heading}` expression is called, value written, subscription registered
5. When `heading` changes, only that one DOM node updates — no `_render()`, no querySelector

**Slots — unchanged:**

```html
<!-- app-shell.js template — identical to vanilla -->
<slot name="content"></slot>

<!-- app-modal.js template — identical to vanilla -->
<slot name="title">Details</slot>
<slot name="content"></slot>
```

`main.js` uses `slot="content"` and `slot="title"` attributes identically to the
vanilla version. The browser handles all projection. FAST is not involved.

---

### 4. Component Architecture / Composition (15%)

The composition pattern is preserved exactly:

```html
<app-shell>
  <div slot="content" class="dashboard-grid">
    <metric-card></metric-card>
    <metric-card></metric-card>
    <metric-card></metric-card>
    <service-status></service-status>
    <alert-list></alert-list>
    <activity-table></activity-table>
  </div>
</app-shell>
<app-modal></app-modal>
<toast-container></toast-container>
```

FAST changes how components are **defined**, not how they are **composed**.
Parent/child relationships, slot-based composition, and Shadow DOM boundaries
are all browser mechanics — FAST doesn't change any of them.

**`alert-list` composes `alert-item` inside `repeat()`:**

```js
// alert-list.js — FAST component composing another FAST component
${repeat(x => x.filteredAlerts, html`
  <alert-item
    severity="${x => x.severity}"
    heading="${x => x.title}"
  ></alert-item>
`)}
```

FAST creates real `<alert-item>` DOM elements and sets real HTML attributes on them.
`alert-item`'s own `attr()` system reacts. Two FAST components talking through
attributes — identical to vanilla `createElement + setAttribute`.

---

### 5. Events and Component Communication (10%)

`dispatchEvent` and `CustomEvent` are completely unchanged:

```js
// service-status.js — dispatches event (identical to vanilla)
this.dispatchEvent(new CustomEvent("service-selected", {
  detail:   { service },
  bubbles:  true,
  composed: true, // crosses Shadow DOM boundary
}));

// toast-container.js — window event listener (identical to vanilla)
window.addEventListener("show-toast", this._onToast);

// main.js — listens for events (identical to vanilla)
document.addEventListener("service-selected", (e) => { modal.open = true; });
```

`composed: true` is required for custom events to cross Shadow DOM boundaries.
This is a browser rule — FAST doesn't change it.

**Event flow in this project:**
- `metric-card` → no events (display only)
- `service-status` → dispatches `service-selected` → `main.js` opens `app-modal`
- `alert-item` → dispatches `alert-selected` → `main.js` opens `app-modal`
- `app-modal` → dispatches `modal-closed` → `main.js` can listen
- `main.js` → dispatches `show-toast` on `window` → `toast-container` hears it

---

### 6. JavaScript Quality (10%)

**`attr()` used correctly throughout:**

```js
// Primitives that should be HTML attributes → attr()
// (named "heading" not "title" — "title" is a reserved global HTML attribute
// that triggers a native tooltip on hover)
attr(MetricCard.prototype, "heading");
attr(MetricCard.prototype, "value");

// Boolean attribute → attr() only accepts (configOrTarget, prop) — there is no
// 3-arg (target, prop, config) form, so config comes first and returns the
// decorator function, which is then invoked manually with (target, prop)
attr({ mode: "boolean" })(AppModal.prototype, "open");

// Arrays/objects that cannot be HTML attributes → observable()
observable(ServiceStatus.prototype, "services");
observable(AlertList.prototype, "alerts");
observable(ActivityTable.prototype, "activities");
```

**Tagged template literals used correctly:**
- `html\`...\`` for all component templates with `${x => ...}` bindings
- `css\`...\`` for all component styles

**Key correctness rules followed:**
- Always reassign observables, never mutate: `this.alerts = newArray` ✅
- Always call `super.connectedCallback()` first when overriding lifecycle ✅
- `composed: true` on all cross-boundary custom events ✅
- Default values provided for all `attr()` declarations ✅

---

### 7. Accessibility / Responsiveness (5%)

- All interactive elements have `aria-label` attributes
- `role` attributes on all structural elements (`region`, `list`, `listitem`, `dialog`)
  — `<activity-table>` uses a plain `<table>` rather than `role="grid"`, because this
  component doesn't implement full arrow-key cell navigation; overclaiming `grid`
  semantics without the keyboard behavior to back them up is worse than not claiming it
- `aria-live` on dynamic regions (count badge, pagination, toast container)
- `aria-pressed` on filter toggle buttons
- `aria-sort` on activity-table's column headers, which are real `<button>`s —
  sorting is reachable and operable from the keyboard, not just a mouse click
- `aria-modal="true"` on modal dialog, plus focus management: opening the modal
  moves focus to its close button, closing it returns focus to whatever triggered it
- Keyboard navigation: all clickable items have `tabindex="0"` and `@keydown`
  handlers for Enter/Space
- Responsive layout via CSS Grid and `flex-wrap`
- Dark mode via CSS custom properties on `body.dark`, persisted to `localStorage`
  and seeded from `prefers-color-scheme` on first load

---

### 8. Testing / Documentation (5%)

**SaaS Dashboard → FAST Mapping:**

| Vanilla Web Component | FAST Equivalent | What Disappeared |
|---|---|---|
| `class X extends HTMLElement` | `class X extends FASTElement` | `attachShadow`, template clone, binding setup |
| `static get observedAttributes()` | `attr(X.prototype, "name")` part 1 | The static getter |
| `attributeChangedCallback()` | `attr(X.prototype, "name")` part 2 | The callback method |
| Property getter + setter | `attr(X.prototype, "name")` parts 3+4 | Both accessors |
| `set services(data) { this._render(); }` | `observable(X.prototype, "services")` | Manual setter |
| `querySelector + textContent` | `${x => x.heading}` binding | DOM search + write |
| `_render()` method | Does not exist | Entire re-render function |
| `createElement + setAttribute + appendChild` loop | `repeat(x => x.items, html\`...\`)` | Manual DOM loop |
| `if/else innerHTML` | `when(x => condition, html\`...\`)` | Conditional DOM surgery |
| `if (p===1) btn.setAttribute('disabled','')` | `?disabled="${x => x.page===1}"` | Manual attribute toggle |
| `<style>` creation + `shadowRoot.appendChild` | `css\`...\`` | 3 boilerplate lines |
| `customElements.define(name, X)` | Inside `X.define({ name, template, styles })` | Standalone call |
| `connectedCallback` | Still exists — call `super` first | Nothing — still yours |
| `dispatchEvent(new CustomEvent(...))` | Unchanged | Nothing |
| `<slot>` | Unchanged | Nothing |
| CSS custom properties | Unchanged | Nothing |
| `:host` selector | Unchanged | Nothing |

---

## Key Concepts to Explain

### What does `@attr` / `attr()` compile down to?

Without FAST you would write:

```js
static get observedAttributes() {
  return ["heading", "value"];
}
attributeChangedCallback(name, oldVal, newVal) {
  this._render();
}
get heading() { return this.getAttribute("heading"); }
set heading(v) { this.setAttribute("heading", v); }
```

`attr(MetricCard.prototype, "heading")` generates all four of those automatically.
Four vanilla steps. One FAST call.

### Why does `attachShadow` only need to run once, even in `connectedCallback`?

`connectedCallback` can run more than once per element — remove a component from
the DOM and re-insert it, and it fires again. Calling `attachShadow` a second time
throws (`Shadow root cannot be created on a host which already hosts a shadow tree`).
`FASTElement`'s own controller creates the Shadow DOM exactly once, the first time
the element connects, and reuses it on every later reconnect — so none of these
nine components need `if (!this.shadowRoot) return` guards before touching the DOM,
and setting a property before the element is connected still renders correctly once
it does connect.

### Why does `:host([open])` still work in `app-modal`?

`:host([open])` is a CSS selector that asks the browser:
"does the host element currently have an attribute called `open`?"

`attr({ mode: "boolean" })` manages `setAttribute("open", "")` and
`removeAttribute("open")` — the same calls the vanilla `openModal()` and
`close()` methods made manually. The DOM attribute appears and disappears
the same way. The CSS selector reads the real DOM attribute — it doesn't
know or care that FAST set it.

### Why must `composed: true` be set on custom events?

Shadow DOM creates an encapsulation boundary. By default, events stop at that
boundary — they do not bubble out of a component's Shadow DOM into the
outer document. `composed: true` instructs the browser to let the event
cross Shadow DOM boundaries. Without it, `main.js` never hears the event.
This is a browser rule. FAST doesn't change it.

### Why `super.connectedCallback()` first?

`FASTElement` uses `connectedCallback` to hydrate the template and connect
bindings. If you override `connectedCallback` and don't call `super` first,
the template never renders and no bindings connect. Your code runs but has
no DOM to work with. `super` first ensures FAST does its setup before yours.

---

## Running the Original for Comparison

The original vanilla implementation is at:
```
https://ansley-diya.github.io/operations-dashboard-project
```

Open both side by side. Every component produces identical visible output.
Every `main.js` API call is identical. The only differences are inside the
component files — that's the definition of a thin productivity layer.

---

## Tech Stack

- [@microsoft/fast-element](https://www.fast.design/) v3
- Native Web Components (Custom Elements, Shadow DOM, Slots)
- Vanilla JavaScript (ES Modules)
- CSS Custom Properties for theming
- No build step required — pure ES modules


