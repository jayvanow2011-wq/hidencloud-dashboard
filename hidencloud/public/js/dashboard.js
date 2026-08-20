export function renderDashboard(data) {
    const cards = data.stats
        .map((s) => `
        <div class="card">
          <div class="label">${s.label}</div>
          <div class="value">${s.value}</div>
          <div class="delta">${s.delta}</div>
        </div>`)
        .join("");
    const activity = [
        "Node fra-01 restarted successfully",
        "New client PixelForge provisioned",
        "Backup completed for Orbit Games",
        "Plan upgraded: Kite Labs → Pro",
    ]
        .map((a) => `<div class="summary-row"><span>${a}</span><span>just now</span></div>`)
        .join("");
    return `
    <h1>Dashboard</h1>
    <p class="page-sub">Overview of your HidenCloud infrastructure.</p>
    <div class="grid">${cards}</div>
    <h2>Recent activity</h2>
    <div class="card">${activity}</div>
  `;
}
