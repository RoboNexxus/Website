export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
    if (!DISCORD_WEBHOOK_URL) {
      console.error('Missing DISCORD_WEBHOOK_URL');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    const discordRes = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [{
          title: '📧 New Contact Form Submission',
          color: 0x47a0b8,
          description: `**From:** ${name} (${email})`,
          fields: [
            { name: '📝 Subject', value: subject, inline: false },
            { name: '💬 Message', value: message.length > 1024 ? message.substring(0, 1021) + '...' : message, inline: false }
          ],
          footer: { text: 'Robo Nexus Contact Form • robonexus.ais46@gmail.com' },
          timestamp: new Date().toISOString()
        }]
      })
    });

    if (!discordRes.ok) {
      const errorBody = await discordRes.text();
      console.error(`Discord webhook failed [${discordRes.status}]:`, errorBody);
      return res.status(500).json({ message: 'Failed to send notification' });
    }

    return res.status(200).json({ message: 'Submission received', discord: true });

  } catch (error) {
    console.error('Function error:', error.message);
    return res.status(500).json({ message: 'Failed to process request' });
  }
}
