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

    // ── Validation ──────────────────────────────────────────────
    if (!name || !discord || !email || !phone || !school || !gradeCategory || !participationType || !event) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    if (participationType === 'School Team' && !teamName) {
      return res.status(400).json({ message: 'Team name required for school team' });
    }

    const teamMembers = Array.isArray(members) ? members.slice(0, 2) : [];
    const totalSize = 1 + teamMembers.filter(m => m?.name?.trim()).length;
    if (totalSize > 3) {
      return res.status(400).json({ message: 'Max team size is 3' });
    }

    const NOTION_TOKEN = process.env.NOTION_TOKEN;
    const NOTION_DB = '87d2689fed5147a49751bebb6e7e1fbb';
    const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

    if (!NOTION_TOKEN) {
      console.error('Missing NOTION_TOKEN');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    const NOTION_HEADERS = {
      'Authorization': `Bearer ${NOTION_TOKEN}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
    };

    // ── Generate next Reg ID ─────────────────────────────────────
    // Query all existing Reg ID values, find the highest number, add 1.
    // If DB is empty (after a reset) → starts at RN_001.
    let nextNum = 1;
    try {
      // Fetch all pages sorted by created time, just the Reg ID property
      const queryRes = await fetch(`https://api.notion.com/v1/databases/${NOTION_DB}/query`, {
        method: 'POST',
        headers: NOTION_HEADERS,
        body: JSON.stringify({
          sorts: [{ property: 'Registered At', direction: 'descending' }],
          page_size: 100,
        }),
      });
      const queryData = await queryRes.json();

      if (queryData.results && queryData.results.length > 0) {
        let maxNum = 0;
        for (const page of queryData.results) {
          const regIdText = page.properties?.['Reg ID']?.rich_text?.[0]?.plain_text || '';
          // Parse the number from "RN_001" → 1
          const match = regIdText.match(/RN_(\d+)/);
          if (match) {
            const n = parseInt(match[1], 10);
            if (n > maxNum) maxNum = n;
          }
        }
        nextNum = maxNum + 1;
      }
    } catch (err) {
      // If query fails for any reason, fall back to 1
      console.warn('Could not query existing reg IDs, defaulting to 1:', err.message);
      nextNum = 1;
    }

    const regId = 'RN_' + String(nextNum).padStart(3, '0');

    const m2 = teamMembers[0] || {};
    const m3 = teamMembers[1] || {};

    // ── Save to Notion ───────────────────────────────────────────
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
        Event: { select: { name: event } },
        'Team Size': { number: totalSize },
        Status: { select: { name: 'New' } },
        ...(m2.name?.trim() ? {
          'Member 2 Name': { rich_text: [{ text: { content: m2.name || '' } }] },
          'Member 2 Discord': { rich_text: [{ text: { content: m2.discord || '' } }] },
          'Member 2 Email': { email: m2.email || null },
        } : {}),
        ...(m3.name?.trim() ? {
          'Member 3 Name': { rich_text: [{ text: { content: m3.name || '' } }] },
          'Member 3 Discord': { rich_text: [{ text: { content: m3.discord || '' } }] },
          'Member 3 Email': { email: m3.email || null },
        } : {}),
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

    // ── Discord Webhook ──────────────────────────────────────────
    if (WEBHOOK_URL) {
      const typeEmoji = participationType === 'Individual' ? '👤' : '🏫';
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

      await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [{
            title: `🤖 New RoboNexus '26 Registration!`,
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
              { name: '🎯 Event', value: event, inline: false },
              ...memberFields,
            ],
            footer: { text: `RoboNexus '26 · Reg ID: ${regId}` },
            timestamp: new Date().toISOString(),
          }]
        }),
      }).catch(e => console.error('Discord webhook failed:', e));
    }

    return res.status(200).json({ message: 'Registration successful', regId });

  } catch (error) {
    console.error('Register error:', error.message);
    return res.status(500).json({ message: 'Failed to process registration' });
  }
}