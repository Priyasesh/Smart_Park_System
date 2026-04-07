const parkingSpots = [
  { slotId: "A-01", zone: "Zone A", status: "Occupied", vehicleType: "Sedan", lastUpdated: "16:00" },
  { slotId: "A-02", zone: "Zone A", status: "Available", vehicleType: "—", lastUpdated: "16:00" },
  { slotId: "A-03", zone: "Zone A", status: "Occupied", vehicleType: "SUV", lastUpdated: "16:01" },
  { slotId: "A-04", zone: "Zone A", status: "Reserved", vehicleType: "EV Reserved", lastUpdated: "16:02" },
  { slotId: "A-05", zone: "Zone A", status: "Available", vehicleType: "—", lastUpdated: "16:03" },

  { slotId: "B-01", zone: "Zone B", status: "Occupied", vehicleType: "Hatchback", lastUpdated: "16:00" },
  { slotId: "B-02", zone: "Zone B", status: "Occupied", vehicleType: "SUV", lastUpdated: "16:01" },
  { slotId: "B-03", zone: "Zone B", status: "Maintenance", vehicleType: "Blocked", lastUpdated: "15:55" },
  { slotId: "B-04", zone: "Zone B", status: "Available", vehicleType: "—", lastUpdated: "16:02" },
  { slotId: "B-05", zone: "Zone B", status: "Occupied", vehicleType: "Sedan", lastUpdated: "16:02" },

  { slotId: "C-01", zone: "Zone C", status: "Available", vehicleType: "—", lastUpdated: "15:59" },
  { slotId: "C-02", zone: "Zone C", status: "Available", vehicleType: "—", lastUpdated: "15:59" },
  { slotId: "C-03", zone: "Zone C", status: "Occupied", vehicleType: "Motorcycle", lastUpdated: "16:00" },
  { slotId: "C-04", zone: "Zone C", status: "Reserved", vehicleType: "Staff Reserved", lastUpdated: "15:58" },
  { slotId: "C-05", zone: "Zone C", status: "Occupied", vehicleType: "Sedan", lastUpdated: "16:01" },

  { slotId: "D-01", zone: "Zone D", status: "Available", vehicleType: "—", lastUpdated: "15:57" },
  { slotId: "D-02", zone: "Zone D", status: "Occupied", vehicleType: "SUV", lastUpdated: "16:00" },
  { slotId: "D-03", zone: "Zone D", status: "Occupied", vehicleType: "Sedan", lastUpdated: "16:00" },
  { slotId: "D-04", zone: "Zone D", status: "Available", vehicleType: "—", lastUpdated: "16:01" },
  { slotId: "D-05", zone: "Zone D", status: "Occupied", vehicleType: "Hatchback", lastUpdated: "16:03" }
];

const hourlyTrendData = [22, 28, 35, 44, 58, 72, 84, 90, 88, 76, 63, 49];
const hourlyLabels = ["7 AM", "8 AM", "9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM"];

const eventEntries = [
  {
    type: "warning",
    title: "Zone B nearing capacity",
    description: "Occupancy crossed the internal threshold for peak usage monitoring.",
    time: "04:00 PM"
  },
  {
    type: "info",
    title: "Reserved spaces updated",
    description: "Two priority parking spaces were marked reserved for staff use.",
    time: "03:54 PM"
  },
  {
    type: "success",
    title: "Availability increased in Zone C",
    description: "Two vehicles exited, improving short-term availability.",
    time: "03:48 PM"
  },
  {
    type: "danger",
    title: "Maintenance block active",
    description: "One parking bay in Zone B remains unavailable due to maintenance.",
    time: "03:41 PM"
  }
];

const totalSpotsEl = document.getElementById("totalSpots");
const occupiedSpotsEl = document.getElementById("occupiedSpots");
const availableSpotsEl = document.getElementById("availableSpots");
const occupancyRateEl = document.getElementById("occupancyRate");
const reservedSpotsEl = document.getElementById("reservedSpots");
const maintenanceSpotsEl = document.getElementById("maintenanceSpots");

const zoneFilter = document.getElementById("zoneFilter");
const statusFilter = document.getElementById("statusFilter");
const searchInput = document.getElementById("searchInput");
const liveToggle = document.getElementById("liveToggle");

const alertText = document.getElementById("alertText");
const parkingGrid = document.getElementById("parkingGrid");
const insightsList = document.getElementById("insightsList");
const zoneStats = document.getElementById("zoneStats");
const eventFeed = document.getElementById("eventFeed");

const exportCsvBtn = document.getElementById("exportCsvBtn");
const themeToggle = document.getElementById("themeToggle");

let liveUpdatesEnabled = true;
let occupancyChart = null;
let simulationInterval = null;

function getSlotClass(status) {
  if (status === "Available") return "slot-available";
  if (status === "Occupied") return "slot-occupied";
  if (status === "Reserved") return "slot-reserved";
  return "slot-maintenance";
}

