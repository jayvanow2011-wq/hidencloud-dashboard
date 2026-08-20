export function renderClients(data) {
    const rows = data.clients
        .map((c) => `
        <tr>
          <td>#${c.id}</td>
          <td>${c.name}</td>
          <td>${c.plan}</td>
          <td>${c.nodes}</td>
          <td><span class="badge ${c.status}">${c.status}</span></td>
        </tr>`)
        .join("");
    return `
    <h1>Clients</h1>
    <p class="page-sub">${data.clients.length} accounts connected to your panel.</p>
    <div class="card">
      <table>
        <thead>
          <tr><th>ID</th><th>Name</th><th>Plan</th><th>Nodes</th><th>Status</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}
