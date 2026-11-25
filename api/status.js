// GET /api/status — is the server set up, and is this browser's password right?
const { authed, send } = require("./_lib");

module.exports = async (req, res) => {
  if (!process.env.APP_PASSWORD) return send(res, 200, { ok: true, configured: false, auth: false });
  const ok = authed(req);
  send(res, 200, {
    ok: true,
    configured: true,
    auth: ok,
    claude: ok ? !!process.env.ANTHROPIC_API_KEY : undefined,
    psi: ok ? !!process.env.PAGESPEED_API_KEY : undefined,
  });
};
