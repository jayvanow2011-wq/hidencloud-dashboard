export interface Stat {
  label: string;
  value: string | number;
  delta: string;
}

export interface Client {
  id: number;
  name: string;
  plan: string;
  status: "active" | "suspended";
  nodes: number;
}

export interface StatsResponse {
  ok: boolean;
  stats: Stat[];
  clients: Client[];
}

export type TabId = "dashboard" | "clients" | "builder";
