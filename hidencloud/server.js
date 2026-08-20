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

app.get("/api/stats", (req, res) => {
  if (!isAuthed(req)) return res.status(401).json({ ok: false });
  res.json({
    ok: true,
    stats: [
      { label: "Active servers", value: 12, delta: "+2 this week" },
      { label: "Clients", value: 34, delta: "+5 this month" },
      { label: "CPU load", value: "38%", delta: "stable" },
      { label: "Monthly revenue", value: "€1,420", delta: "+8.4%" },
    ],
    clients: [
      { id: 1, name: "Nova Studios", plan: "Pro", status: "active", nodes: 3 },
      { id: 2, name: "PixelForge", plan: "Starter", status: "active", nodes: 1 },
      { id: 3, name: "Orbit Games", plan: "Enterprise", status: "suspended", nodes: 8 },
      { id: 4, name: "Kite Labs", plan: "Pro", status: "active", nodes: 2 },
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
