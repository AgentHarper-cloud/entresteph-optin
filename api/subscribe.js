// Entre_Steph Lead Magnet Opt-In Handler
// 1. Subscribes to MailerLite (Free Opt-In Leads group)
// 2. Sends delivery email via Gmail OAuth

const https = require('https');

const MAILERLITE_GROUP_ID = '183318656710608466';
const PDF_VIEW_URL = 'https://drive.google.com/file/d/1hQgsbtUUJRlUwNK_WNXe0oP3AvkOeZIM/view';
const PDF_DOWNLOAD_URL = 'https://drive.google.com/uc?id=1hQgsbtUUJRlUwNK_WNXe0oP3AvkOeZIM&export=download';

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

async function addToMailerLite(firstName, email) {
  const ML_KEY = process.env.MAILERLITE_API_KEY;
  // Upsert subscriber
  const sub = await request('POST', 'https://connect.mailerlite.com/api/subscribers', {
    email,
    fields: { name: firstName },
    groups: [MAILERLITE_GROUP_ID],
    status: 'active'
  }, {
    Authorization: `Bearer ${ML_KEY}`,
    Accept: 'application/json'
  });
  return sub;
}

async function getGmailToken() {
  const r = await request('POST', 'https://oauth2.googleapis.com/token', {
    client_id: process.env.GMAIL_CLIENT_ID,
    client_secret: process.env.GMAIL_CLIENT_SECRET,
    refresh_token: process.env.GMAIL_REFRESH_TOKEN,
    grant_type: 'refresh_token'
  });
  return r.body.access_token;
}

async function sendDeliveryEmail(firstName, email, token) {
  const subject = `Your 30-Minute AI Workday Cheatsheet is here, ${firstName}!`;
  const html = `
<div style="font-family:'Georgia',serif;max-width:580px;margin:0 auto;padding:40px 32px;color:#222;background:#fff;">
  <p style="font-size:13px;letter-spacing:0.15em;text-transform:uppercase;color:#C9A84C;font-family:'Arial',sans-serif;margin-bottom:28px;">ENTRE_STEPH</p>

  <p style="font-size:17px;line-height:1.7;margin-bottom:20px;">Hey ${firstName},</p>

  <p style="font-size:17px;line-height:1.7;margin-bottom:20px;">Your free cheatsheet is ready. Here it is:</p>

  <div style="text-align:center;margin:36px 0;">
    <a href="${PDF_DOWNLOAD_URL}" style="display:inline-block;background:#B91C1C;color:#fff;padding:16px 36px;font-family:'Arial',sans-serif;font-size:15px;font-weight:600;text-decoration:none;letter-spacing:0.05em;">
      Download Your Cheatsheet →
    </a>
  </div>

  <p style="font-size:17px;line-height:1.7;margin-bottom:20px;">Save this email — that link is permanent, so you can come back anytime.</p>

  <p style="font-size:17px;line-height:1.7;margin-bottom:20px;">Inside you'll find the 3 tasks I use to run my entire content system in 30 minutes a day — including the copy-paste AI prompts for each one. Start with Task 1 and see how different it feels to show up online without the overwhelm.</p>

  <p style="font-size:17px;line-height:1.7;margin-bottom:20px;">I'll be in your inbox over the next few days with more on building a real AI-powered business system — even if you're working with stolen pockets of time.</p>

  <p style="font-size:17px;line-height:1.7;margin-bottom:32px;">Talk soon,<br>Steph<br><span style="font-size:14px;color:#888;">Entre_Steph</span></p>

  <hr style="border:none;border-top:1px solid #eee;margin:32px 0;">

  <p style="font-size:12px;color:#aaa;line-height:1.7;font-family:'Arial',sans-serif;">
    You're receiving this because you requested the 30-Minute AI Workday Cheatsheet at entresteph.com.<br>
    <a href="https://entresteph-optin.vercel.app/api/unsubscribe?email=${encodeURIComponent(email)}" style="color:#aaa;">Unsubscribe</a>
  </p>
</div>`;

  const msg = [
    `From: Steph | Entre_Steph <AgentHarper@thedateprofiler.com>`,
    `To: ${email}`,
    `Subject: ${subject}`,
    `Content-Type: text/html; charset=utf-8`,
    ``,
    html
  ].join('\r\n');

  const raw = Buffer.from(msg).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  return request('POST', 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
    { raw },
    { Authorization: `Bearer ${token}` }
  );
}

module.exports = async function handler(req, res) {
  // CORS
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

  try {
    // 1. Add to MailerLite
    const mlResult = await addToMailerLite(firstName.trim(), email.trim().toLowerCase());
    if (mlResult.status >= 400 && mlResult.status !== 409) {
      console.error('MailerLite error:', mlResult.body);
      // Don't fail the whole request — still send email
    }

    // 2. Send delivery email
    const token = await getGmailToken();
    await sendDeliveryEmail(firstName.trim(), email.trim(), token);

    return res.status(200).json({ success: true });
  } catch(err) {
    console.error('Subscribe error:', err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
};
