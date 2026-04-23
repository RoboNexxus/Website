const NOTION_DB = '5a61b841eb8f4f1c9dab198fdae796b2';

// ── Synced exactly with Notion DB multi_select options ──
const SKILL_OPTIONS = new Set([
  'Robotics', 'Arduino', 'Python', 'Electronics', 'CAD/3D Modelling',
  'Drone Piloting', 'AI/ML', 'Web Dev', 'Discord Bots',
  'Video Editing', 'Builder', 'Leadership', '2D',
]);

const EVENT_OPTIONS = new Set([
  'Robo War', 'Robo Soccer', 'Drone', 'Line Follower', 'Race', 'Innovation', 'Web/Tech',
]);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_RE  = /^[a-zA-Z][a-zA-Z .'-]{1,79}$/;
const PHONE_RE = /^\+?[\d\s\-()\\.]{7,20}$/;
const UNSAFE_INPUT_RE = /<[^>]*>|javascript:|data:text\/html|onerror\s*=|onload\s*=|<\/?script/i;

function cleanString(value, maxLength) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLength);
}

function hasUnsafeInput(value) {
  return UNSAFE_INPUT_RE.test(String(value || ''));
}

function isValidHttpUrl(value) {
  if (!value) return true;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch (_err) {
    return false;
  }
}

