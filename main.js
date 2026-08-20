// Helper — dispatches a show-toast event on window
// Any component anywhere can call this
function showToast(message, type = 'info') {
  window.dispatchEvent(new CustomEvent('show-toast', {
    detail: { message, type }
  }));
}

// Loads all data and passes it to the components
async function loadDashboard() {
  try {

    // Fetch all three data files simultaneously
    const [servicesResponse, alertsResponse, activityResponse] = await Promise.all([
      fetch('data/services.json'),
      fetch('data/alerts.json'),
      fetch('data/activity.json')
    ]);

    // Check each response is valid before parsing
    if (!servicesResponse.ok) throw new Error('Failed to load services.json');
    if (!alertsResponse.ok)   throw new Error('Failed to load alerts.json');
    if (!activityResponse.ok) throw new Error('Failed to load activity.json');

    // Parse JSON responses into JavaScript objects
    const services = await servicesResponse.json();
    const alerts   = await alertsResponse.json();
    const activity = await activityResponse.json();

    console.log('Services:', services);
    console.log('Alerts:',   alerts);
    console.log('Activity:', activity);

    // Calculate average response time across all services
    const totalMs = services.reduce((sum, s) => sum + s.responseTimeMs, 0);
    const avgMs   = Math.round(totalMs / services.length);

    // Pass data to the three metric cards via attributes
    const cards = document.querySelectorAll('metric-card');
    cards[0].setAttribute('title', 'Services Online');
    cards[0].setAttribute('value', `${services.filter(s => s.status === 'operational').length} / ${services.length}`);

    cards[1].setAttribute('title', 'Active Alerts');
    cards[1].setAttribute('value', alerts.filter(a => a.status === 'open').length);

    cards[2].setAttribute('title', 'Avg. Response Time');
    cards[2].setAttribute('value', `${avgMs} ms`);

    // Pass data to service-status via property setter
    const serviceStatus = document.querySelector('service-status');
    serviceStatus.services = services;

    // Pass data to alert-list via property setter
    const alertList = document.querySelector('alert-list');
    alertList.alerts = alerts;

    // Pass data to activity-table via property setter
    const activityTable = document.querySelector('activity-table');
    activityTable.activities = activity;

    // Notify the user that data loaded successfully
    showToast('Dashboard data loaded successfully', 'success');

    // Get a reference to the modal
    const modal = document.querySelector('app-modal');

    // Listen for a service row being clicked
    document.addEventListener('service-selected', (event) => {
      const service = event.detail;

      // Fill modal slots with the selected service's data
      modal.innerHTML = `
        <span slot="title">${service.name}</span>
        <div slot="content">
          <p><strong>Status:</strong> ${service.status}</p>
          <p><strong>Uptime:</strong> ${service.uptime}%</p>
          <p><strong>Response Time:</strong> ${service.responseTimeMs}ms</p>
          <p><strong>Description:</strong> ${service.description}</p>
        </div>
      `;

      modal.openModal();
      showToast(`Viewing ${service.name}`, 'info');
    });

  } catch (error) {
    // If anything fails, log it and show an error toast
    console.error('Dashboard failed to load:', error.message);
    showToast(`Failed to load dashboard: ${error.message}`, 'error');
  }
}

loadDashboard();
