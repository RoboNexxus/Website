exports.handler = async function (event, context) {
    const headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "https://robonexusaisg46.netlify.app",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
    };

    if (event.httpMethod === "OPTIONS") {
        return { statusCode: 204, headers, body: "" };
    }

    if (event.httpMethod !== "POST") {
        return { statusCode: 405, headers, body: JSON.stringify({ message: "Method Not Allowed" }) };
    }

    try {
        const { name, email, subject, message } = JSON.parse(event.body);

        if (!name || !email || !subject || !message) {
            return { statusCode: 400, headers, body: JSON.stringify({ message: "Missing required fields" }) };
        }

        const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
        if (!DISCORD_WEBHOOK_URL) {
            console.error("Missing DISCORD_WEBHOOK_URL");
            return { statusCode: 500, headers, body: JSON.stringify({ message: "Server configuration error" }) };
        }

        const discordRes = await fetch(DISCORD_WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                embeds: [{
                    title: "📧 New Contact Form Submission",
                    color: 0x47a0b8,
                    description: `**From:** ${name} (${email})`,
                    fields: [
                        { name: "📝 Subject", value: subject, inline: false },
                        { name: "💬 Message", value: message.length > 1024 ? message.substring(0, 1021) + "..." : message, inline: false }
                    ],
                    footer: { text: "Robo Nexus Contact Form • robonexus.ais46@gmail.com" },
                    timestamp: new Date().toISOString()
                }]
            })
        });

        if (!discordRes.ok) {
            console.error("Discord webhook failed:", discordRes.status, await discordRes.text());
            return { statusCode: 500, headers, body: JSON.stringify({ message: "Failed to send notification" }) };
        }

        return { statusCode: 200, headers, body: JSON.stringify({ message: "Submission received", discord: true }) };

    } catch (error) {
        console.error("Function error:", error.message);
        return { statusCode: 500, headers, body: JSON.stringify({ message: "Failed to process request" }) };
    }
};