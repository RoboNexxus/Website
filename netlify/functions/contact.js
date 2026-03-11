exports.handler = async function (event, context) {
    const headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "https://robonexusaisg46.netlify.app",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
    };

    // Handle CORS preflight
    if (event.httpMethod === "OPTIONS") {
        return { statusCode: 204, headers, body: "" };
    }

    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ message: "Method Not Allowed" })
        };
    }

    try {
        const data = JSON.parse(event.body);
        const { name, email, subject, message } = data;

        if (!name || !email || !subject || !message) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ message: "Missing required fields" })
            };
        }

        // Basic email format check server-side as well
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ message: "Invalid email address" })
            };
        }

        const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
        const SUPABASE_URL = process.env.SUPABASE_URL;
        const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

        if (!DISCORD_WEBHOOK_URL) {
            console.error("Missing DISCORD_WEBHOOK_URL");
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ message: "Server configuration error" })
            };
        }

        const timestamp = new Date().toISOString();
        let discordSuccess = false;
        let supabaseSuccess = false;

        // ── 1. Discord Notification ──────────────────────────────
        try {
            const webhookBody = {
                embeds: [{
                    title: "📧 New Contact Form Submission",
                    color: 0x47a0b8,
                    description: `**From:** ${name} (${email})`,
                    fields: [
                        {
                            name: "📝 Subject",
                            value: subject,
                            inline: false
                        },
                        {
                            name: "💬 Message",
                            value: message.length > 1024
                                ? message.substring(0, 1021) + "..."
                                : message,
                            inline: false
                        }
                    ],
                    footer: {
                        text: "Robo Nexus Contact Form • robonexus.ais46@gmail.com"
                    },
                    timestamp: timestamp
                }]
            };

            const discordRes = await fetch(DISCORD_WEBHOOK_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(webhookBody)
            });

            discordSuccess = discordRes.ok;
            if (!discordRes.ok) {
                console.error("Discord webhook failed:", discordRes.status, await discordRes.text());
            }
        } catch (discordError) {
            console.error("Discord notification error:", discordError.message);
        }

        // ── 2. Supabase — Log submission to DB ───────────────────
        if (SUPABASE_URL && SUPABASE_ANON_KEY) {
            try {
                const sbRes = await fetch(`${SUPABASE_URL}/rest/v1/contact_submissions`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "apikey": SUPABASE_ANON_KEY,
                        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
                        "Prefer": "return=minimal"
                    },
                    body: JSON.stringify({
                        name: name,
                        email: email,
                        subject: subject,
                        message: message,
                        submitted_at: timestamp
                    })
                });

                supabaseSuccess = sbRes.ok;
                if (!sbRes.ok) {
                    const sbErr = await sbRes.text();
                    console.error("Supabase insert failed:", sbRes.status, sbErr);
                }
            } catch (sbError) {
                console.error("Supabase error:", sbError.message);
            }
        } else {
            console.warn("Supabase env vars not set — skipping DB log");
        }

        console.log(`Submission processed — Discord: ${discordSuccess}, Supabase: ${supabaseSuccess}`);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                message: "Submission received",
                discord: discordSuccess,
                logged: supabaseSuccess
            })
        };

    } catch (error) {
        console.error("Function error:", error.message);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ message: "Failed to process request" })
        };
    }
};