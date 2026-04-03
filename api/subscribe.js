// Entre_Steph Lead Magnet Opt-In Handler
// 1. Adds subscriber to Turso (schedules follow-up sequence)
// 2. Adds to Kit (subscriber list)
// 3. Sends instant delivery email via steph@entresteph.com SMTP

const https = require('https');
const nodemailer = require('nodemailer');

const KIT_TAG_ID = '18738594'; // entre-steph-free-optin
const PDF_DOWNLOAD_URL = 'https://drive.google.com/uc?id=1hQgsbtUUJRlUwNK_WNXe0oP3AvkOeZIM&export=download';
const TURSO_URL = process.env.TURSO_URL;
const TURSO_TOKEN = process.env.TURSO_TOKEN;

function request(method, url, data, headers = {}) {
  return new Promise((resolve, reject) => {
    const body = data ? JSON.stringify(data) : null;
    const u = new URL(url);
    const opts = {
      hostname: u.hostname,
      path: u.pathname + u.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(body ? { 'Content-Length': Buffer.byteLength(body) } : {}),
        ...headers
      }
    };
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(d) }); }
        catch(e) { resolve({ status: res.statusCode, body: d }); }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function addToTurso(firstName, email) {
  const now = Math.floor(Date.now() / 1000);
  const nextSendAt = now + 86400; // Day 2 email in 24 hours
  return request('POST', TURSO_URL, {
    requests: [
      {
        type: 'execute',
        stmt: {
          sql: 'INSERT OR IGNORE INTO entresteph_subscribers (email, first_name, subscribed_at, next_email, next_send_at) VALUES (?, ?, ?, 2, ?)',
          args: [
            { type: 'text', value: email },
            { type: 'text', value: firstName },
            { type: 'integer', value: String(now) },
            { type: 'integer', value: String(nextSendAt) }
          ]
        }
      },
      { type: 'close' }
    ]
  }, { Authorization: `Bearer ${TURSO_TOKEN}` });
}

async function addToKit(firstName, email) {
  const API_KEY = process.env.KIT_API_KEY;
  // Subscribe to tag — creates subscriber + applies tag in one call
  const res = await request(
    'POST',
    `https://api.convertkit.com/v3/tags/${KIT_TAG_ID}/subscribe`,
    { api_key: API_KEY, first_name: firstName, email }
  );
  return res;
}

function getSmtpTransport() {
  return nodemailer.createTransport({
    host: 'mail.privateemail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'steph@entresteph.com',
      pass: process.env.ENTRESTEPH_SMTP_PASS
    },
    dkim: {
      domainName: 'entresteph.com',
      keySelector: 'default',
      privateKey: process.env.DKIM_PRIVATE_KEY
    }
  });
}

async function sendDeliveryEmail(firstName, email) {
  const subject = `Your 30-Minute AI Workday Cheatsheet is here, ${firstName}!`;
  const html = `
<div style="font-family:'Georgia',serif;max-width:580px;margin:0 auto;padding:40px 32px;color:#222;background:#fff;">
  <p style="font-size:13px;letter-spacing:0.15em;text-transform:uppercase;color:#C9A84C;font-family:'Arial',sans-serif;margin-bottom:28px;">ENTRE_STEPH</p>

  <p style="font-size:17px;line-height:1.7;margin-bottom:20px;">Hey ${firstName},</p>

  <p style="font-size:17px;line-height:1.7;margin-bottom:20px;">Your free cheatsheet is ready. Here it is:</p>

  <div style="text-align:center;margin:36px 0;">
    <a href="${PDF_DOWNLOAD_URL}" style="display:inline-block;background:#B91C1C;color:#fff;padding:16px 36px;font-family:'Arial',sans-serif;font-size:15px;font-weight:600;text-decoration:none;letter-spacing:0.05em;">
      Download Your Cheatsheet &rarr;
    </a>
  </div>

  <p style="font-size:17px;line-height:1.7;margin-bottom:20px;">Save this email — that link is permanent, so you can come back anytime.</p>

  <p style="font-size:17px;line-height:1.7;margin-bottom:20px;">Inside you'll find the 3 tasks I use to run my entire content system in 30 minutes a day — including the copy-paste AI prompts for each one. Start with Task 1 and see how different it feels to show up online without the overwhelm.</p>

  <p style="font-size:17px;line-height:1.7;margin-bottom:20px;">I'll be in your inbox over the next few days with more on building a real AI-powered business system — even if you're working with stolen pockets of time.</p>

  <p style="font-size:17px;line-height:1.7;margin-bottom:32px;">Talk soon,<br>Steph<br><span style="font-size:14px;color:#888;">Entre_Steph</span></p>

  <hr style="border:none;border-top:1px solid #eee;margin:32px 0;">
  <p style="font-size:12px;color:#aaa;line-height:1.7;font-family:'Arial',sans-serif;">
    You're receiving this because you requested the 30-Minute AI Workday Cheatsheet at entresteph.com.<br>
    To unsubscribe, reply with "unsubscribe" in the subject line.
  </p>
</div>`;

  const transport = getSmtpTransport();
  return transport.sendMail({
    from: 'Steph | Entre_Steph <steph@entresteph.com>',
    to: email,
    subject,
    html
  });
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { firstName, email } = req.body || {};

  if (!firstName || !email) {
    return res.status(400).json({ error: 'First name and email required' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  const first = firstName.trim();
  const addr  = email.trim().toLowerCase();

  try {
    // 1. Add to Turso (schedules follow-up sequence)
    await addToTurso(first, addr).catch(e => console.error('Turso error:', e.message));

    // 2. Add to Kit (subscriber list reference)
    const kitResult = await addToKit(first, addr);
    if (kitResult.status >= 400) {
      console.error('Kit error:', kitResult.body);
    }

    // 3. Send instant delivery email via steph@entresteph.com
    await sendDeliveryEmail(first, addr);

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Subscribe error:', err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
};
