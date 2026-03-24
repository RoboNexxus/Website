// ════════════════════════════════════════════════════════════════════
//  CONFIG
// ════════════════════════════════════════════════════════════════════

const EVENT_DB_MAP = {
  'Robo War': { id: '723ea79c8931405e9342696f47b81e68', prefix: 'WAR' },
  'Robo Soccer': { id: '437ef7d538b54a158b46d0ac0308f369', prefix: 'SOC' },
  'Drone': { id: 'c5b196b2142749e9877bc41b6ada98b5', prefix: 'DRN' },
  'Line Follower': { id: 'fe308409369041c5b59f77dc1f2fcdc0', prefix: 'LFR' },
  'Race': { id: '5e0ede808c1b4d9284bc29abfc3e7000', prefix: 'RCE' },
};

const EVENT_EMOJI = {
  'Robo War': '⚔️',
  'Robo Soccer': '⚽',
  'Drone': '🚁',
  'Line Follower': '〰️',
  'Race': '🏁',
};

const EVENT_CAPS = {
  'Robo War': 100,
  'Robo Soccer': 100,
  'Drone': 100,
  'Line Follower': 100,
  'Race': 100,
};

// ════════════════════════════════════════════════════════════════════
//  EMAIL HTML BUILDER
// ════════════════════════════════════════════════════════════════════

function memberBlock(num, m) {
  if (!m?.name?.trim()) return '';
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
         style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:6px;margin-bottom:10px;">
    <tr>
      <td style="padding:8px 16px;border-bottom:1px solid rgba(255,255,255,0.06);">
        <span style="font-size:10px;font-weight:700;color:rgba(71,160,184,0.8);letter-spacing:2px;text-transform:uppercase;">
          Member ${num}
        </span>
      </td>
    </tr>
    <tr>
      <td style="padding:14px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="width:33%;vertical-align:top;padding-right:8px;">
              <p style="margin:0 0 3px 0;font-size:10px;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:0.8px;">Name</p>
              <p style="margin:0;font-size:13px;font-weight:600;color:rgba(255,255,255,0.8);">${m.name}</p>
            </td>
            <td style="width:33%;vertical-align:top;padding-right:8px;">
              <p style="margin:0 0 3px 0;font-size:10px;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:0.8px;">Discord</p>
              <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.8);font-family:'Courier New',Courier,monospace;">${m.discord || '—'}</p>
            </td>
            <td style="width:34%;vertical-align:top;">
              <p style="margin:0 0 3px 0;font-size:10px;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:0.8px;">Email</p>
              <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.8);">${m.email || '—'}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>`;
}

function detailRow(label, value, last = false) {
  if (!value) return '';
  const border = last ? '' : 'border-bottom:1px solid rgba(255,255,255,0.06);';
  return `
    <tr>
      <td style="padding:10px 0;${border}width:38%;vertical-align:top;">
        <span style="font-size:11px;font-weight:600;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:0.8px;">${label}</span>
      </td>
      <td style="padding:10px 0;${border}vertical-align:top;">
        <span style="font-size:14px;color:rgba(255,255,255,0.85);">${value}</span>
      </td>
    </tr>`;
}

