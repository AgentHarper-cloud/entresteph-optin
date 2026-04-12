// Entre_Steph Follow-Up Email Cron
// Runs daily — sends Emails 2–7 (Days 2, 3, 5, 7, 9, 11)
// Email 1 (Day 0) is sent immediately by subscribe.js

const https = require('https');
const nodemailer = require('nodemailer');

const TURSO_URL  = process.env.TURSO_URL;
const TURSO_TOKEN = process.env.TURSO_TOKEN;

const CHEATSHEET_URL = 'https://drive.google.com/file/d/1hQgsbtUUJRlUwNK_WNXe0oP3AvkOeZIM/view?usp=sharing';
const TRAINING_URL   = 'https://training.entresteph.com';
const TRIAL_URL      = 'https://trial.entresteph.com';
const MONTHLY_URL    = 'https://monthly.entresteph.com';
const AFFILIATE_URL  = 'https://aimonetizationslive.com/?am_id=stephanie9937';

// ─── Delay after each email (seconds until next email is sent) ────────────────
// Email 2 sent → wait 1 day  → Email 3 on Day 3
// Email 3 sent → wait 2 days → Email 4 on Day 5
// Email 4 sent → wait 2 days → Email 5 on Day 7
// Email 5 sent → wait 2 days → Email 6 on Day 9
// Email 6 sent → wait 2 days → Email 7 on Day 11
// Email 7 sent → sequence complete
const DELAY_AFTER = {
  2: 86400,    // 1 day
  3: 172800,   // 2 days
  4: 172800,
  5: 172800,
  6: 172800,
  7: null      // complete
};

// ─── Email Content ────────────────────────────────────────────────────────────

function emailHtml(body) {
  return `
<div style="font-family:'Georgia',serif;max-width:580px;margin:0 auto;padding:40px 32px;color:#222;background:#fff;">
  <p style="font-size:13px;letter-spacing:0.15em;text-transform:uppercase;color:#C9A84C;font-family:'Arial',sans-serif;margin-bottom:28px;">ENTRE_STEPH</p>
  ${body}
  <hr style="border:none;border-top:1px solid #eee;margin:32px 0;">
  <p style="font-size:12px;color:#aaa;line-height:1.7;font-family:'Arial',sans-serif;">
    You're receiving this because you requested the 30-Minute AI Workday Cheatsheet at entresteph.com.<br>
    To unsubscribe, <a href="https://free.entresteph.com/api/unsubscribe?email={{EMAIL}}" style="color:#aaa;">click here</a>.
  </p>
</div>`;
}

function p(text) {
  return `<p style="font-size:17px;line-height:1.7;margin-bottom:20px;">${text}</p>`;
}

function btn(text, url) {
  return `<div style="text-align:center;margin:32px 0;">
    <a href="${url}" style="display:inline-block;background:#C8230F;color:#fff;padding:14px 32px;font-family:'Arial',sans-serif;font-size:15px;font-weight:600;text-decoration:none;letter-spacing:0.05em;">${text} &rarr;</a>
  </div>`;
}

function sig() {
  return `<p style="font-size:17px;line-height:1.7;margin-bottom:8px;">Talk soon,<br>Steph<br><span style="font-size:14px;color:#888;">Entre_Steph</span></p>`;
}

