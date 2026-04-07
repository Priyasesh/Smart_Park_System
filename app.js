<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Smart Park — Real-Time Parking Operations Monitoring System</title>
  <link rel="stylesheet" href="./style.css" />
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
  <div class="app-shell">
    <header class="topbar">
      <div class="topbar-copy">
        <p class="eyebrow">SMART PARK · CAMPUS OPERATIONS MONITORING</p>
        <h1>Real-Time Parking Operations Monitoring System</h1>
        <p class="subtext">
          Monitor occupancy, identify peak usage patterns, and improve parking space utilization with live operational insights.
        </p>
      </div>

      <div class="topbar-actions">
        <button id="themeToggle" class="secondary-btn">Toggle Theme</button>
        <button id="exportCsvBtn" class="primary-btn">Export Snapshot</button>
      </div>
    </header>

    <main class="dashboard">
      <section class="kpi-grid">
        <div class="kpi-card">
          <p class="kpi-label">Total Spots</p>
          <h2 id="totalSpots">0</h2>
          <span class="kpi-footnote">Across all parking zones</span>
        </div>

        <div class="kpi-card">
          <p class="kpi-label">Occupied</p>
          <h2 id="occupiedSpots">0</h2>
          <span class="kpi-footnote">Currently in use</span>
        </div>

        <div class="kpi-card">
          <p class="kpi-label">Available</p>
          <h2 id="availableSpots">0</h2>
          <span class="kpi-footnote">Open for incoming vehicles</span>
        </div>

        <div class="kpi-card">
          <p class="kpi-label">Occupancy Rate</p>
          <h2 id="occupancyRate">0%</h2>
          <span class="kpi-footnote">Live space utilization</span>
        </div>

        <div class="kpi-card">
          <p class="kpi-label">Reserved</p>
          <h2 id="reservedSpots">0</h2>
          <span class="kpi-footnote">Blocked for priority users</span>
        </div>

        <div class="kpi-card">
          <p class="kpi-label">Maintenance</p>
          <h2 id="maintenanceSpots">0</h2>
          <span class="kpi-footnote">Temporarily unavailable</span>
        </div>
      </section>

      <section class="control-row">
        <div class="filter-group">
          <label for="zoneFilter">Zone</label>
          <select id="zoneFilter">
            <option value="All">All Zones</option>
            <option value="Zone A">Zone A</option>
            <option value="Zone B">Zone B</option>
            <option value="Zone C">Zone C</option>
            <option value="Zone D">Zone D</option>
          </select>
        </div>

        <div class="filter-group">
          <label for="statusFilter">Space Status</label>
          <select id="statusFilter">
            <option value="All">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Occupied">Occupied</option>
            <option value="Reserved">Reserved</option>
            <option value="Maintenance">Maintenance</option>
          </select>
        </div>

        <div class="filter-group search-group">
          <label for="searchInput">Search Slot</label>
          <input type="text" id="searchInput" placeholder="Search slot ID or vehicle type..." />
        </div>

        <div class="filter-group live-group">
          <label for="liveToggle">Live Simulation</label>
          <button id="liveToggle" class="secondary-btn live-btn">Pause Live Updates</button>
        </div>
      </section>

      <section class="alert-strip" id="alertStrip">
        <strong>Operational Alerts:</strong>
        <span id="alertText">No active alerts right now.</span>
      </section>

      <section class="main-grid">
        <div class="panel panel-large">
          <div class="panel-header">
            <div>
              <h3>Parking Space Map</h3>
              <p class="panel-subtext">Real-time view of parking spot status by zone.</p>
            </div>
            <div class="legend">
              <span><i class="legend-dot available"></i> Available</span>
              <span><i class="legend-dot occupied"></i> Occupied</span>
              <span><i class="legend-dot reserved"></i> Reserved</span>
              <span><i class="legend-dot maintenance"></i> Maintenance</span>
            </div>
          </div>
          <div id="parkingGrid" class="parking-grid"></div>
        </div>

        <div class="panel side-panel">
          <div class="panel-header">
            <div>
              <h3>Operational Insights</h3>
              <p class="panel-subtext">Auto-generated observations from current occupancy.</p>
            </div>
          </div>
          <div id="insightsList" class="insights-list"></div>
        </div>
      </section>

      <section class="analytics-grid">
        <div class="panel">
          <div class="panel-header">
            <div>
              <h3>Hourly Occupancy Trend</h3>
              <p class="panel-subtext">Historical occupancy pattern across the day.</p>
            </div>
          </div>
          <div class="chart-wrap">
            <canvas id="occupancyChart"></canvas>
          </div>
        </div>

        <div class="panel">
          <div class="panel-header">
            <div>
              <h3>Zone Utilization</h3>
              <p class="panel-subtext">Compare usage across parking zones.</p>
            </div>
          </div>
          <div id="zoneStats" class="zone-stats"></div>
        </div>
      </section>

      <section class="panel">
        <div class="panel-header">
          <div>
            <h3>Event Feed</h3>
            <p class="panel-subtext">Recent occupancy changes, threshold alerts, and operational events.</p>
          </div>
        </div>
        <div id="eventFeed" class="event-feed"></div>
      </section>
    </main>
  </div>

  <script src="./app.js"></script>
</body>
</html>