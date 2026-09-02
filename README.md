# Operations Dashboard

A single-page Operations Dashboard built for a fictional SaaS company using vanilla HTML, CSS, and JavaScript Web Components — no frameworks, no libraries, no build tools.

---

## Project Overview

This dashboard gives an engineering team a real-time view of their platform's health. It displays service status, key metrics, recent alerts, and a log of user activity. The entire UI is built from reusable Web Components using only browser-native APIs.

The goal was not just to build a dashboard — it was to understand how the browser actually works at the component level, without a framework abstracting that away.

---

## Live Demo

Open `index.html` with Live Server in VS Code.

```
http://127.0.0.1:5500/index.html
```

> Note: `type="module"` scripts require a proper HTTP server. Opening the file directly via `file://` will block module loading. Use Live Server or any local HTTP server.

---

## Tech Stack

| Technology | Usage |
|---|---|
| HTML5 | Structure and custom element tags |
| CSS3 | Shadow DOM styles, CSS custom properties, CSS Grid, animations |
| Vanilla JavaScript (ES2020) | Custom Elements API, Shadow DOM API, fetch(), async/await |
| Web Components | All UI components — no React, Angular, Vue, or Lit |

---

## Project Structure

```
ops-dashboard/
│
├── index.html                    — single HTML page, component tags, script imports
├── styles.css                    — global tokens, CSS custom properties, responsive grid
├── main.js                       — fetches data, coordinates all components
│
├── components/
│   ├── app-shell.js              — outer layout, header, theme toggle
│   ├── metric-card.js            — single metric display (title + value)
│   ├── service-status.js         — service health list with status indicators
│   ├── alert-list.js             — filterable alert collection
│   ├── alert-item.js             — single alert row
│   ├── activity-table.js         — sortable, searchable, paginated activity log
│   ├── app-modal.js              — slot-based popup overlay
│   ├── toast-container.js        — fixed notification area
│   └── toast-message.js          — single auto-dismissing notification
│
└── data/
    ├── services.json             — 6 backend services with status and metrics
    ├── alerts.json               — 7 alerts with severity, service, and timestamp
    └── activity.json             — 20 user activity records
```

---

## Components

### `<app-shell>`
The outer container for the entire dashboard. Provides a sticky gradient header, a live status indicator, and a light/dark theme toggle. All other components are placed inside its named content slot.

**Demonstrates:** Shadow DOM, template, named slot, `:host`, sticky positioning, theme toggle

---

### `<metric-card>`
Displays a single metric — a label and a value. Used three times on the page with different data each time. Data arrives via HTML attributes. The component reacts live to attribute changes after it is already on the page.

**Attributes:** `heading`, `value`

**Demonstrates:** Shadow DOM, template, `observedAttributes`, `attributeChangedCallback`, `connectedCallback`, `_render()` pattern

---

### `<service-status>`
Displays a list of backend services with coloured status indicators — green for operational, amber for degraded, red for down. Data is passed as an array via a JavaScript property setter. Clicking a row fires a custom event.

**Property:** `services` (Array)

**Fires:** `service-selected` — `{ detail: serviceObject, bubbles: true, composed: true }`

**Demonstrates:** Property setter, `forEach`, custom event, `bubbles`, `composed`, keyboard accessibility

---

### `<alert-list>` and `<alert-item>`
`<alert-list>` holds all alerts and provides filter buttons for All, Critical, Warning, and Info. Uses `.filter()` to create a filtered copy of the data on each render. Shows an empty state when no alerts match.

`<alert-item>` displays one alert row with a severity badge, title, service name, date, and status. Fires a custom event when clicked.

**Property:** `alerts` (Array) on `<alert-list>`

**Attributes on `<alert-item>`:** `severity`, `heading`, `service`, `timestamp`, `status`, `message`

**Fires:** `alert-selected` — `{ detail: alertObject, bubbles: true, composed: true }`

**Demonstrates:** Property setter, `.filter()`, `data-*` attributes, `classList`, `observedAttributes`, empty state, component composition

---

### `<activity-table>`
The most complex component. Displays user activity in a paginated table with live search and column sorting.

- **Search** — filters rows on every keystroke using `.filter()` and `.includes()`
- **Sorting** — `.sort()` with `.localeCompare()`, click same column to reverse direction
- **Pagination** — `.slice()` cuts the array to the current page, resets to page 1 on search or sort change

**Property:** `activities` (Array)

**Demonstrates:** Property setter, `.filter()`, `.sort()`, `.localeCompare()`, `.slice()`, `Math.ceil()`, `data-*` attributes, event delegation, empty state

---

### `<app-modal>`
A popup overlay with two named slots — `title` and `content`. Hidden by default using `:host { display: none }`. Visible when the `open` attribute is set using `:host([open]) { display: flex }`. Closes on button click or Escape key. The Escape key listener is added to `document` in `connectedCallback` and removed in `disconnectedCallback` to prevent a memory leak.

**Slots:** `title`, `content`

**Methods:** `openModal()`, `close()`

**Fires:** `modal-closed` — `{ bubbles: true, composed: true }`

**Demonstrates:** Shadow DOM, named slots, `:host([open])`, `setAttribute`/`removeAttribute`, `disconnectedCallback` cleanup, `backdrop-filter`

---

### `<toast-container>` and `<toast-message>`
`<toast-container>` sits fixed in the bottom-right corner and listens on `window` for `show-toast` events. When one arrives it creates a `<toast-message>` and appends it as a child.

`<toast-message>` slides in using a CSS `@keyframes` animation and auto-removes itself after 3 seconds. The timer is stored as `this._timer` and cleared in `disconnectedCallback`.

