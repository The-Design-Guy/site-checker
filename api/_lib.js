// Shared helpers for the API functions. Keys and the password live only in
// Vercel Environment Variables; nothing here is ever sent to the browser.
const crypto = require("crypto");

function sameSecret(a, b) {
  const h = (x) => crypto.createHash("sha256").update(String(x || "")).digest();
  return crypto.timingSafeEqual(h(a), h(b));
}

// Fails closed: with no APP_PASSWORD set, nothing is allowed through.
function authed(req) {
  const want = process.env.APP_PASSWORD;
  if (!want) return false;
  return sameSecret(req.headers["x-app-password"], want);
}

function send(res, status, obj) {
  res.statusCode = status;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.setHeader("cache-control", "no-store");
  res.end(JSON.stringify(obj));
}

// Works with Vercel's parsed req.body and with a raw stream.
async function readJSON(req) {
  if (req.body !== undefined && req.body !== null && req.body !== "") {
    if (typeof req.body === "object" && !Buffer.isBuffer(req.body)) return req.body;
    return JSON.parse(String(req.body));
  }
  const chunks = [];
  for await (const c of req) chunks.push(c);
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

module.exports = { authed, send, readJSON };
