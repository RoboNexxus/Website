exports.handler = async function (event) {
    const headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "https://robonexusaisg46.netlify.app",
        "Cache-Control": "public, max-age=3600"
    };

    if (event.httpMethod === "OPTIONS") {
        return { statusCode: 204, headers, body: "" };
    }

    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY;

    if (!url || !key) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: "Supabase config not set in environment" })
        };
    }

    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ url, key })
    };
};