function getEmail(num, firstName, email) {
  const name = firstName || 'friend';

  const emails = {

    // ── Email 2 — Day 2 — Check-in ─────────────────────────────────────────
    2: {
      subject: `Did you try it yet?`,
      html: emailHtml(`
        ${p(`Hey ${name},`)}
        ${p(`Just checking in. Did you get a chance to open the cheatsheet?`)}
        ${p(`I know how it goes. You download something, life happens, and it sits in your inbox for a week.`)}
        ${p(`So I wanted to nudge you. Pick one of the three prompts from the cheatsheet and try it today. Copy and paste it into ChatGPT or Claude and see what comes back.`)}
        ${p(`It takes 5 minutes. And it might change how you think about running your business in stolen time.`)}
        ${btn('Download Your Cheatsheet', CHEATSHEET_URL)}
        ${p(`Reply and let me know what you think. I read every response.`)}
        ${sig()}
      `).replace('{{EMAIL}}', encodeURIComponent(email))
    },

    // ── Email 3 — Day 3 — DIY Training Intro ──────────────────────────────
    3: {
      subject: `How I turn 1 video into 30 posts in 30 minutes`,
      html: emailHtml(`
        ${p(`Hey ${name},`)}
        ${p(`The cheatsheet gives you the prompts. But I wanted to show you exactly how I use AI for my own content, because what I've built goes a little deeper than that.`)}
        ${p(`Every month I take one piece of content and turn it into 30 posts. Hooks, captions, carousel concepts, reel scripts, all of it. In about 30 minutes. Using a simple AI system I built myself.`)}
        ${p(`I packaged the whole thing into a training so you can do it too.`)}
        ${p(`It's $15 and you can grab it here:`)}
        ${btn('Get the $15 Training', TRAINING_URL)}
        ${p(`Or if you'd rather see it live, I'm running a free workshop soon where I walk through the whole system on screen in real time. I'll send details when the date is confirmed.`)}
        ${p(`Either way, this is the system. And it works whether you have 30 minutes a day or 30 minutes a week.`)}
        ${sig()}
      `).replace('{{EMAIL}}', encodeURIComponent(email))
    },

    // ── Email 4 — Day 5 — Done For You Intro ──────────────────────────────
    4: {
      subject: `What if you didn't have to do it yourself?`,
      html: emailHtml(`
        ${p(`Hey ${name},`)}
        ${p(`The system I showed you in my last email works really well, if you have the time and headspace to run it yourself.`)}
        ${p(`But I know that's not everyone.`)}
        ${p(`Some days you just need it done. No prompts, no tweaking, no staring at a screen trying to figure out what to post. You need content ready to go so you can focus on actually running your business.`)}
        ${p(`That's exactly what I do for a handful of clients every month.`)}
        ${p(`I take your existing content, run it through my AI system, and deliver 14 reel scripts, 7 carousel concepts, and captions for everything in 48 hours. Done for you. Ready to post.`)}
        ${p(`It's called the 7-Day Content Trial and it's $45 to get started. No subscription. No commitment. Just 7 days of content so you can see exactly what it feels like to have this handled.`)}
        ${btn('Grab Your 7-Day Trial — $45', TRIAL_URL)}
        ${sig()}
      `).replace('{{EMAIL}}', encodeURIComponent(email))
    },

    // ── Email 5 — Day 7 — Content Machine Monthly ─────────────────────────
    5: {
      subject: `Ready to make this a system?`,
      html: emailHtml(`
        ${p(`Hey ${name},`)}
        ${p(`If you grabbed the trial this week, amazing. Your content is on its way.`)}
        ${p(`If you're still on the fence, I want to make this as simple as possible.`)}
        ${p(`The Content Machine is 30 days of done-for-you content every month. 60 reel scripts. 30 carousel concepts. Captions for everything. Scheduled and ready to post every single day.`)}
        ${p(`$99 a month. Cancel anytime.`)}
        ${p(`For most business owners that's less than what they spend on one dinner out, and it solves one of the biggest bottlenecks in their business.`)}
        ${p(`If you're ready to stop thinking about content and just have it handled:`)}
        ${btn('Start the Content Machine — $99/mo', MONTHLY_URL)}
        ${p(`Not ready for the full month yet? Start with the 7-day trial at $45 and see how it feels first:`)}
        ${btn('Try It for 7 Days — $45', TRIAL_URL)}
        ${p(`Either way, you've got options. Reply if you have questions.`)}
        ${sig()}
      `).replace('{{EMAIL}}', encodeURIComponent(email))
    },

    // ── Email 6 — Day 9 — Webinar Invite ──────────────────────────────────
    6: {
      subject: `Want to see what's possible with AI?`,
      html: emailHtml(`
        ${p(`Hey ${name},`)}
        ${p(`I want to show you something that stopped me in my tracks when I first saw it.`)}
        ${p(`My mentor Joseph Aaron sits down on a live screen share and builds a complete AI-powered business from scratch, offer, brand, lead generation system, in 60 minutes flat. While you watch.`)}
        ${p(`No slides. No theory. Just proof of what's possible.`)}
        ${p(`It's completely free and it's the reason I started building my own AI content system in the first place.`)}
        ${p(`If you're curious about what a full AI-powered business actually looks like, not just the content side but the whole thing:`)}
        ${btn('Watch the Free Workshop', AFFILIATE_URL)}
        <p style="font-size:13px;line-height:1.7;color:#999;margin-bottom:32px;font-family:'Arial',sans-serif;font-style:italic;">Disclosure: This is an affiliate link. If you decide to invest in Joseph's full system after the webinar, I may earn a commission at no extra cost to you. I only share things I genuinely believe in.</p>
        ${p(`See you there,`)}
        ${sig()}
      `).replace('{{EMAIL}}', encodeURIComponent(email))
    },

    // ── Email 7 — Day 11 — Final Webinar Reminder ─────────────────────────
    7: {
      subject: `Last chance to watch this live`,
      html: emailHtml(`
        ${p(`Hey ${name},`)}
        ${p(`Just a quick reminder. If you haven't watched Joseph build a complete AI business live on screen yet, this is your nudge.`)}
        ${p(`It's free. It's live. And it will completely change how you think about what's possible with AI.`)}
        ${btn('Watch the Free Workshop', AFFILIATE_URL)}
        <p style="font-size:13px;line-height:1.7;color:#999;margin-bottom:32px;font-family:'Arial',sans-serif;font-style:italic;">Affiliate link — I may earn a commission if you invest in Joseph's system after the webinar, at no cost to you.</p>
        ${sig()}
      `).replace('{{EMAIL}}', encodeURIComponent(email))
    }

  };

  return emails[num] || null;
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

async function sendEmail(toEmail, firstName, emailNum) {
  const content = getEmail(emailNum, firstName, toEmail);
  if (!content) return;
  const transport = getSmtpTransport();
  return transport.sendMail({
    from: 'Steph | Entre_Steph <steph@entresteph.com>',
    to: toEmail,
    subject: content.subject,
    html: content.html
  });
}

// ─── Main Handler ─────────────────────────────────────────────────────────────

module.exports = async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const now = Math.floor(Date.now() / 1000);

  try {
    const result = await turso(
      'SELECT id, email, first_name, next_email FROM entresteph_subscribers WHERE completed = 0 AND next_send_at <= ? AND next_email <= 7',
      [{ type: 'integer', value: String(now) }]
    );

    const rows = result?.body?.results?.[0]?.response?.result?.rows || [];
    console.log(`Entre_Steph cron: ${rows.length} subscribers due`);

    if (rows.length === 0) {
      return res.status(200).json({ sent: 0, message: 'No emails due' });
    }

    let sent = 0;
    const errors = [];

    for (const row of rows) {
      const [id, email, firstName, nextEmail] = [
        row[0]?.value, row[1]?.value, row[2]?.value, parseInt(row[3]?.value)
      ];

      try {
        await sendEmail(email, firstName || 'friend', nextEmail);

        const delay = DELAY_AFTER[nextEmail];

        if (!delay) {
          // Email 7 sent — mark complete
          await turso(
            'UPDATE entresteph_subscribers SET completed = 1 WHERE id = ?',
            [{ type: 'integer', value: String(id) }]
          );
        } else {
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
        console.log(`Sent email ${nextEmail} to ${email}`);
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
