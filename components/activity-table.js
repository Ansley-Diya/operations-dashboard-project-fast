const activityTemplate = document.createElement('template');
activityTemplate.innerHTML = `
  <style>
    :host {
      display: block;
    }

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

    .search-bar {
      margin-bottom: 16px;
    }

    .search-input {
      width: 100%;
      padding: 10px 16px;
      border: 1px solid var(--color-border);
      border-radius: 10px;
      font-size: 13px;
      box-sizing: border-box;
      outline: none;
      background: var(--color-surface);
      color: var(--color-text);
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }

    .search-input:focus {
      border-color: #7c3aed;
      box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
    }

    .table-wrapper {
      overflow-x: auto;
      border-radius: 10px;
      border: 1px solid var(--color-border);
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }

    thead {
      background: linear-gradient(135deg,
        rgba(124, 58, 237, 0.06),
        rgba(79, 70, 229, 0.06)
      );
    }

    th {
      text-align: left;
      padding: 12px 16px;
      border-bottom: 1px solid var(--color-border);
      color: var(--color-text-muted);
      font-weight: 700;
      white-space: nowrap;
      cursor: pointer;
      user-select: none;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      transition: color 0.2s ease;
    }

    th:hover  { color: #7c3aed; }
    th.sorted { color: #7c3aed; }

    td {
      padding: 12px 16px;
      border-bottom: 1px solid var(--color-border);
      color: var(--color-text);
      font-size: 13px;
    }

    tr:last-child td { border-bottom: none; }

    tr:hover td {
      background: rgba(124, 58, 237, 0.03);
    }

    .status-badge {
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .status-badge.success {
      background: rgba(34, 197, 94, 0.12);
      color: #16a34a;
      border: 1px solid rgba(34, 197, 94, 0.2);
    }

    .status-badge.failure {
      background: rgba(239, 68, 68, 0.12);
      color: #dc2626;
      border: 1px solid rgba(239, 68, 68, 0.2);
    }

    .status-badge.warning {
      background: rgba(245, 158, 11, 0.12);
      color: #d97706;
      border: 1px solid rgba(245, 158, 11, 0.2);
    }

    .user-chip {
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .user-avatar {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: linear-gradient(135deg, #7c3aed, #4f46e5);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      font-weight: 700;
      color: white;
      flex-shrink: 0;
    }

    .pagination {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid var(--color-border);
      font-size: 12px;
      color: var(--color-text-muted);
    }

    .pagination-controls {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .page-btn {
      padding: 6px 14px;
      border: 1px solid var(--color-border);
      border-radius: 8px;
      background: var(--color-surface);
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      color: var(--color-text);
      transition: all 0.2s ease;
    }

    .page-btn:hover:not(:disabled) {
      background: linear-gradient(135deg, #7c3aed, #4f46e5);
      color: white;
      border-color: transparent;
      box-shadow: 0 2px 8px rgba(124, 58, 237, 0.3);
    }

    .page-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .page-info {
      font-size: 12px;
      color: var(--color-text-muted);
      font-weight: 600;
    }

    .empty-state {
      text-align: center;
      padding: 32px;
      color: var(--color-text-muted);
      font-size: 13px;
    }
  </style>

  <div class="container">
    <div class="container-header">
      <div class="container-title">Activity Log</div>
    </div>

    <div class="search-bar">
      <input
        class="search-input"
        type="text"
        placeholder="Search by user, action or resource..."
        aria-label="Search activity log"
      />
    </div>

    <div class="table-wrapper">
      <table role="grid" aria-label="Activity log">
        <thead>
          <tr>
            <th data-col="user"      data-label="User">User</th>
            <th data-col="action"    data-label="Action">Action</th>
            <th data-col="resource"  data-label="Resource">Resource</th>
            <th data-col="status"    data-label="Status">Status</th>
            <th data-col="timestamp" data-label="Timestamp">Timestamp</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    </div>

    <div class="pagination" role="navigation" aria-label="Table pagination">
      <span class="results-info" aria-live="polite"></span>
      <div class="pagination-controls">
        <button class="page-btn prev-btn" aria-label="Previous page">Prev</button>
        <span class="page-info" aria-live="polite"></span>
        <button class="page-btn next-btn" aria-label="Next page">Next</button>
      </div>
    </div>
  </div>
`;

class ActivityTable extends HTMLElement {

