const path = require("path");
const crypto = require("crypto");
const express = require("express");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = process.env.PORT || 3000;

const USERNAME = process.env.PANEL_USER || "jayjay";
const PASSWORD = process.env.PANEL_PASS || "jayjay100!";

// In-memory sessions (restart clears them)
const sessions = new Map();

function safeEqual(a, b) {
  const ab = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

function isAuthed(req) {
  const sid = req.cookies && req.cookies.hc_session;
  return Boolean(sid && sessions.has(sid));
}

app.use(express.json());
app.use(cookieParser());

app.post("/api/login", (req, res) => {
  const { username = "", password = "" } = req.body || {};
  if (!safeEqual(username, USERNAME) || !safeEqual(password, PASSWORD)) {
    return res.status(401).json({ ok: false, error: "Invalid credentials" });
  }
  const sid = crypto.randomBytes(24).toString("hex");
  sessions.set(sid, { user: USERNAME, at: Date.now() });
  res.cookie("hc_session", sid, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 60 * 12,
  });
  res.json({ ok: true, user: USERNAME });
});

app.post("/api/logout", (req, res) => {
  const sid = req.cookies && req.cookies.hc_session;
  if (sid) sessions.delete(sid);
  res.clearCookie("hc_session");
  res.json({ ok: true });
});

app.get("/api/me", (req, res) => {
  if (!isAuthed(req)) return res.status(401).json({ ok: false });
  res.json({ ok: true, user: USERNAME });
});

const CLIENTS = [
  {
    id: "HC-9F21A",
    name: "DESKTOP-JAY",
    user: "jay",
    os: "Windows 11 Pro",
    ip: "192.168.1.42",
    country: "Sweden",
    status: "online",
    lastSeen: "just now",
    cpu: "Intel i7-13700K",
    ram: "32 GB",
    uptime: "3h 12m",
  },
];

app.get("/api/stats", (req, res) => {
  if (!isAuthed(req)) return res.status(401).json({ ok: false });
  const online = CLIENTS.filter((c) => c.status === "online").length;
  const offline = CLIENTS.length - online;
  res.json({
    ok: true,
    analytics: {
      total: CLIENTS.length,
      online,
      offline,
      idle: 0,
      countries: 1,
      newToday: 1,
      commandsSent: 42,
      screensCaptured: 7,
    },
    clients: CLIENTS,
  });
});

app.get("/api/client/:id", (req, res) => {
  if (!isAuthed(req)) return res.status(401).json({ ok: false });
  const client = CLIENTS.find((c) => c.id === req.params.id);
  if (!client) return res.status(404).json({ ok: false });
  res.json({
    ok: true,
    client,
    files: [
      { name: "Desktop", type: "folder", size: "-" },
      { name: "Documents", type: "folder", size: "-" },
      { name: "Downloads", type: "folder", size: "-" },
      { name: "passwords.txt", type: "file", size: "2 KB" },
      { name: "screenshot.png", type: "file", size: "412 KB" },
      { name: "notes.docx", type: "file", size: "18 KB" },
    ],
  });
});

app.use(express.static(path.join(__dirname, "public")));

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`HidenCloud panel running on http://localhost:${PORT}`);
});
