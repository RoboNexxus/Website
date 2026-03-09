exports.handler = async function (event, context) {
    const headers = {
        "Content-Type": "application/json"
    };

    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ message: "Method Not Allowed" })
        };
    }

    let emailSuccess = false;

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

        const WEB3FORMS_KEY = process.env.WEB3FORMS_KEY;
        const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

        if (!WEB3FORMS_KEY || !DISCORD_WEBHOOK_URL) {
            console.error("Missing environment variables");
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ message: "Server configuration error" })
            };
        }

        // 1. Send to Web3Forms
        try {
            const web3formsData = {
                access_key: WEB3FORMS_KEY,
                name: name,
                email: email,
                subject: subject,
                message: message
            };

            const emailResponse = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify(web3formsData)
            });

            const emailResult = await emailResponse.json();
            if (emailResult.success) {
                emailSuccess = true;
            } else {
                console.error("Web3Forms error:", emailResult.message);
            }
        } catch (emailError) {
            console.error("Email submission failed:", emailError);
        }

        // 2. Send to Discord (Independent of Email)
        try {
            const webhookBody = {
                embeds: [{
                    title: "📧 New Contact Form Submission",
                    color: 0x00ff00, // Green color
                    description: `**From:** ${name} (${email})`,
                    fields: [
                        { name: "📝 Subject", value: subject, inline: false },
                        { name: "💬 Message", value: message.length > 1024 ? message.substring(0, 1021) + "..." : message, inline: false }
                    ],
                    footer: {
                        text: "Robo Nexus Contact Form • Email sent to robonexus.ais46@gmail.com"
                    },
                    timestamp: new Date().toISOString()
                }]
            };

            await fetch(DISCORD_WEBHOOK_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(webhookBody),
            });
        } catch (discordError) {
            console.error("Discord notification failed:", discordError);
        }

        if (emailSuccess) {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ message: "Success" })
            };
        } else {
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ message: "Failed to send email" })
            };
        }

    } catch (error) {
        console.error("Function error:", error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ message: "Failed to process request" })
        };
    }
};