function buildEmailHTML(data) {
  const {
    name, email, phone, discord, school,
    gradeCategory, participationType, teamName,
    teamSize, event, regId, members, registeredAt,
  } = data;

  const emoji = EVENT_EMOJI[event] || '🤖';
  const m2 = members?.[0] || {};
  const m3 = members?.[1] || {};
  const hasTeam = m2?.name?.trim() || m3?.name?.trim();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RoboNexus '26 — Registration Confirmed</title>
</head>
<body style="margin:0;padding:0;background:#000000;font-family:Arial,Helvetica,sans-serif;">

  <div style="display:none;max-height:0;overflow:hidden;color:#000000;font-size:1px;">
    Registration confirmed for RoboNexus '26 — ${event}. Your Reg ID: ${regId}
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#000000;">
    <tr>
      <td style="padding:30px 20px;">
        <table role="presentation" width="650" cellpadding="0" cellspacing="0" border="0"
               style="max-width:100%;margin:0 auto;background:#000000;">

          <tr>
            <td style="padding:0;margin:0;line-height:0;">
              <img src="https://raw.githubusercontent.com/RoboNexxus/Assets/main/particles-bg.gif"
                   alt="" width="650"
                   style="width:100%;height:100px;object-fit:cover;display:block;opacity:0.8;margin:0;padding:0;border:0;vertical-align:bottom;">
            </td>
          </tr>

          <tr>
            <td style="padding:36px 0 24px 0;text-align:center;background:#000000;">
              <img src="https://raw.githubusercontent.com/RoboNexxus/Assets/main/android-chrome-512x512.png"
                   alt="Robo Nexus" width="130"
                   style="width:130px;height:auto;display:block;margin:0 auto;">
            </td>
          </tr>

          <tr>
            <td style="padding:0 40px 30px 40px;text-align:center;background:#000000;">
              <h1 style="margin:0 0 6px 0;font-size:40px;font-weight:900;color:#ffffff;letter-spacing:1px;">
                RoboNexus '26
              </h1>
              <p style="margin:0;font-size:11px;font-weight:700;color:#47a0b8;letter-spacing:4px;text-transform:uppercase;">
                Registration Confirmed
              </p>
              <div style="width:50px;height:2px;background:#47a0b8;margin:14px auto 0 auto;"></div>
            </td>
          </tr>

          <tr>
            <td style="padding:32px 40px;background:rgba(8,8,8,0.97);color:#ffffff;font-size:15px;line-height:1.6;">

              <div style="display:inline-block;padding:5px 16px;background:rgba(71,160,184,0.12);border:1px solid rgba(71,160,184,0.45);border-radius:20px;margin-bottom:24px;">
                <p style="margin:0;color:#47a0b8;font-size:10px;text-transform:uppercase;letter-spacing:2.5px;font-weight:700;">
                  ${emoji} ${event} &nbsp;·&nbsp; RoboNexus '26
                </p>
              </div>

              <p style="margin:0 0 16px 0;font-size:20px;font-weight:700;color:#ffffff;">
                Dear ${name},
              </p>
              <p style="margin:0 0 24px 0;color:rgba(255,255,255,0.85);">
                Your registration for <strong style="color:#47a0b8;">RoboNexus '26 — ${event}</strong> has been confirmed.
                All your details are recorded below.
              </p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                     style="background:rgba(71,160,184,0.07);border:1px solid rgba(71,160,184,0.3);border-radius:8px;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 4px 0;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:rgba(71,160,184,0.7);">
                      Registration ID
                    </p>
                    <p style="margin:0 0 6px 0;font-size:28px;font-weight:900;color:#ffffff;letter-spacing:3px;font-family:'Courier New',Courier,monospace;">
                      ${regId}
                    </p>
                    <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.4);">
                      Keep this safe. You will need it to verify on our Discord server.
                    </p>
                  </td>
                  <td align="right" valign="middle" style="padding:20px 24px;">
                    <p style="margin:0 0 3px 0;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.3);text-align:right;">
                      Registered At
                    </p>
                    <p style="margin:0;font-size:12px;font-weight:600;color:#47a0b8;font-family:'Courier New',Courier,monospace;text-align:right;">
                      ${registeredAt}
                    </p>
                  </td>
                </tr>
              </table>

              <div style="height:1px;background:rgba(71,160,184,0.2);margin:0 0 24px 0;"></div>

              <p style="margin:0 0 14px 0;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#47a0b8;">
                Participant Details
              </p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.06);width:38%;vertical-align:top;">
                    <span style="font-size:11px;font-weight:600;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:0.8px;">Name</span>
                  </td>
                  <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.06);vertical-align:top;">
                    <span style="font-size:14px;font-weight:600;color:#ffffff;">${name}</span>
                  </td>
                </tr>
                ${detailRow('Email', email)}
                ${detailRow('Phone', phone)}
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.06);vertical-align:top;">
                    <span style="font-size:11px;font-weight:600;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:0.8px;">Discord ID</span>
                  </td>
                  <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.06);vertical-align:top;">
                    <span style="font-size:14px;color:rgba(255,255,255,0.85);font-family:'Courier New',Courier,monospace;">${discord}</span>
                  </td>
                </tr>
                ${detailRow('School', school)}
                ${detailRow('Grade', `Class ${gradeCategory}`)}
                ${detailRow('Participation', participationType)}
                ${teamName ? detailRow('Team Name', teamName) : ''}
                ${detailRow('Team Size', String(teamSize), true)}
              </table>

              ${hasTeam ? `
              <div style="height:1px;background:rgba(71,160,184,0.2);margin:0 0 24px 0;"></div>
              <p style="margin:0 0 14px 0;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#47a0b8;">Team Members</p>
              ${memberBlock(2, m2)}
              ${memberBlock(3, m3)}
              ` : ''}

              <div style="height:1px;background:rgba(71,160,184,0.2);margin:0 0 24px 0;"></div>

              <p style="margin:0 0 8px 0;color:rgba(255,255,255,0.9);">
                Join our Discord server and head to <strong style="color:#ffffff;">#verify</strong> — enter your Reg ID to confirm your spot.
              </p>
              <p style="margin:0 0 20px 0;color:rgba(255,255,255,0.9);">
                Event date and venue will be announced in <strong style="color:#ffffff;">#announcements</strong>. Stay tuned.
              </p>

              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
                <tr>
                  <td style="background:#47a0b8;border-radius:6px;">
                    <a href="https://discord.gg/dbSfP4mXej"
                       style="display:inline-block;padding:12px 30px;font-size:13px;font-weight:700;color:#000000;text-decoration:none;letter-spacing:0.5px;text-transform:uppercase;">
                      Join Discord Server
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0;color:rgba(255,255,255,0.85);font-size:14px;">
                Best regards,<br>
                <a href="https://robonexus46.vercel.app" target="_blank"
                   style="color:#47a0b8;font-weight:700;text-decoration:underline;">Team RoboNexus</a>
              </p>

            </td>
          </tr>

          <tr>
            <td style="padding:24px 40px;background:#000000;text-align:center;border-top:1px solid rgba(71,160,184,0.12);">
              <p style="margin:0 0 6px 0;color:rgba(255,255,255,0.45);font-size:12px;">
                <a href="https://robonexus46.vercel.app" target="_blank"
                   style="color:#47a0b8;text-decoration:underline;font-weight:700;">Robo Nexus</a>
                &nbsp;·&nbsp; Amity International School, Sector 46, Gurugram
              </p>
              <p style="margin:0 0 20px 0;font-size:12px;">
                <a href="mailto:robonexus.ais46@gmail.com"
                   style="color:rgba(255,255,255,0.3);text-decoration:none;">robonexus.ais46@gmail.com</a>
              </p>
              <p style="margin:0;color:rgba(255,255,255,0.25);font-size:10px;line-height:1.6;">
                This is an automated confirmation email. If you did not register for RoboNexus '26, please disregard this message.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:0;margin:0;line-height:0;">
              <img src="https://raw.githubusercontent.com/RoboNexxus/Assets/main/particles-bg.gif"
                   alt="" width="650"
                   style="width:100%;height:100px;object-fit:cover;display:block;opacity:0.8;margin:0;padding:0;border:0;vertical-align:top;">
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ════════════════════════════════════════════════════════════════════
//  BREVO API EMAIL SENDER
// ════════════════════════════════════════════════════════════════════