**Triggering a toast from anywhere:**
```js
window.dispatchEvent(new CustomEvent('show-toast', {
  detail: { message: 'Something happened', type: 'success' }
}));
```

**Types:** `success`, `error`, `warning`, `info`

**Demonstrates:** `window` event broadcasting, `::slotted()`, CSS animation, `setTimeout` cleanup in `disconnectedCallback`, `pointer-events`

---

## Web Components Concepts Demonstrated

| Concept | Where |
|---|---|
| Custom Elements API | All 9 components — `class extends HTMLElement`, `customElements.define()` |
| Shadow DOM | All components — `attachShadow({ mode: 'open' })` |
| `:host` | All components — controls outer element display |
| `:host([attr])` | `<app-modal>` — CSS-driven open/close |
| HTML Templates | All components — `document.createElement('template')`, `cloneNode(true)` |
| Named slots | `<app-shell>`, `<app-modal>` |
| `::slotted()` | `<toast-container>` |
| `connectedCallback` | All components |
| `disconnectedCallback` | `<app-modal>`, `<toast-message>`, `<toast-container>` |
| `observedAttributes` | `<metric-card>`, `<alert-item>`, `<toast-message>` |
| `attributeChangedCallback` | `<metric-card>`, `<alert-item>`, `<toast-message>` |
| Properties | `<service-status>`, `<alert-list>`, `<activity-table>` |
| Custom events | `<service-status>`, `<alert-item>`, `<app-modal>` |
| `bubbles: true` | All custom events |
| `composed: true` | All custom events — crosses Shadow DOM boundary |
| CSS custom properties | All components — theming via `var(--color-*)` |
| Light/dark theme | `styles.css` — `:root` and `body.dark` token overrides |
| `fetch()` + `async/await` | `main.js` — `Promise.all` for parallel loading |
| Error handling | `main.js` — `try/catch`, `.ok` check, error toast |
| Responsive layout | `styles.css` — CSS Grid with media queries |
| Accessibility | All interactive components — `aria-*`, `role`, `tabindex`, keyboard events |

---

## Data Flow

```
services.json  ─┐
alerts.json    ─┼──→  fetch() in main.js  ──→  parse with .json()
activity.json  ─┘
                         │
         ┌───────────────┼──────────────────────┐
         ▼               ▼                      ▼
   metric-card     service-status          alert-list
   setAttribute()   .services = []         .alerts = []
                                               │
                                        activity-table
                                        .activities = []
```

`main.js` is the only file that knows about the JSON files. Components only know about the data they receive. This is loose coupling — components are independent and reusable.

---

## Event Flow

```
User clicks a service row
      ↓
<service-status> fires 'service-selected'
{ detail: serviceObject, bubbles: true, composed: true }
      ↓
main.js catches it on document
      ↓
main.js fills modal slots, calls modal.openModal()
      ↓
<app-modal> sets 'open' attribute → :host([open]) CSS activates

User clicks an alert row
      ↓
<alert-item> fires 'alert-selected'
{ detail: alertObject, bubbles: true, composed: true }
      ↓
main.js catches it on document
      ↓
same modal opens with alert content

Any component calls showToast(message, type)
      ↓
window.dispatchEvent fires 'show-toast'
      ↓
<toast-container> hears it on window
      ↓
creates <toast-message>, appends it
      ↓
toast slides in, auto-removes after 3 seconds
```

---

## Theme System

CSS custom properties are defined on `:root` for light mode and overridden on `body.dark` for dark mode.

```css
:root {
  --color-background: #f1f0f7;
  --color-surface:    #ffffff;
  --color-text:       #1a1a1a;
  --color-primary:    #7c3aed;
}

body.dark {
  --color-background: #0a0a0f;
  --color-surface:    #13131f;
  --color-text:       #f1f0f7;
  --color-primary:    #a855f7;
}
```

CSS custom properties penetrate Shadow DOM walls — unlike regular CSS which is blocked at the boundary. Every `var(--color-surface)` inside every component's Shadow DOM automatically reads the new value when the theme switches. No JavaScript touches individual components. The CSS cascade does all the work.

Toggling dark mode:
```js
document.body.classList.toggle('dark');
```

---

## Running the Project

**Requirements:** VS Code with the Live Server extension (or any local HTTP server)

```bash
# Clone or download the project
# Open the ops-dashboard folder in VS Code
# Right-click index.html → Open with Live Server
# Dashboard opens at http://127.0.0.1:5500
```

No npm, no build step, no dependencies. It runs directly in any modern browser.

---

## Evaluation Coverage

| Area | Weight | How it is covered |
|---|---|---|
| Custom Elements / API knowledge | 20% | 9 components, all lifecycle methods, properties, attributes |
| Shadow DOM / CSS encapsulation | 20% | All components use `attachShadow`, `:host`, encapsulated CSS |
| Templates and Slots | 15% | All components use `<template>` and `cloneNode(true)`, named slots in shell and modal |
| Component architecture / composition | 15% | `<app-shell>` composes all components, `<alert-list>` composes `<alert-item>` |
| Events and component communication | 10% | Custom events with `bubbles` and `composed`, `window` broadcast for toasts |
| JavaScript quality | 10% | Explicit, readable, well-commented, DRY `_render()` pattern throughout |
| Accessibility / responsiveness | 5% | `aria-*` attributes, `role`, `tabindex`, keyboard events, CSS Grid with media queries |
| Testing / documentation | 5% | This README, inline code comments, project documentation notes |

---

## Author

Ansley Diya
VCC Engineering — Vonage