function getFilteredSpots() {
  const selectedZone = zoneFilter.value;
  const selectedStatus = statusFilter.value;
  const searchValue = searchInput.value.trim().toLowerCase();

  return parkingSpots.filter((spot) => {
    const matchesZone = selectedZone === "All" || spot.zone === selectedZone;
    const matchesStatus = selectedStatus === "All" || spot.status === selectedStatus;
    const matchesSearch =
      spot.slotId.toLowerCase().includes(searchValue) ||
      spot.vehicleType.toLowerCase().includes(searchValue);

    return matchesZone && matchesStatus && matchesSearch;
  });
}

function updateKpis(data) {
  const total = data.length;
  const occupied = data.filter(spot => spot.status === "Occupied").length;
  const available = data.filter(spot => spot.status === "Available").length;
  const reserved = data.filter(spot => spot.status === "Reserved").length;
  const maintenance = data.filter(spot => spot.status === "Maintenance").length;
  const rate = total === 0 ? 0 : Math.round((occupied / total) * 100);

  totalSpotsEl.textContent = total;
  occupiedSpotsEl.textContent = occupied;
  availableSpotsEl.textContent = available;
  occupancyRateEl.textContent = `${rate}%`;
  reservedSpotsEl.textContent = reserved;
  maintenanceSpotsEl.textContent = maintenance;
}

function renderParkingGrid(data) {
  parkingGrid.innerHTML = "";

  if (data.length === 0) {
    parkingGrid.innerHTML = `<div class="insight-card"><h4>No matching parking spaces</h4><p>Try changing the zone, status, or search filter.</p></div>`;
    return;
  }

  data.forEach((spot) => {
    const card = document.createElement("div");
    card.className = `parking-slot ${getSlotClass(spot.status)}`;

    card.innerHTML = `
      <div class="slot-top">
        <div>
          <div class="slot-id">${spot.slotId}</div>
          <div class="slot-zone">${spot.zone}</div>
        </div>
        <div class="slot-status">${spot.status}</div>
      </div>
      <div class="slot-meta">
        <div>Vehicle: ${spot.vehicleType}</div>
        <div>Updated: ${spot.lastUpdated}</div>
      </div>
    `;

    parkingGrid.appendChild(card);
  });
}

function renderZoneStats() {
  zoneStats.innerHTML = "";

  const zones = ["Zone A", "Zone B", "Zone C", "Zone D"];

  zones.forEach((zone) => {
    const zoneSpots = parkingSpots.filter(spot => spot.zone === zone);
    const occupied = zoneSpots.filter(spot => spot.status === "Occupied").length;
    const total = zoneSpots.length;
    const rate = total === 0 ? 0 : Math.round((occupied / total) * 100);

    const card = document.createElement("div");
    card.className = "zone-card";
    card.innerHTML = `
      <h4>${zone}</h4>
      <p>Occupied ${occupied} of ${total} spots</p>
      <div class="zone-value">${rate}%</div>
    `;
    zoneStats.appendChild(card);
  });
}

function renderInsights(data) {
  insightsList.innerHTML = "";

  const occupied = data.filter(spot => spot.status === "Occupied").length;
  const total = data.length;
  const rate = total === 0 ? 0 : Math.round((occupied / total) * 100);

  const allZoneRates = ["Zone A", "Zone B", "Zone C", "Zone D"].map(zone => {
    const zoneSpots = parkingSpots.filter(spot => spot.zone === zone);
    const zoneOccupied = zoneSpots.filter(spot => spot.status === "Occupied").length;
    return {
      zone,
      rate: Math.round((zoneOccupied / zoneSpots.length) * 100)
    };
  });

  const highestZone = allZoneRates.reduce((max, current) => current.rate > max.rate ? current : max, allZoneRates[0]);
  const lowestZone = allZoneRates.reduce((min, current) => current.rate < min.rate ? current : min, allZoneRates[0]);

  const insights = [
    {
      title: "Current Occupancy",
      text: rate >= 80
        ? "Parking demand is currently high. Overflow handling or directional guidance may be needed."
        : rate >= 50
        ? "Occupancy is moderate and parking flow appears manageable."
        : "Occupancy is relatively low, indicating available capacity across the monitored lot."
    },
    {
      title: "Peak Zone",
      text: `${highestZone.zone} has the highest current utilization at ${highestZone.rate}%, indicating stronger demand in that section.`
    },
    {
      title: "Underused Zone",
      text: `${lowestZone.zone} is currently the least utilized area at ${lowestZone.rate}%, which may indicate an opportunity for better load balancing.`
    }
  ];

  insights.forEach((item) => {
    const card = document.createElement("div");
    card.className = "insight-card";
    card.innerHTML = `
      <h4>${item.title}</h4>
      <p>${item.text}</p>
    `;
    insightsList.appendChild(card);
  });
}

