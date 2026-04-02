const https = require('https');

function request(method, url, data, headers = {}) {
  return new Promise((resolve, reject) => {
    const body = data ? JSON.stringify(data) : null;
    const u = new URL(url);
    const opts = {
      hostname: u.hostname, path: u.pathname + u.search, method,
      headers: { 'Content-Type': 'application/json', ...(body ? { 'Content-Length': Buffer.byteLength(body) } : {}), ...headers }
    };
    const req = https.request(opts, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => { try { resolve({ status: res.statusCode, body: JSON.parse(d) }); } catch(e) { resolve({ status: res.statusCode, body: d }); } });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

module.exports = async function handler(req, res) {
  const email = req.query.email;
  if (!email) return res.status(400).send('Missing email');

  try {
    const ML_KEY = process.env.MAILERLITE_API_KEY;
    // Find subscriber and unsubscribe
    const find = await request('GET', `https://connect.mailerlite.com/api/subscribers/${encodeURIComponent(email)}`, null, {
      Authorization: `Bearer ${ML_KEY}`, Accept: 'application/json'
    });
    if (find.status === 200 && find.body.data?.id) {
      await request('DELETE', `https://connect.mailerlite.com/api/subscribers/${find.body.data.id}`, null, {
        Authorization: `Bearer ${ML_KEY}`, Accept: 'application/json'
      });
    }
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(`<!DOCTYPE html><html><head><title>Unsubscribed</title><style>body{font-family:Arial,sans-serif;background:#111;color:#fff;display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center;}</style></head><body><div><h2>You've been unsubscribed.</h2><p style="color:#888;margin-top:12px;">You won't receive any more emails from Entre_Steph.</p></div></body></html>`);
  } catch(err) {
    return res.status(500).send('Error processing request');
  }
};
