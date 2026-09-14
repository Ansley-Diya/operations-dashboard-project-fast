// when() for empty state conditional rendering
import { FASTElement, observable, html, css, repeat, when } from "@microsoft/fast-element";

const template = html`
  <div class="container">

    <div class="container-header">
      <div class="container-title">Activity Log</div>
    </div>

    <!-- search bar sits on its own row below the header — matches original layout -->
    <div class="search-bar">
      <!-- @input binding — replaces querySelector('.search') + addEventListener('input', ...)
           event is the native browser InputEvent — unchanged, FAST doesn't touch it      -->
      <input
        class="search-input"
        type="text"
        placeholder="Search by user, action or resource..."
        aria-label="Search activity log"
        @input="${(x, c) => x.handleSearch(c.event)}"
      />
    </div>

    <!-- role="table" left to native <table> semantics — a real role="grid" implies full
         arrow-key cell navigation, which this component doesn't implement                -->
    <div class="table-wrapper">
      <table class="activity-table" aria-label="Activity log">
        <thead>
          <tr>
            <!-- every column is sortable, including Status and Timestamp — matches original.
                 Each header wraps a real <button> so the sort is reachable and operable from
                 the keyboard (Tab + Enter/Space), not just a mouse click. aria-sort tells
                 assistive tech which column/direction is active, same as aria-pressed on the
                 alert filter buttons.
                 @click → x.handleSort('user') — sets sortField + toggles sortDir
                 ${x => x.getSortLabel('user', 'User')} → "User" or "User asc"/"User desc" -->
            <th scope="col" aria-sort="${x => x.getAriaSort("user")}">
              <button type="button" class="sort-btn ${x => x.sortField === "user" ? "sorted" : ""}" @click="${x => x.handleSort("user")}">
                ${x => x.getSortLabel("user", "User")}
              </button>
            </th>
            <th scope="col" aria-sort="${x => x.getAriaSort("action")}">
              <button type="button" class="sort-btn ${x => x.sortField === "action" ? "sorted" : ""}" @click="${x => x.handleSort("action")}">
                ${x => x.getSortLabel("action", "Action")}
              </button>
            </th>
            <th scope="col" aria-sort="${x => x.getAriaSort("resource")}">
              <button type="button" class="sort-btn ${x => x.sortField === "resource" ? "sorted" : ""}" @click="${x => x.handleSort("resource")}">
                ${x => x.getSortLabel("resource", "Resource")}
              </button>
            </th>
            <th scope="col" aria-sort="${x => x.getAriaSort("status")}">
              <button type="button" class="sort-btn ${x => x.sortField === "status" ? "sorted" : ""}" @click="${x => x.handleSort("status")}">
                ${x => x.getSortLabel("status", "Status")}
              </button>
            </th>
            <th scope="col" aria-sort="${x => x.getAriaSort("timestamp")}">
              <button type="button" class="sort-btn ${x => x.sortField === "timestamp" ? "sorted" : ""}" @click="${x => x.handleSort("timestamp")}">
                ${x => x.getSortLabel("timestamp", "Timestamp")}
              </button>
            </th>
          </tr>
        </thead>
        <tbody>

          <!-- when() — empty state
               Replaces: if (rows.length === 0) { tbody.innerHTML = '<tr><td>...</td></tr>' }
               When filteredRows is empty → this row appears
               When data arrives → this row disappears automatically                        -->
          ${when(x => x.filteredRows.length === 0, html`
            <tr>
              <td colspan="5" class="empty-state">No results found</td>
            </tr>
          `)}

          <!-- repeat() — renders each row
               x => x.filteredRows → computed getter: filtered + sorted + paginated slice
               Inside item template: x = individual activity object
               When any observable changes → getter re-runs → repeat() reconciles rows     -->
          ${repeat(x => x.filteredRows, html`
            <tr class="table-row">
              <td class="td-user">
                <!-- initials from EVERY word in the name ("Maya Chen" → "MC"), not just the
                     first letter of the whole string — filter(Boolean) drops empty pieces
                     from a stray double space so p[0] is never called on undefined         -->
                <div class="user-avatar">${x => (x.user || "").trim().split(/\s+/).filter(Boolean).map(p => p[0].toUpperCase()).join("") || "?"}</div>
                <span>${x => x.user}</span>
              </td>
              <td>${x => x.action}</td>
              <td class="td-resource">${x => x.resource}</td>
              <td>
                <!-- dynamic class on status badge — same pattern as alert-item -->
                <span class="status-badge ${x => x.status}">${x => x.status}</span>
              </td>
              <!-- data field is "timestamp" (ISO string) — guarded the same way as alert-item's
                   formattedDate so a missing/invalid timestamp renders blank, not "Invalid Date" -->
              <td class="td-time">${x => { if (!x.timestamp) return ""; const d = new Date(x.timestamp); return isNaN(d.getTime()) ? "" : d.toLocaleDateString(); }}</td>
            </tr>
          `)}

        </tbody>
      </table>
    </div>

    <!-- PAGINATION
         ?disabled — boolean attribute binding
         If x.currentPage === 1 is true  → disabled attribute is ADDED    (button disabled)
         If x.currentPage === 1 is false → disabled attribute is REMOVED  (button enabled)
         Replaces: if (page === 1) btn.setAttribute('disabled','') else btn.removeAttribute('disabled')
         resultsInfo mirrors original's "Showing X - Y of Z results" text -->
    <div class="pagination" role="navigation" aria-label="Table pagination">
      <span class="results-info" aria-live="polite">${x => x.resultsInfo}</span>

      <div class="pagination-controls">
        <button
          class="page-btn"
          ?disabled="${x => x.currentPage === 1}"
          @click="${x => x.prevPage()}"
          aria-label="Previous page"
        >Prev</button>

        <span class="page-info" aria-live="polite">
          Page ${x => x.currentPage} of ${x => x.totalPages}
        </span>

        <button
          class="page-btn"
          ?disabled="${x => x.currentPage >= x.totalPages}"
          @click="${x => x.nextPage()}"
          aria-label="Next page"
        >Next</button>
      </div>
    </div>

  </div>
`;

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
    gap: 12px;
    flex-wrap: wrap;
  }

  .container-title {
    font-size: 11px;
    font-weight: 700;
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.8px;
  }

  .search-bar { margin-bottom: 16px; }

  .search-input {
    width: 100%;
    box-sizing: border-box;
    padding: 7px 14px;
    border-radius: 20px;
    border: 1px solid var(--color-border);
    background: var(--color-surface-alt, var(--color-surface));
    color: var(--color-text);
    font-size: 12px;
    outline: none;
    transition: border-color 0.2s;
  }

  .search-input:focus { border-color: #7c3aed; }

  .table-wrapper {
    overflow-x: auto;
    border-radius: 10px;
    border: 1px solid var(--color-border);
  }

  .activity-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
  }

  thead th {
    text-align: left;
    padding: 0;
    font-size: 11px;
    font-weight: 700;
    border-bottom: 1px solid var(--color-border);
  }

  /* the header text is a real <button> now (for keyboard access) — reset it to look like
     the plain text it used to be, then reuse the same hover/sorted colors as before */
  .sort-btn {
    display: block;
    width: 100%;
    padding: 8px 12px;
    font: inherit;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    text-align: left;
    background: none;
    border: none;
    color: var(--color-text-muted);
    cursor: pointer;
    user-select: none;
  }

  .sort-btn:hover { color: var(--color-text); }
  .sort-btn.sorted { color: #7c3aed; }
  .sort-btn:focus-visible { outline: 2px solid #7c3aed; outline-offset: -2px; }

  .table-row td {
    padding: 10px 12px;
    border-bottom: 1px solid var(--color-border);
    color: var(--color-text);
    vertical-align: middle;
  }

  .table-row:hover td { background: var(--color-hover); }
  .table-row:last-child td { border-bottom: none; }

  .td-user {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .user-avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: linear-gradient(135deg, #7c3aed, #4f46e5);
    color: white;
    font-size: 11px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .td-resource {
    font-family: monospace;
    font-size: 12px;
    color: var(--color-text-muted);
  }

  .td-time { color: var(--color-text-muted); font-size: 12px; }

  .status-badge {
    font-size: 10px;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 6px;
    text-transform: capitalize;
  }

  .status-badge.success  { background: rgba(34,197,94,0.1);  color: #16a34a; }
  .status-badge.failed   { background: rgba(239,68,68,0.1);  color: #dc2626; }
  .status-badge.pending  { background: rgba(245,158,11,0.1); color: #d97706; }

  .empty-state {
    text-align: center;
    padding: 32px;
    color: var(--color-text-muted);
    font-size: 13px;
  }

  .pagination {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--color-border);
  }

  .pagination-controls {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .results-info {
    font-size: 12px;
    color: var(--color-text-muted);
  }

  .page-btn {
    padding: 6px 16px;
    border: 1px solid var(--color-border);
    border-radius: 20px;
    background: var(--color-surface);
    color: var(--color-text);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .page-btn:hover:not(:disabled) {
    background: linear-gradient(135deg, #7c3aed, #4f46e5);
    color: white;
    border-color: transparent;
  }

  .page-btn:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  .page-info {
    font-size: 12px;
    color: var(--color-text-muted);
    font-weight: 500;
  }
`;

// ─── CLASS ────────────────────────────────────────────────────────────────────
class ActivityTable extends FASTElement {

  // currentPage is internal state — not an HTML attribute, not set from outside
  // We initialise it directly (no observable needed for simple counters
  // that don't drive template bindings directly — but we make it observable
  // so the pagination text ${x => x.currentPage} updates automatically)
  constructor() {
    super(); // always first — FASTElement attaches Shadow DOM here
    this.currentPage = 1;
    this.pageSize    = 5;    // matches original's _pageSize
    this.searchQuery = "";
    this.sortField   = null; // no default sort column — natural (recent-first) JSON order, matches original
    this.sortDir     = "asc";
  }

  // COMPUTED GETTER — single source of truth for displayed rows
  // Replaces the entire _applyFilters() + _render() pipeline from vanilla
  // Called by repeat(x => x.filteredRows) and when(x => x.filteredRows.length === 0)
  // Re-called automatically when any of the 4 observables change
  // filteredAndSorted — search + sort, WITHOUT pagination (source for counts and slicing)
  get filteredAndSorted() {
    let rows = this.activities || [];

    // search — matches user, action, resource AND status, same as original _render()
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      rows = rows.filter(r =>
        (r.user     || "").toLowerCase().includes(q) ||
        (r.action   || "").toLowerCase().includes(q) ||
        (r.resource || "").toLowerCase().includes(q) ||
        (r.status   || "").toLowerCase().includes(q)
      );
    }

    // sort — only once a column has been clicked; original has no default sort column
    if (this.sortField) {
      rows = [...rows].sort((a, b) => {
        const av = (a[this.sortField] || "").toString().toLowerCase();
        const bv = (b[this.sortField] || "").toString().toLowerCase();
        return this.sortDir === "asc"
          ? av.localeCompare(bv)
          : bv.localeCompare(av);
      });
    }

    return rows;
  }

  // filteredRows — paginated slice, used by repeat()
  get filteredRows() {
    const rows  = this.filteredAndSorted;
    const start = (this.currentPage - 1) * this.pageSize;
    return rows.slice(start, start + this.pageSize);
  }

  // totalPages — based on the FILTERED count, not the total unfiltered activities
  get totalPages() {
    return Math.max(1, Math.ceil(this.filteredAndSorted.length / this.pageSize));
  }

  // resultsInfo — "Showing X - Y of Z results", same text as original's .results-info
  // NOTE: this.currentPage must be read unconditionally on every path (no early return) —
  // FAST captures a non-volatile binding's dependencies only on its first evaluation, and
  // that first render happens while activities is still empty (total === 0). An early
  // return there would skip reading currentPage, so the binding would never subscribe to
  // page changes and would silently stop updating after the very first render.
  get resultsInfo() {
    const total = this.filteredAndSorted.length;
    const start = (this.currentPage - 1) * this.pageSize;
    const from  = total === 0 ? 0 : start + 1;
    const end   = total === 0 ? 0 : Math.min(start + this.pageSize, total);
    return `Showing ${from} - ${end} of ${total} results`;
  }

  // getSortLabel — "Label" when unsorted, "Label asc"/"Label desc" when sorted (matches original header text)
  getSortLabel(field, label) {
    if (this.sortField !== field) return label;
    return `${label} ${this.sortDir}`;
  }

  // getAriaSort — value for the <th>'s aria-sort attribute, so screen readers announce
  // which column/direction is active (visual users get the same info from .sorted's color)
  getAriaSort(field) {
    if (this.sortField !== field) return "none";
    return this.sortDir === "asc" ? "ascending" : "descending";
  }

  // handleSearch — called by @input binding
  // Sets searchQuery → observable fires → filteredRows getter re-runs
  // → repeat() reconciles rows, when() re-checks empty state
  handleSearch(e) {
    this.searchQuery  = e.target.value;
    this.currentPage  = 1; // reset to page 1 on new search
  }

  // handleSort — called by @click on each <th>
  // Toggles sortDir if same field, resets to asc if new field
  handleSort(field) {
    if (this.sortField === field) {
      this.sortDir = this.sortDir === "asc" ? "desc" : "asc";
    } else {
      this.sortField = field;
      this.sortDir   = "asc";
    }
    this.currentPage = 1;
  }

  prevPage() {
    if (this.currentPage > 1) this.currentPage--;
  }

  nextPage() {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }
}

// 4 observables — each one drives bindings in the template
// When any of these changes → FAST notified → dependent bindings update
// activities   → drives repeat() via filteredRows getter
// searchQuery  → drives filteredRows → drives repeat() + when()
// sortField    → drives filteredRows + getSortIcon bindings
// sortDir      → drives filteredRows + getSortIcon bindings
observable(ActivityTable.prototype, "activities");
observable(ActivityTable.prototype, "searchQuery");
observable(ActivityTable.prototype, "sortField");
observable(ActivityTable.prototype, "sortDir");
observable(ActivityTable.prototype, "currentPage");

ActivityTable.define({
  name: "activity-table",
  template,
  styles,
});
