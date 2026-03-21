export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  try {
    const { adminKey, regId, event, status } = req.body;

    // Security check
    if (!adminKey || adminKey !== process.env.ADMIN_SECRET_KEY) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!regId || !event || !status) {
      return res.status(400).json({ message: "Missing required fields: regId, event, status" });
    }

    const validStatuses = ['New', 'Confirmed', 'Rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    // Event mapping (same as register.js)
    const EVENT_DB_MAP = {
      'Robo War': { id: '723ea79c8931405e9342696f47b81e68' },
      'Robo Soccer': { id: '437ef7d538b54a158b46d0ac0308f369' },
      'Drone': { id: 'c5b196b2142749e9877bc41b6ada98b5' },
      'Line Follower': { id: 'fe308409369041c5b59f77dc1f2fcdc0' },
      'Race': { id: '5e0ede808c1b4d9284bc29abfc3e7000' },
    };

    const eventEntry = EVENT_DB_MAP[event];
    if (!eventEntry) {
      return res.status(400).json({ message: `Unknown event: ${event}` });
    }

    const NOTION_TOKEN = process.env.NOTION_TOKEN;
    const NOTION_HEADERS = {
      'Authorization': `Bearer ${NOTION_TOKEN}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
    };

    // 1. Query the Notion DB for the page with the given Reg ID
    const queryRes = await fetch(`https://api.notion.com/v1/databases/${eventEntry.id}/query`, {
      method: 'POST',
      headers: NOTION_HEADERS,
      body: JSON.stringify({
        filter: {
          property: 'Reg ID',
          rich_text: { equals: regId }
        },
        page_size: 1
      })
    });

    const queryData = await queryRes.json();
    if (!queryData.results || queryData.results.length === 0) {
      return res.status(404).json({ message: "Registration not found" });
    }

    const pageId = queryData.results[0].id;

    // 2. Update the Status property
    const updateRes = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
      method: 'PATCH',
      headers: NOTION_HEADERS,
      body: JSON.stringify({
        properties: {
          Status: {
            select: { name: status }
          }
        }
      })
    });

    if (!updateRes.ok) {
      const errorText = await updateRes.text();
      console.error('Notion update error:', errorText);
      return res.status(500).json({ message: "Failed to update status in Notion" });
    }

    return res.status(200).json({ message: "Status updated", regId, status });

  } catch (error) {
    console.error('Update status error:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
