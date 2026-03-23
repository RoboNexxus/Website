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
      event, members
    } = req.body;

    // ── BUG-06 FIX: Server-side validation (regex) ──────────────────────
    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const PHONE_RE = /^\+?[\d\s\-()\\.]{7,20}$/;

    if (!name || !discord || !email || !phone || !school || !gradeCategory || !participationType || !event) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    if (!PHONE_RE.test(phone)) {
      return res.status(400).json({ message: 'Invalid phone number format' });
    }

    // ── BUG-04 FIX: Validate team size BEFORE slicing ───────────────────
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
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

    if (!NOTION_TOKEN) {
      console.error('Missing NOTION_TOKEN');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    // ── SB-4 FIX: Event-prefixed Reg IDs ────────────────────────────────
    const EVENT_DB_MAP = {
      'Robo War': { id: '723ea79c8931405e9342696f47b81e68', prefix: 'WAR' },
      'Robo Soccer': { id: '437ef7d538b54a158b46d0ac0308f369', prefix: 'SOC' },
      'Drone': { id: 'c5b196b2142749e9877bc41b6ada98b5', prefix: 'DRN' },
      'Line Follower': { id: 'fe308409369041c5b59f77dc1f2fcdc0', prefix: 'LFR' },
      'Race': { id: '5e0ede808c1b4d9284bc29abfc3e7000', prefix: 'RCE' },
    };

    const eventEntry = EVENT_DB_MAP[event];
    if (!eventEntry) {
      return res.status(400).json({ message: `Unknown event: ${event}` });
    }

    const NOTION_DB = eventEntry.id;
    const EVENT_PREFIX = eventEntry.prefix;

    const NOTION_HEADERS = {
      'Authorization': `Bearer ${NOTION_TOKEN}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
    };

    // ── BUG-05 FIX: Duplicate email check ───────────────────────────────
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
      if (dupData.results && dupData.results.length > 0) {
        return res.status(409).json({ message: 'This email is already registered for this event.' });
      }
    } catch (err) {
      console.warn('Duplicate check failed, proceeding:', err.message);
    }

    // ── MF-04: Per-event registration cap check ─────────────────────────
    const EVENT_CAPS = {
      'Robo War':      100,
      'Robo Soccer':   100,
      'Drone':         100,
      'Line Follower': 100,
      'Race':          100,
    };

    if (EVENT_CAPS[event] > 0) {
      try {
        let registrationCount = 0;
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
          if (!d.has_more || registrationCount >= EVENT_CAPS[event]) break;
          startCursor = d.next_cursor;
        }

        if (registrationCount >= EVENT_CAPS[event]) {
          return res.status(410).json({ message: 'Registrations for this event are now closed. All spots are filled.' });
        }
      } catch (err) {
        console.warn('Cap check failed, proceeding:', err.message);
      }
    }

    // ── BUG-03 proper: Atomic Reg ID counter via Supabase ──────────────
    let nextNum;
    try {
      if (!SUPABASE_URL || !SUPABASE_ANON_KEY) throw new Error('Supabase config missing');
      
      const sbRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/next_reg_id`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ event_prefix: EVENT_PREFIX.toLowerCase() })
      });
      
      if (!sbRes.ok) throw new Error(`Supabase RPC failed: ${sbRes.status}`);
      const raw = await sbRes.json();
      if (typeof raw === 'number') {
        nextNum = raw;
      } else if (Array.isArray(raw)) {
        nextNum = raw[0]?.next_reg_id ?? raw[0];
      } else if (raw && typeof raw === 'object') {
        nextNum = raw.next_reg_id ?? raw.counter ?? raw;
      }
      if (!nextNum || isNaN(nextNum)) throw new Error('Invalid nextNum from RPC: ' + JSON.stringify(raw));
    } catch (err) {
      console.error('Supabase Reg ID generation failed, falling back to timestamp:', err.message);
      nextNum = Date.now() % 100000;
    }

    const regId = `RN-${EVENT_PREFIX}-${String(nextNum).padStart(3, '0')}`;

    const m2 = teamMembers[0] || {};
    const m3 = teamMembers[1] || {};

    // ── BUG-01 FIX: Never pass null to Notion email properties ──────────
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

    // ── Write to Notion ──────────────────────────────────────────────────
    const notionBody = {
      parent: { database_id: NOTION_DB },
      properties: {
        Name: { title: [{ text: { content: name } }] },
        'Reg ID': { rich_text: [{ text: { content: regId } }] },
        'Discord ID': { rich_text: [{ text: { content: discord } }] },
        Email: { email: email },
        Phone: { phone_number: phone },
        School: { rich_text: [{ text: { content: school } }] },
        'Grade Category': { select: { name: gradeCategory } },
        'Participation Type': { select: { name: participationType } },
        'Team Name': { rich_text: [{ text: { content: teamName || '' } }] },
        'Team Size': { number: totalSize },
        Status: { select: { name: 'New' } },
        ...member2Props,
        ...member3Props,
      }
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

    // ── CS-03 FIX: Discord webhook ───────────────────────────────────────
    if (WEBHOOK_URL) {
      const typeEmoji = participationType === 'Individual' ? '👤' : '🏫';
      const eventEmojis = {
        'Robo War': '⚔️', 'Robo Soccer': '⚽',
        'Drone': '🚁', 'Line Follower': '〰️', 'Race': '🏁'
      };

      const memberFields = [];
      if (m2.name?.trim()) memberFields.push({
        name: '👤 Member 2',
        value: `**${m2.name}** | ${m2.discord || '—'} | ${m2.email || '—'}`,
        inline: false
      });
      if (m3.name?.trim()) memberFields.push({
        name: '👤 Member 3',
        value: `**${m3.name}** | ${m3.discord || '—'} | ${m3.email || '—'}`,
        inline: false
      });

      try {
        await fetch(WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            embeds: [{
              title: `${eventEmojis[event] || '🤖'} New Registration — ${event}`,
              color: 0x47a0b8,
              fields: [
                { name: '🪪 Reg ID', value: `\`${regId}\``, inline: true },
                { name: '👤 Name', value: name, inline: true },
                { name: '🎮 Discord', value: discord, inline: true },
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
            }]
          }),
        });
      } catch (wErr) {
        console.error(`Discord webhook failed for ${regId}:`, wErr.message);
      }
    }

    return res.status(200).json({ message: 'Registration successful', regId });

  } catch (error) {
    console.error('Register error:', error.message);
    return res.status(500).json({ message: 'Failed to process registration' });
  }
}
