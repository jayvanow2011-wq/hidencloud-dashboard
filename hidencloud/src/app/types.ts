export interface Analytics {
  total: number;
  online: number;
  offline: number;
  idle: number;
  countries: number;
  newToday: number;
  commandsSent: number;
  screensCaptured: number;
}

export interface Client {
  id: string;
  name: string;
  user: string;
  os: string;
  ip: string;
  country: string;
  status: "online" | "offline";
  lastSeen: string;
  cpu: string;
  ram: string;
  uptime: string;
}

export interface StatsResponse {
  ok: boolean;
  analytics: Analytics;
  clients: Client[];
}

export interface ClientFile {
  name: string;
  type: "folder" | "file";
  size: string;
}

export interface ClientDetailResponse {
  ok: boolean;
  client: Client;
  files: ClientFile[];
}

export type TabId = "dashboard" | "clients" | "builder";