  connectedCallback() {
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(activityTemplate.content.cloneNode(true));

    this._searchTerm    = '';
    this._sortColumn    = null;
    this._sortDirection = 'asc';
    this._currentPage   = 1;
    this._pageSize      = 5;

    shadow.querySelector('.search-input').addEventListener('input', (e) => {
      this._searchTerm  = e.target.value.toLowerCase();
      this._currentPage = 1;
      this._render();
    });

    shadow.querySelector('thead').addEventListener('click', (e) => {
      const th = e.target.closest('th');
      if (!th) return;

      const col = th.getAttribute('data-col');

      if (this._sortColumn === col) {
        this._sortDirection = this._sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this._sortColumn    = col;
        this._sortDirection = 'asc';
      }

      this._currentPage = 1;
      this._render();
    });

    shadow.querySelector('.prev-btn').addEventListener('click', () => {
      if (this._currentPage > 1) {
        this._currentPage--;
        this._render();
      }
    });

    shadow.querySelector('.next-btn').addEventListener('click', () => {
      const totalPages = Math.ceil(this._filteredCount / this._pageSize);
      if (this._currentPage < totalPages) {
        this._currentPage++;
        this._render();
      }
    });
  }

  set activities(data) {
    this._activities = data;
    this._render();
  }

  _render() {
    if (!this.shadowRoot || !this._activities) return;

    // Step 1 — Filter
    const filtered = this._activities.filter(item => {
      if (!this._searchTerm) return true;
      return (
        item.user.toLowerCase().includes(this._searchTerm)     ||
        item.action.toLowerCase().includes(this._searchTerm)   ||
        item.resource.toLowerCase().includes(this._searchTerm) ||
        item.status.toLowerCase().includes(this._searchTerm)
      );
    });

    // Step 2 — Sort
    if (this._sortColumn) {
      filtered.sort((a, b) => {
        const valA       = String(a[this._sortColumn]).toLowerCase();
        const valB       = String(b[this._sortColumn]).toLowerCase();
        const comparison = valA.localeCompare(valB);
        return this._sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    // Step 3 — Save filtered count for pagination
    this._filteredCount = filtered.length;

    // Step 4 — Slice to current page
    const start     = (this._currentPage - 1) * this._pageSize;
    const end       = start + this._pageSize;
    const pageItems = filtered.slice(start, end);

    // Step 5 — Update sort indicators on headers
    this.shadowRoot.querySelectorAll('th').forEach(th => {
      const col   = th.getAttribute('data-col');
      const label = th.getAttribute('data-label');
      if (col === this._sortColumn) {
        th.classList.add('sorted');
        th.textContent = `${label} ${this._sortDirection === 'asc' ? 'asc' : 'desc'}`;
      } else {
        th.classList.remove('sorted');
        th.textContent = label;
      }
    });

    // Step 6 — Build table rows
    const tbody = this.shadowRoot.querySelector('tbody');
    tbody.innerHTML = '';

    if (pageItems.length === 0) {
      const empty = document.createElement('tr');
      empty.innerHTML = `<td colspan="5" class="empty-state">No results found</td>`;
      tbody.appendChild(empty);
    } else {
      pageItems.forEach(item => {
        const row      = document.createElement('tr');
        const date     = new Date(item.timestamp).toLocaleDateString();
        const initials = item.user
          .split('.')
          .map(p => p[0].toUpperCase())
          .join('');

        row.innerHTML = `
          <td>
            <div class="user-chip">
              <div class="user-avatar" aria-hidden="true">${initials}</div>
              ${item.user}
            </div>
          </td>
          <td>${item.action}</td>
          <td>${item.resource}</td>
          <td>
            <span class="status-badge ${item.status}">${item.status}</span>
          </td>
          <td>${date}</td>
        `;

        tbody.appendChild(row);
      });
    }

    // Step 7 — Update pagination controls
    const totalPages = Math.ceil(filtered.length / this._pageSize);
    const startItem  = filtered.length === 0 ? 0 : start + 1;
    const endItem    = Math.min(end, filtered.length);

    this.shadowRoot.querySelector('.results-info').textContent =
      `Showing ${startItem} - ${endItem} of ${filtered.length} results`;

    this.shadowRoot.querySelector('.page-info').textContent =
      `Page ${this._currentPage} of ${Math.max(totalPages, 1)}`;

    this.shadowRoot.querySelector('.prev-btn').disabled =
      this._currentPage === 1;

    this.shadowRoot.querySelector('.next-btn').disabled =
      this._currentPage >= totalPages;
  }
}

customElements.define('activity-table', ActivityTable);
