import type { StatsResponse } from "./types.js";

async function post<T>(url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });
  const data = (await res.json()) as T & { error?: string };
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export const api = {
  async me(): Promise<boolean> {
    const res = await fetch("/api/me");
    return res.ok;
  },
  login(username: string, password: string) {
    return post<{ ok: true; user: string }>("/api/login", { username, password });
  },
  logout() {
    return post<{ ok: true }>("/api/logout");
  },
  async stats(): Promise<StatsResponse> {
    const res = await fetch("/api/stats");
    if (!res.ok) throw new Error("Not authorized");
    return (await res.json()) as StatsResponse;
  },
};
