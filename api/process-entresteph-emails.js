// Entre_Steph Follow-Up Email Cron
// Runs daily — sends Day 2, Day 4, Day 6 emails to subscribers

const https = require('https');

const TURSO_URL = process.env.TURSO_URL;
const TURSO_TOKEN = process.env.TURSO_TOKEN;
const PDF_DOWNLOAD_URL = 'https://drive.google.com/uc?id=1hQgsbtUUJRlUwNK_WNXe0oP3AvkOeZIM&export=download';
const AFFILIATE_URL = 'https://aimonetizationslive.com/?am_id=stephanie9937';

// ─── Email Copy ───────────────────────────────────────────────────────────────

function getEmail(emailNum, firstName) {
  const emails = {
    2: {
      subject: `Did you try it yet?`,
      html: `
<div style="font-family:'Georgia',serif;max-width:580px;margin:0 auto;padding:40px 32px;color:#222;background:#fff;">
  <p style="font-size:13px;letter-spacing:0.15em;text-transform:uppercase;color:#C9A84C;font-family:'Arial',sans-serif;margin-bottom:28px;">ENTRE_STEPH</p>

  <p style="font-size:17px;line-height:1.7;margin-bottom:20px;">Hey ${firstName},</p>

  <p style="font-size:17px;line-height:1.7;margin-bottom:20px;">Just checking in. Did you get a chance to open the cheatsheet?</p>

  <p style="font-size:17px;line-height:1.7;margin-bottom:20px;">Task 1 is the one I'd start with. It takes about 8 minutes and the AI prompt does most of the heavy lifting. Most people who try it end up doing all three tasks that same day because it goes faster than they expect.</p>

  <p style="font-size:17px;line-height:1.7;margin-bottom:20px;">If you haven't downloaded it yet, here it is again:</p>

  <div style="text-align:center;margin:32px 0;">
    <a href="${PDF_DOWNLOAD_URL}" style="display:inline-block;background:#B91C1C;color:#fff;padding:14px 32px;font-family:'Arial',sans-serif;font-size:15px;font-weight:600;text-decoration:none;letter-spacing:0.05em;">
      Download Your Cheatsheet &rarr;
    </a>
  </div>

  <p style="font-size:17px;line-height:1.7;margin-bottom:32px;">Let me know how it goes. I read every reply.</p>

  <p style="font-size:17px;line-height:1.7;margin-bottom:32px;">Talk soon,<br>Steph<br><span style="font-size:14px;color:#888;">Entre_Steph</span></p>

  <hr style="border:none;border-top:1px solid #eee;margin:32px 0;">
  <p style="font-size:12px;color:#aaa;line-height:1.7;font-family:'Arial',sans-serif;">
    You're receiving this because you requested the 30-Minute AI Workday Cheatsheet at entresteph.com.<br>
    To unsubscribe, reply with "unsubscribe" in the subject line.
  </p>
</div>`
    },

    3: {
      subject: `Something I think you'll find useful`,
      html: `
<div style="font-family:'Georgia',serif;max-width:580px;margin:0 auto;padding:40px 32px;color:#222;background:#fff;">
  <p style="font-size:13px;letter-spacing:0.15em;text-transform:uppercase;color:#C9A84C;font-family:'Arial',sans-serif;margin-bottom:28px;">ENTRE_STEPH</p>

  <p style="font-size:17px;line-height:1.7;margin-bottom:20px;">Hey ${firstName},</p>

  <p style="font-size:17px;line-height:1.7;margin-bottom:20px;">Since you grabbed the cheatsheet, I'm guessing you're serious about using AI to actually simplify your workday, not just play with it.</p>

  <p style="font-size:17px;line-height:1.7;margin-bottom:20px;">I came across a free live workshop from someone named Joseph Aaron. He teaches how to build an income stream using AI tools, specifically for people who don't have a big following or a lot of time.</p>

  <p style="font-size:17px;line-height:1.7;margin-bottom:20px;">I thought of you immediately.</p>

  <div style="text-align:center;margin:32px 0;">
    <a href="${AFFILIATE_URL}" style="display:inline-block;background:#B91C1C;color:#fff;padding:14px 32px;font-family:'Arial',sans-serif;font-size:15px;font-weight:600;text-decoration:none;letter-spacing:0.05em;">
      Save Your Free Seat &rarr;
    </a>
  </div>

  <p style="font-size:14px;line-height:1.7;color:#888;margin-bottom:32px;font-family:'Arial',sans-serif;font-style:italic;">Note: This is an affiliate link. I may earn a commission if you purchase anything after the workshop. I only share things I'd actually recommend.</p>

  <p style="font-size:17px;line-height:1.7;margin-bottom:32px;">Talk soon,<br>Steph<br><span style="font-size:14px;color:#888;">Entre_Steph</span></p>

  <hr style="border:none;border-top:1px solid #eee;margin:32px 0;">
  <p style="font-size:12px;color:#aaa;line-height:1.7;font-family:'Arial',sans-serif;">
    You're receiving this because you requested the 30-Minute AI Workday Cheatsheet at entresteph.com.<br>
    To unsubscribe, reply with "unsubscribe" in the subject line.
  </p>
</div>`
    },

    4: {
      subject: `Last reminder — free workshop`,
      html: `
<div style="font-family:'Georgia',serif;max-width:580px;margin:0 auto;padding:40px 32px;color:#222;background:#fff;">
  <p style="font-size:13px;letter-spacing:0.15em;text-transform:uppercase;color:#C9A84C;font-family:'Arial',sans-serif;margin-bottom:28px;">ENTRE_STEPH</p>

  <p style="font-size:17px;line-height:1.7;margin-bottom:20px;">Hey ${firstName},</p>

  <p style="font-size:17px;line-height:1.7;margin-bottom:20px;">Just a quick heads up — the free AI workshop I mentioned is coming up soon and I didn't want you to miss it if it's been on your mind.</p>

  <p style="font-size:17px;line-height:1.7;margin-bottom:20px;">No hype here. Just a solid look at how AI tools can help you build something real, even with a packed schedule and stolen pockets of time.</p>

  <p style="font-size:17px;line-height:1.7;margin-bottom:20px;">This is the last time I'll mention it.</p>

  <div style="text-align:center;margin:32px 0;">
    <a href="${AFFILIATE_URL}" style="display:inline-block;background:#B91C1C;color:#fff;padding:14px 32px;font-family:'Arial',sans-serif;font-size:15px;font-weight:600;text-decoration:none;letter-spacing:0.05em;">
      Grab Your Free Seat &rarr;
    </a>
  </div>

  <p style="font-size:14px;line-height:1.7;color:#888;margin-bottom:32px;font-family:'Arial',sans-serif;font-style:italic;">Affiliate link — I may earn a commission at no cost to you.</p>

  <p style="font-size:17px;line-height:1.7;margin-bottom:32px;">Talk soon,<br>Steph<br><span style="font-size:14px;color:#888;">Entre_Steph</span></p>

  <hr style="border:none;border-top:1px solid #eee;margin:32px 0;">
  <p style="font-size:12px;color:#aaa;line-height:1.7;font-family:'Arial',sans-serif;">
    You're receiving this because you requested the 30-Minute AI Workday Cheatsheet at entresteph.com.<br>
    To unsubscribe, reply with "unsubscribe" in the subject line.
  </p>
</div>`
    }
  };

  return emails[emailNum] || null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function turso(sql, args = []) {
  return request('POST', TURSO_URL, {
    requests: [
      { type: 'execute', stmt: { sql, args } },
      { type: 'close' }
    ]
  }, { Authorization: `Bearer ${TURSO_TOKEN}` });
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

async function sendEmail(toEmail, firstName, emailNum, gmailToken) {
  const content = getEmail(emailNum, firstName);
  if (!content) return;

  const msg = [
    `From: Steph | Entre_Steph <AgentHarper@thedateprofiler.com>`,
    `To: ${toEmail}`,
    `Subject: ${content.subject}`,
    `Content-Type: text/html; charset=utf-8`,
    ``,
    content.html
  ].join('\r\n');

  const raw = Buffer.from(msg).toString('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  return request('POST',
    'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
    { raw },
    { Authorization: `Bearer ${gmailToken}` }
  );
}

// ─── Main Handler ─────────────────────────────────────────────────────────────

module.exports = async function handler(req, res) {
  // Allow manual trigger via GET (for testing) or cron via GET
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const now = Math.floor(Date.now() / 1000);

  try {
    // Get subscribers due for their next email
    const result = await turso(
      'SELECT id, email, first_name, next_email FROM entresteph_subscribers WHERE completed = 0 AND next_send_at <= ? AND next_email <= 4',
      [{ type: 'integer', value: String(now) }]
    );

    const rows = result?.body?.results?.[0]?.response?.result?.rows || [];
    console.log(`Entre_Steph cron: ${rows.length} subscribers to process`);

    if (rows.length === 0) {
      return res.status(200).json({ sent: 0, message: 'No emails due' });
    }

    const gmailToken = await getGmailToken();
    let sent = 0;
    const errors = [];

    for (const row of rows) {
      const [id, email, firstName, nextEmail] = [
        row[0]?.value, row[1]?.value, row[2]?.value, parseInt(row[3]?.value)
      ];

      try {
        await sendEmail(email, firstName || 'friend', nextEmail, gmailToken);

        // Advance to next email or mark complete
        if (nextEmail >= 4) {
          await turso(
            'UPDATE entresteph_subscribers SET completed = 1 WHERE id = ?',
            [{ type: 'integer', value: String(id) }]
          );
        } else {
          const delay = nextEmail === 2 ? 172800 : 172800; // +2 days each step
          await turso(
            'UPDATE entresteph_subscribers SET next_email = ?, next_send_at = ? WHERE id = ?',
            [
              { type: 'integer', value: String(nextEmail + 1) },
              { type: 'integer', value: String(now + delay) },
              { type: 'integer', value: String(id) }
            ]
          );
        }
        sent++;
      } catch (err) {
        console.error(`Failed for ${email}:`, err.message);
        errors.push(email);
      }
    }

    return res.status(200).json({ sent, errors, total: rows.length });
  } catch (err) {
    console.error('Cron error:', err);
    return res.status(500).json({ error: err.message });
  }
};