async function sendConfirmationEmail(data) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'robonexus.ais46@gmail.com';
  const senderName = process.env.BREVO_SENDER_NAME || 'Robo Nexus';

  if (!apiKey) {
    console.warn('BREVO_API_KEY not set — skipping email');
    return;
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
        accept: 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: senderName,
          email: senderEmail,
        },
        to: [
          {
            email: data.email,
            name: data.name,
          },
        ],
        subject: `RoboNexus '26 Registration Confirmed — ${data.regId}`,
        htmlContent: buildEmailHTML(data),
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText);
    }

    console.log(`✅ Email → ${data.email} [${data.regId}]`);
  } catch (err) {
    console.error(`❌ Brevo email failed for ${data.regId}:`, err.message);
  }
}

// ════════════════════════════════════════════════════════════════════
//  DISCORD WEBHOOK NOTIFICATION
// ════════════════════════════════════════════════════════════════════

async function sendDiscordNotification(webhookUrl, {
  event, regId, name, discord, email, phone,
  school, gradeCategory, participationType,
  teamName, totalSize, m2, m3,
}) {
  if (!webhookUrl) return;

  const emoji = EVENT_EMOJI[event] || '🤖';
  const typeEmoji = participationType === 'Individual' ? '👤' : '🏫';

  const memberFields = [];
  if (m2?.name?.trim()) {
    memberFields.push({
      name: '👤 Member 2',
      value: `**${m2.name}**\nDiscord: \`${m2.discord || '—'}\`\nEmail: ${m2.email || '—'}`,
      inline: false,
    });
  }
  if (m3?.name?.trim()) {
    memberFields.push({
      name: '👤 Member 3',
      value: `**${m3.name}**\nDiscord: \`${m3.discord || '—'}\`\nEmail: ${m3.email || '—'}`,
      inline: false,
    });
  }

  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      embeds: [{
        title: `${emoji} New Registration — ${event}`,
        color: 0x47a0b8,
        description: `New participant registered for **${event}** at RoboNexus '26.`,
        fields: [
          { name: '🪪 Reg ID', value: `\`${regId}\``, inline: true },
          { name: '👤 Name', value: name, inline: true },
          { name: '🎮 Discord', value: `\`${discord}\``, inline: true },
          { name: '📧 Email', value: email, inline: true },
          { name: '📱 Phone', value: phone, inline: true },
          { name: '🏫 School', value: school, inline: true },
          { name: '📚 Grade', value: `Class ${gradeCategory}`, inline: true },
          { name: `${typeEmoji} Type`, value: `${participationType} · ${totalSize} member${totalSize > 1 ? 's' : ''}`, inline: true },
          ...(teamName ? [{ name: '🏆 Team', value: teamName, inline: true }] : []),
          ...memberFields,
        ],
        footer: { text: `RoboNexus '26 · ${event} · ${regId}` },
        timestamp: new Date().toISOString(),
      }],
    }),
  });

  console.log(`📣 Discord notified [${regId}]`);
}

