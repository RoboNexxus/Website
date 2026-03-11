async function sendMail() {
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const subject = document.getElementById("subject").value;
    const message = document.getElementById("message").value;

    if (!name || !email || !subject || !message) {
        toast.error("Missing Information", "Please fill in all fields before submitting.");
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        toast.error("Invalid Email", "Please enter a valid email address.");
        return;
    }

    const submitBtn = document.querySelector(".contact-send-button");
    const originalBtnHTML = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="button-text"><i class="fas fa-spinner fa-spin"></i> Sending...</span>';
    submitBtn.disabled = true;

    try {
        // 1. Web3Forms called directly from browser — avoids Cloudflare bot block
        const web3Response = await fetch("https://api.web3forms.com/submit", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                access_key: "YOUR_NEW_WEB3FORMS_KEY_HERE",
                name: name,
                email: email,
                subject: subject,
                message: message
            })
        });

        const web3Result = await web3Response.json();
        if (!web3Result.success) {
            throw new Error(web3Result.message || "Web3Forms rejected the submission");
        }

        // 2. Discord notification via Netlify function (server-side is fine for Discord)
        await fetch("/.netlify/functions/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, subject, message })
        }).catch(err => console.warn("Discord notification failed:", err));
        // Non-fatal — if Discord fails, email already sent so don't throw

        // Clear form
        document.getElementById("name").value = "";
        document.getElementById("email").value = "";
        document.getElementById("subject").value = "";
        document.getElementById("message").value = "";

        submitBtn.innerHTML = '<span class="button-text"><i class="fas fa-check"></i> Sent!</span>';
        toast.success(
            "Message Sent Successfully!",
            "Thank you for reaching out. We'll get back to you soon.",
            5000
        );

        setTimeout(() => {
            submitBtn.innerHTML = originalBtnHTML;
            submitBtn.disabled = false;
        }, 3000);

    } catch (error) {
        console.error("Error:", error);
        submitBtn.innerHTML = originalBtnHTML;
        submitBtn.disabled = false;

        toast.error(
            "Failed to Send Message",
            error.message || "There was an error sending your message. Please try again or email us directly at robonexus.ais46@gmail.com",
            6000
        );
    }
}