function truncateText(value, maxLength) {
  const text = String(value || '');
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3)}...`;
}

async function sendDiscordNotification(webhookUrl, {
  name, email, phone, github, website, links,
  skills, eventsInterested, experience,
}) {
  if (!webhookUrl) return false;

  const skillsText     = skills.length > 0 ? skills.join(', ') : 'Not selected';
  const eventsText     = eventsInterested.length > 0 ? eventsInterested.join(', ') : 'Not selected';
  const linksText      = links || 'Not provided';
  const experienceText = experience || 'Not provided';

  const payload = {
    embeds: [{
      title: 'New Induction Application',
      color: 0x47a0b8,
      description: `A new induction form has been submitted by **${truncateText(name, 120)}**.`,
      fields: [
        { name: 'Name',              value: truncateText(name, 1024),                   inline: true  },
        { name: 'Email',             value: truncateText(email, 1024),                  inline: true  },
        { name: 'Phone',             value: truncateText(phone || 'Not provided', 256), inline: true  },
        { name: 'GitHub',            value: truncateText(github || 'Not provided', 1024), inline: false },
        { name: 'Website',           value: truncateText(website || 'Not provided', 1024), inline: false },
        { name: 'Skills',            value: truncateText(skillsText, 1024),             inline: false },
        { name: 'Events Interested', value: truncateText(eventsText, 1024),             inline: false },
        { name: 'Other Links',       value: truncateText(linksText, 1024),              inline: false },
        { name: 'Experience',        value: truncateText(experienceText, 1024),         inline: false },
      ],
      footer:    { text: 'Robo Nexus Inductions' },
      timestamp: new Date().toISOString(),
    }],
  };

  const discordRes = await fetch(webhookUrl, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  });

  if (!discordRes.ok) {
    const errorBody = await discordRes.text();
    throw new Error(`Discord webhook failed [${discordRes.status}]: ${errorBody}`);
  }

  return true;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST')    return res.status(405).json({ message: 'Method Not Allowed' });

  try {
    const {
      name, email, phone, github, website,
      links, skills, eventsInterested, experience,
    } = req.body;

    // ── Sanitise ──
    const cleanName       = cleanString(name, 80);
    const cleanEmail      = cleanString(email, 254).toLowerCase();
    const cleanPhone      = cleanString(phone, 20);
    const cleanGithub     = cleanString(github, 300);
    const cleanWebsite    = cleanString(website, 300);
    const cleanLinks      = cleanString(links, 500);
    const cleanExperience = cleanString(experience, 1500);

    const skillValues = Array.isArray(skills)
      ? skills.map((v) => cleanString(String(v), 60)).filter(Boolean)
      : [];
    const eventValues = Array.isArray(eventsInterested)
      ? eventsInterested.map((v) => cleanString(String(v), 60)).filter(Boolean)
      : [];

    // ── Required fields ──
    if (!cleanName || !cleanEmail || !cleanPhone) {
      return res.status(400).json({ message: 'Name, email and phone are required' });
    }

    // ── Format validation ──
    if (!NAME_RE.test(cleanName)) {
      return res.status(400).json({ message: 'Invalid name format' });
    }
    if (!EMAIL_RE.test(cleanEmail)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    if (!PHONE_RE.test(cleanPhone)) {
      return res.status(400).json({ message: 'Invalid phone number format' });
    }
    if (!isValidHttpUrl(cleanGithub) || !isValidHttpUrl(cleanWebsite)) {
      return res.status(400).json({ message: 'GitHub and website must be valid http/https URLs' });
    }

    // ── XSS / injection guard ──
    if (
      hasUnsafeInput(cleanName)  || hasUnsafeInput(cleanEmail)  ||
      hasUnsafeInput(cleanPhone) || hasUnsafeInput(cleanGithub) ||
      hasUnsafeInput(cleanWebsite) || hasUnsafeInput(cleanLinks) ||
      hasUnsafeInput(cleanExperience)
    ) {
      return res.status(400).json({ message: 'Invalid or unsafe input detected' });
    }

    // ── Validate multi-select values against Notion options ──
    const invalidSkills = skillValues.filter((v) => !SKILL_OPTIONS.has(v));
    if (invalidSkills.length > 0) {
      return res.status(400).json({ message: 'Invalid skill selection' });
    }
    const invalidEvents = eventValues.filter((v) => !EVENT_OPTIONS.has(v));
    if (invalidEvents.length > 0) {
      return res.status(400).json({ message: 'Invalid event selection' });
    }

    const safeSkills = [...new Set(skillValues)];
    const safeEvents = [...new Set(eventValues)];

    // ── Notion setup ──
    const NOTION_TOKEN = process.env.NOTION_TOKEN;
    if (!NOTION_TOKEN) return res.status(500).json({ message: 'Server configuration error' });

    const NOTION_HEADERS = {
      Authorization:    `Bearer ${NOTION_TOKEN}`,
      'Content-Type':   'application/json',
      'Notion-Version': '2022-06-28',
    };

    // ── Duplicate check ──
    try {
      const dupRes = await fetch(`https://api.notion.com/v1/databases/${NOTION_DB}/query`, {
        method:  'POST',
        headers: NOTION_HEADERS,
        body:    JSON.stringify({
          filter:    { property: 'Email', email: { equals: cleanEmail } },
          page_size: 1,
        }),
      });
      const dupData = await dupRes.json();
      if (dupData.results?.length > 0) {
        return res.status(409).json({ message: 'An application with this email already exists.' });
      }
    } catch (_error) {
      // Continue — primary insert still gives useful feedback
    }

    // ── Build notes field ──
    const notesParts = [];
    if (cleanWebsite) notesParts.push(`Website: ${cleanWebsite}`);
    if (cleanLinks)   notesParts.push(`Links: ${cleanLinks}`);

    // ── Create Notion page ──
    const notionBody = {
      parent: { database_id: NOTION_DB },
      properties: {
        Name:  { title: [{ text: { content: cleanName } }] },
        Email: { email: cleanEmail },
        Phone: { phone_number: cleanPhone },
        ...(cleanGithub ? { GitHub: { url: cleanGithub } } : {}),
        Skills: {
          multi_select: safeSkills.filter(Boolean).map((s) => ({ name: s })),
        },
        'Events Interested': {
          multi_select: safeEvents.filter(Boolean).map((e) => ({ name: e })),
        },
        ...(cleanExperience
          ? { 'Previous Experience': { rich_text: [{ text: { content: cleanExperience } }] } }
          : {}),
        ...(notesParts.length
          ? { Notes: { rich_text: [{ text: { content: notesParts.join('\n') } }] } }
          : {}),
        'Application Status': { select: { name: 'Applied' } },
      },
    };

    const notionRes = await fetch('https://api.notion.com/v1/pages', {
      method:  'POST',
      headers: NOTION_HEADERS,
      body:    JSON.stringify(notionBody),
    });

    if (!notionRes.ok) {
      const err = await notionRes.text();
      console.error('Notion error:', err);
      return res.status(500).json({ message: 'Failed to save application' });
    }

    // ── Discord notification ──
    const DISCORD_WEBHOOK_URL =
      process.env.DISCORD_WEBHOOK_INDUCTIONS || process.env.DISCORD_WEBHOOK_URL;
    let discord = false;

    try {
      discord = await sendDiscordNotification(DISCORD_WEBHOOK_URL, {
        name:            cleanName,
        email:           cleanEmail,
        phone:           cleanPhone,
        github:          cleanGithub,
        website:         cleanWebsite,
        links:           cleanLinks,
        skills:          safeSkills,
        eventsInterested: safeEvents,
        experience:      cleanExperience,
      });
    } catch (notifyError) {
      console.error('Discord notify error:', notifyError.message);
    }

    return res.status(200).json({ message: 'Application submitted successfully', discord });

  } catch (error) {
    console.error('Apply error:', error.message);
    return res.status(500).json({ message: 'Failed to process application' });
  }
}