// ════════════════════════════════════════════════════════════════════
//  MAIN HANDLER
// ════════════════════════════════════════════════════════════════════

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  try {
    const {
      name, discord, email, phone, school,
      gradeCategory, participationType, teamName,
      event, members,
    } = req.body;

    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const PHONE_RE = /^\+?[\d\s\-()\\.]{7,20}$/;

    if (
      !name || !discord || !email || !phone || !school ||
      !gradeCategory || !participationType || !event
    ) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    if (!PHONE_RE.test(phone)) {
      return res.status(400).json({ message: 'Invalid phone number format' });
    }

    const rawMembers = Array.isArray(members) ? members : [];
    const filledExtraMembers = rawMembers.filter(m => m?.name?.trim());

    if (participationType === 'School Team' && !teamName) {
      return res.status(400).json({ message: 'Team name required for school team' });
    }
    if (filledExtraMembers.length > 2) {
      return res.status(400).json({ message: 'Max team size is 3 (1 primary + 2 additional)' });
    }

    const teamMembers = rawMembers.slice(0, 2);
    const totalSize = 1 + filledExtraMembers.slice(0, 2).length;

    const NOTION_TOKEN = process.env.NOTION_TOKEN;
    const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

    if (!NOTION_TOKEN) {
      console.error('Missing NOTION_TOKEN');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    const eventEntry = EVENT_DB_MAP[event];
    if (!eventEntry) {
      return res.status(400).json({ message: `Unknown event: ${event}` });
    }

    const NOTION_DB = eventEntry.id;
    const EVENT_PREFIX = eventEntry.prefix;

    const NOTION_HEADERS = {
      Authorization: `Bearer ${NOTION_TOKEN}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
    };

    try {
      const dupRes = await fetch(`https://api.notion.com/v1/databases/${NOTION_DB}/query`, {
        method: 'POST',
        headers: NOTION_HEADERS,
        body: JSON.stringify({
          filter: { property: 'Email', email: { equals: email } },
          page_size: 1,
        }),
      });
      const dupData = await dupRes.json();
      if (dupData.results?.length > 0) {
        return res.status(409).json({ message: 'This email is already registered for this event.' });
      }
    } catch (err) {
      console.warn('Duplicate check failed, proceeding:', err.message);
    }

    let registrationCount = 0;
    try {
      let startCursor = undefined;
      while (true) {
        const body = {
          page_size: 100,
          ...(startCursor ? { start_cursor: startCursor } : {}),
        };

        const r = await fetch(`https://api.notion.com/v1/databases/${NOTION_DB}/query`, {
          method: 'POST',
          headers: NOTION_HEADERS,
          body: JSON.stringify(body),
        });

        const d = await r.json();
        registrationCount += (d.results || []).length;
        if (!d.has_more) break;
        startCursor = d.next_cursor;
      }
    } catch (err) {
      console.warn('Count query failed:', err.message);
    }

    if (EVENT_CAPS[event] > 0 && registrationCount >= EVENT_CAPS[event]) {
      return res.status(410).json({
        message: 'Registrations for this event are now closed. All spots are filled.',
      });
    }

    const nextNum = registrationCount + 1;
    const regId = `RN-${EVENT_PREFIX}-${String(nextNum).padStart(3, '0')}`;

    const m2 = teamMembers[0] || {};
    const m3 = teamMembers[1] || {};

    const member2Props = m2.name?.trim() ? {
      'Member 2 Name': { rich_text: [{ text: { content: m2.name } }] },
      'Member 2 Discord': { rich_text: [{ text: { content: m2.discord || '' } }] },
      ...(m2.email?.trim() ? { 'Member 2 Email': { email: m2.email } } : {}),
    } : {};

    const member3Props = m3.name?.trim() ? {
      'Member 3 Name': { rich_text: [{ text: { content: m3.name } }] },
      'Member 3 Discord': { rich_text: [{ text: { content: m3.discord || '' } }] },
      ...(m3.email?.trim() ? { 'Member 3 Email': { email: m3.email } } : {}),
    } : {};

    const notionBody = {
      parent: { database_id: NOTION_DB },
      properties: {
        Name: { title: [{ text: { content: name } }] },
        'Reg ID': { rich_text: [{ text: { content: regId } }] },
        'Discord ID': { rich_text: [{ text: { content: discord } }] },
        Email: { email },
        Phone: { phone_number: phone },
        School: { rich_text: [{ text: { content: school } }] },
        'Grade Category': { select: { name: gradeCategory } },
        'Participation Type': { select: { name: participationType } },
        'Team Name': { rich_text: [{ text: { content: teamName || '' } }] },
        'Team Size': { number: totalSize },
        Status: { select: { name: 'New' } },
        ...member2Props,
        ...member3Props,
      },
    };

    const notionRes = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: NOTION_HEADERS,
      body: JSON.stringify(notionBody),
    });

    if (!notionRes.ok) {
      const err = await notionRes.text();
      console.error('Notion error:', err);
      return res.status(500).json({ message: 'Failed to save registration' });
    }

    const registeredAt = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    Promise.allSettled([
      sendConfirmationEmail({
        name, email, phone, discord, school,
        gradeCategory, participationType,
        teamName: teamName || '',
        teamSize: totalSize,
        event,
        regId,
        members: [m2, m3],
        registeredAt,
      }),
      sendDiscordNotification(WEBHOOK_URL, {
        event, regId, name, discord, email, phone,
        school, gradeCategory, participationType,
        teamName: teamName || '',
        totalSize, m2, m3,
      }),
    ]).then(results => {
      results.forEach((r, i) => {
        if (r.status === 'rejected') {
          console.error(`Post-reg task[${i}] failed:`, r.reason?.message || r.reason);
        }
      });
    });

    return res.status(200).json({
      message: 'Registration successful',
      regId,
    });

  } catch (error) {
    console.error('Register error:', error.message);
    return res.status(500).json({ message: 'Failed to process registration' });
  }
}