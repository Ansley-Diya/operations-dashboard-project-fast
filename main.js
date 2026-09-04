// main.js is the only file that knows the data/*.json files exist.
// Every component only ever receives data through attributes/properties or
// reacts to events — none of them know or care where the data came from.
// That's the loose coupling the README describes: components stay reusable.

// escapeHtml — the modal's content below is built with template-literal strings
// assigned to .innerHTML. That's fine for our own local trusted JSON today, but the
// moment any of these values came from a remote API instead, an unescaped "<" or """
// in a name/message would let it inject markup into the page (a stored-XSS hole).
// Escaping every interpolated value here costs nothing and closes that hole for good.
function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[ch]));
}

document.addEventListener("DOMContentLoaded", async () => {

  const modal = document.querySelector("app-modal");

  // ── EVENT LISTENERS ─────────────────────────────────────────────────────────
  // Registered up front, before any data has loaded. These don't depend on the
  // fetch below succeeding — a failed fetch below must not leave the page unable
  // to respond to a service/alert click on a future successful reload.

  // serviceNameById is filled in once the data loads below; alert.service is a raw
  // id like "auth" — this map lets the modal show the friendly name instead.
  // Declared here (not inside the try) so the alert-selected handler can always
  // safely refer to it, even before the data has loaded.
  let serviceNameById = new Map();

  // service-selected — dispatched by <service-status> when a row is clicked/Enter'd
  document.addEventListener("service-selected", (e) => {
    if (!modal) return;
    const s = e.detail.service;
    modal.innerHTML = `
      <span slot="title">${escapeHtml(s.name)}</span>
      <div slot="content">
        <p><strong>Status:</strong> ${escapeHtml(s.status)}</p>
        <p><strong>Uptime:</strong> ${escapeHtml(s.uptime)}%</p>
        <p><strong>Response time:</strong> ${escapeHtml(s.responseTimeMs)}ms</p>
      </div>
    `;
    modal.open = true;
  });

  // alert-selected — dispatched by <alert-item> when a row is clicked/Enter'd
  document.addEventListener("alert-selected", (e) => {
    if (!modal) return;
    const a = e.detail;
    const serviceName = serviceNameById.get(a.service) || a.service;
    modal.innerHTML = `
      <span slot="title">${escapeHtml((a.severity || "").toUpperCase())} — ${escapeHtml(a.title)}</span>
      <div slot="content">
        <p><strong>Service:</strong>  ${escapeHtml(serviceName)}</p>
        <p><strong>Status:</strong>   ${escapeHtml(a.status)}</p>
        <p><strong>Time:</strong>     ${escapeHtml(a.timestamp)}</p>
        ${a.message ? `<p>${escapeHtml(a.message)}</p>` : ""}
      </div>
    `;
    modal.open = true;
  });

  // ── DATA LOADING ─────────────────────────────────────────────────────────────
  // Wrapped in try/catch so a failed fetch shows an error toast instead of leaving
  // an unhandled promise rejection and a half-built page with no explanation.
  try {

    // fetch() only rejects on a network failure — a 404/500 still resolves
    // successfully, so each response's .ok must be checked before parsing JSON
    const [servicesResponse, alertsResponse, activityResponse] = await Promise.all([
      fetch("./data/services.json"),
      fetch("./data/alerts.json"),
      fetch("./data/activity.json"),
    ]);
    if (!servicesResponse.ok) throw new Error("Failed to load services.json");
    if (!alertsResponse.ok)   throw new Error("Failed to load alerts.json");
    if (!activityResponse.ok) throw new Error("Failed to load activity.json");

    const services   = await servicesResponse.json();
    const alerts     = await alertsResponse.json();
    const activities = await activityResponse.json();

    // fill in the lookup the alert-selected listener above already captured by reference
    serviceNameById = new Map(services.map(s => [s.id, s.name]));

    // ── METRIC CARDS ──────────────────────────────────────────────────────────
    // computed from services/alerts — matches the original vanilla dashboard
    const avgResponseMs = Math.round(
      services.reduce((sum, s) => sum + s.responseTimeMs, 0) / services.length
    );
    const cards = document.querySelectorAll("metric-card");
    const metricData = [
      { heading: "Services Online",    value: `${services.filter(s => s.status === "operational").length} / ${services.length}` },
      { heading: "Active Alerts",      value: String(alerts.filter(a => a.status === "open").length) },
      { heading: "Avg. Response Time", value: `${avgResponseMs} ms` },
    ];
    metricData.forEach((metric, i) => {
      if (cards[i]) {
        // "heading" not "title" — <metric-card> avoids the reserved title attribute
        cards[i].setAttribute("heading", metric.heading);
        cards[i].setAttribute("value", metric.value);
      }
    });

    // ── SERVICE STATUS ───────────────────────────────────────────────────────
    // property setter (not setAttribute) — services is an array, and HTML attributes
    // can only ever be strings, so array/object data must go through a JS property
    const serviceStatus = document.querySelector("service-status");
    if (serviceStatus) {
      serviceStatus.services = services;
    }

    // ── ALERT LIST ───────────────────────────────────────────────────────────
    // augment each alert with the service's friendly name up front, so
    // <alert-item> can just display it — no lookup logic inside the component
    const alertsWithServiceNames = alerts.map(a => ({
      ...a,
      serviceName: serviceNameById.get(a.service) || a.service,
    }));
    const alertList = document.querySelector("alert-list");
    if (alertList) {
      alertList.alerts        = alertsWithServiceNames;
      alertList.currentFilter = "all";
    }

    // ── ACTIVITY TABLE ───────────────────────────────────────────────────────
    const activityTable = document.querySelector("activity-table");
    if (activityTable) {
      activityTable.activities = activities;
    }

    // ── TOAST DEMO ───────────────────────────────────────────────────────────
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("show-toast", {
        detail: { message: "Dashboard loaded successfully", type: "success" }
      }));
    }, 800);

  } catch (error) {
    // logged for developers, toasted for the user — same two-part error handling
    // pattern the original vanilla main.js uses
    console.error("Dashboard failed to load:", error.message);
    window.dispatchEvent(new CustomEvent("show-toast", {
      detail: { message: `Failed to load dashboard: ${error.message}`, type: "error" }
    }));
  }

});