function updateAlerts() {
  const occupied = parkingSpots.filter(spot => spot.status === "Occupied").length;
  const total = parkingSpots.length;
  const occupancy = Math.round((occupied / total) * 100);

  const zoneBSpots = parkingSpots.filter(spot => spot.zone === "Zone B");
  const zoneBOccupied = zoneBSpots.filter(spot => spot.status === "Occupied").length;
  const zoneBRate = Math.round((zoneBOccupied / zoneBSpots.length) * 100);

  if (occupancy >= 85) {
    alertText.textContent = `Lot occupancy is at ${occupancy}%. High demand detected — consider redirecting vehicles to lower-usage zones.`;
  } else if (zoneBRate >= 80) {
    alertText.textContent = `Zone B occupancy is at ${zoneBRate}%. Peak pressure detected in this section.`;
  } else {
    alertText.textContent = "No critical occupancy alerts right now. Parking availability remains within normal range.";
  }
}

function renderEventFeed() {
  eventFeed.innerHTML = "";

  eventEntries.forEach((entry) => {
    const item = document.createElement("div");
    item.className = "feed-item";

    item.innerHTML = `
      <div class="feed-dot ${entry.type}"></div>
      <div class="feed-content">
        <strong>${entry.title}</strong>
        <p>${entry.description}</p>
        <span class="feed-time">${entry.time}</span>
      </div>
    `;

    eventFeed.appendChild(item);
  });
}

function renderChart() {
  const ctx = document.getElementById("occupancyChart").getContext("2d");

  if (occupancyChart) {
    occupancyChart.destroy();
  }

  occupancyChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: hourlyLabels,
      datasets: [
        {
          label: "Occupied Spots",
          data: hourlyTrendData,
          borderColor: "#1f6feb",
          backgroundColor: "rgba(31, 111, 235, 0.12)",
          fill: true,
          tension: 0.35,
          pointRadius: 3,
          pointHoverRadius: 5
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: "rgba(120, 140, 160, 0.15)"
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      }
    }
  });
}

function refreshDashboard() {
  const filteredData = getFilteredSpots();
  updateKpis(filteredData);
  renderParkingGrid(filteredData);
  renderInsights(filteredData);
  renderZoneStats();
  updateAlerts();
}

function getCurrentTime() {
  const now = new Date();
  return now.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function randomizeSpotStatus() {
  const mutableStatuses = ["Available", "Occupied"];
  const randomIndex = Math.floor(Math.random() * parkingSpots.length);
  const selectedSpot = parkingSpots[randomIndex];

  if (selectedSpot.status === "Reserved" || selectedSpot.status === "Maintenance") {
    return;
  }

  const newStatus = mutableStatuses[Math.floor(Math.random() * mutableStatuses.length)];
  selectedSpot.status = newStatus;
  selectedSpot.vehicleType = newStatus === "Occupied"
    ? ["Sedan", "SUV", "Hatchback", "Motorcycle"][Math.floor(Math.random() * 4)]
    : "—";
  selectedSpot.lastUpdated = getCurrentTime();

  eventEntries.unshift({
    type: newStatus === "Occupied" ? "warning" : "success",
    title: `${selectedSpot.slotId} status changed`,
    description: `${selectedSpot.zone} spot ${selectedSpot.slotId} is now marked as ${newStatus}.`,
    time: getCurrentTime()
  });

  if (eventEntries.length > 6) {
    eventEntries.pop();
  }

  const occupiedCount = parkingSpots.filter(spot => spot.status === "Occupied").length;
  hourlyTrendData.shift();
  hourlyTrendData.push(occupiedCount);

  renderEventFeed();
  refreshDashboard();
  renderChart();
}

function startSimulation() {
  simulationInterval = setInterval(() => {
    if (liveUpdatesEnabled) {
      randomizeSpotStatus();
    }
  }, 4000);
}

function exportCsv() {
  const filteredData = getFilteredSpots();

  const headers = ["Slot ID", "Zone", "Status", "Vehicle Type", "Last Updated"];
  const rows = filteredData.map(spot => [
    spot.slotId,
    spot.zone,
    spot.status,
    spot.vehicleType,
    spot.lastUpdated
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(value => `"${value}"`).join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "smart-park-snapshot.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

zoneFilter.addEventListener("change", refreshDashboard);
statusFilter.addEventListener("change", refreshDashboard);
searchInput.addEventListener("input", refreshDashboard);

liveToggle.addEventListener("click", () => {
  liveUpdatesEnabled = !liveUpdatesEnabled;
  liveToggle.textContent = liveUpdatesEnabled ? "Pause Live Updates" : "Resume Live Updates";
});

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

exportCsvBtn.addEventListener("click", exportCsv);

renderEventFeed();
refreshDashboard();
renderChart();
startSimulation();