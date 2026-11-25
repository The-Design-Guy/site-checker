// GET /api/pagespeed?url=…&strategy=mobile|desktop — Google PageSpeed with the server's key.
const { authed, send } = require("./_lib");

const BASE = process.env.PAGESPEED_BASE_URL || "https://www.googleapis.com";

module.exports = async (req, res) => {
  if (!process.env.APP_PASSWORD) return send(res, 503, { error: { message: "APP_PASSWORD is not set on the server" } });
  if (!authed(req)) return send(res, 401, { error: { message: "wrong password" } });
  const q = new URL(req.url, "http://x").searchParams;
  const url = q.get("url") || "", strategy = q.get("strategy") === "desktop" ? "desktop" : "mobile";
  if (!/^https?:\/\//i.test(url)) return send(res, 400, { error: { message: "url must start with http(s)://" } });
  const key = process.env.PAGESPEED_API_KEY;
  const target = BASE + "/pagespeedonline/v5/runPagespeed?url=" + encodeURIComponent(url) + "&strategy=" + strategy + "&category=PERFORMANCE" + (key ? "&key=" + encodeURIComponent(key) : "");
  try {
    const up = await fetch(target);
    const text = await up.text();
    res.statusCode = up.status;
    res.setHeader("content-type", "application/json; charset=utf-8");
    res.setHeader("cache-control", "no-store");
    res.end(text);
  } catch (e) {
    send(res, 502, { error: { message: "could not reach Google" } });
  }
};
