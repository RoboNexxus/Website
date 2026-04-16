const NOTION_DB = '5a61b841eb8f4f1c9dab198fdae796b2';

const SKILL_OPTIONS = new Set([
  'Robotics', 'Arduino', 'Python', 'Electronics', 'CAD/3D Modelling',
  'Drone Piloting', 'AI/ML', 'Web Dev', 'Discord Bots', 'Video Editing', 'Builder', '2D',
]);

const EVENT_OPTIONS = new Set([
  'Robo War', 'Robo Soccer', 'Drone', 'Line Follower', 'Race', 'Innovation', 'Web/Tech',
]);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_RE = /^[a-zA-Z][a-zA-Z .'-]{1,79}$/;
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

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  try {
    const { name, email, github, website, links, skills, eventsInterested, experience } = req.body;

    const cleanName = cleanString(name, 80);
    const cleanEmail = cleanString(email, 254).toLowerCase();
    const cleanGithub = cleanString(github, 300);
    const cleanWebsite = cleanString(website, 300);
    const cleanLinks = cleanString(links, 500);
    const cleanExperience = cleanString(experience, 1500);

    const skillValues = Array.isArray(skills)
      ? skills.map((value) => cleanString(String(value), 60)).filter(Boolean)
      : [];
    const eventValues = Array.isArray(eventsInterested)
      ? eventsInterested.map((value) => cleanString(String(value), 60)).filter(Boolean)
      : [];

    if (!cleanName || !cleanEmail) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    if (!NAME_RE.test(cleanName)) {
      return res.status(400).json({ message: 'Invalid name format' });
    }

    if (!EMAIL_RE.test(cleanEmail)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    if (!isValidHttpUrl(cleanGithub) || !isValidHttpUrl(cleanWebsite)) {
      return res.status(400).json({ message: 'GitHub and website must be valid http/https URLs' });
    }

    if (
      hasUnsafeInput(cleanName) || hasUnsafeInput(cleanEmail) || hasUnsafeInput(cleanGithub) ||
      hasUnsafeInput(cleanWebsite) || hasUnsafeInput(cleanLinks) || hasUnsafeInput(cleanExperience)
    ) {
      return res.status(400).json({ message: 'Invalid or unsafe input detected' });
    }

    const invalidSkills = skillValues.filter((value) => !SKILL_OPTIONS.has(value));
    if (invalidSkills.length > 0) {
      return res.status(400).json({ message: 'Invalid skill selection' });
    }

    const invalidEvents = eventValues.filter((value) => !EVENT_OPTIONS.has(value));
    if (invalidEvents.length > 0) {
      return res.status(400).json({ message: 'Invalid event selection' });
    }

    const safeSkills = [...new Set(skillValues)];
    const safeEvents = [...new Set(eventValues)];

    const NOTION_TOKEN = process.env.NOTION_TOKEN;
    if (!NOTION_TOKEN) return res.status(500).json({ message: 'Server configuration error' });

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
          filter: { property: 'Email', email: { equals: cleanEmail } },
          page_size: 1,
        }),
      });
      const dupData = await dupRes.json();
      if (dupData.results?.length > 0) {
        return res.status(409).json({ message: 'An application with this email already exists.' });
      }
    } catch (_error) {
      // Continue if duplicate check fails; primary insert can still provide useful feedback.
    }

    const notesParts = [];
    if (cleanWebsite) notesParts.push(`Website: ${cleanWebsite}`);
    if (cleanLinks) notesParts.push(`Links: ${cleanLinks}`);

    const notionBody = {
      parent: { database_id: NOTION_DB },
      properties: {
        Name: { title: [{ text: { content: cleanName } }] },
        Email: { email: cleanEmail },
        ...(cleanGithub ? { GitHub: { url: cleanGithub } } : {}),
        Skills: {
          multi_select: safeSkills
            .filter(Boolean).map((s) => ({ name: s })),
        },
        'Events Interested': {
          multi_select: safeEvents
            .filter(Boolean).map((e) => ({ name: e })),
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
      method: 'POST',
      headers: NOTION_HEADERS,
      body: JSON.stringify(notionBody),
    });

    if (!notionRes.ok) {
      const err = await notionRes.text();
      console.error('Notion error:', err);
      return res.status(500).json({ message: 'Failed to save application' });
    }

    return res.status(200).json({ message: 'Application submitted successfully' });

  } catch (error) {
    console.error('Apply error:', error.message);
    return res.status(500).json({ message: 'Failed to process application' });
  }
}
