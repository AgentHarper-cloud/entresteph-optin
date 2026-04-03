// Entre_Steph Lead Magnet Opt-In Handler
// MailerLite automation handles delivery email automatically

const https = require('https');
const MAILERLITE_GROUP_ID = '183318656710608466';

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
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { firstName, email } = req.body || {};
  if (!firstName || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Valid name and email required' });
  }

  try {
    const r = await request('POST', 'https://connect.mailerlite.com/api/subscribers', {
      email: email.trim().toLowerCase(),
      fields: { name: firstName.trim() },
      groups: [MAILERLITE_GROUP_ID],
      status: 'active'
    }, { Authorization: `Bearer ${process.env.MAILERLITE_API_KEY}`, Accept: 'application/json' });

    if (r.status >= 400 && r.status !== 409) {
      console.error('ML error:', r.status, r.body);
      return res.status(500).json({ error: 'Could not subscribe' });
    }
    return res.status(200).json({ success: true });
  } catch(err) {
    console.error('Subscribe error:', err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
};
