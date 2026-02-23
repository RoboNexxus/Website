async function sendMail() {
    // Get form values
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const subject = document.getElementById("subject").value;
    const message = document.getElementById("message").value;

    // Validate fields
    if (!name || !email || !subject || !message) {
        toast.error("Missing Information", "Please fill in all fields before submitting.");
        return;
    }

    // Show loading state
    const submitBtn = document.querySelector(".contact-send-button");
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitBtn.disabled = true;

    try {
        // 1. Send to Web3Forms (sends email to robonexus.ais46@gmail.com)
        const web3formsData = new FormData();
        web3formsData.append("access_key", "50c6d094-5720-4448-a5b4-ec23f718a12f");
        web3formsData.append("name", name);
        web3formsData.append("email", email);
        web3formsData.append("subject", subject);
        web3formsData.append("message", message);

        const emailResponse = await fetch("https://api.web3forms.com/submit", {
            method: "POST",
            body: web3formsData
        });

        const emailResult = await emailResponse.json();

        if (!emailResult.success) {
            throw new Error("Failed to send email");
        }

        // 2. Send to Discord (for instant notification)
        const webhookUrl = "https://discord.com/api/webhooks/1475461950719660212/wUzEzMNmNeRuWuJ5PrQQn0ql1hA52Z1aaY1VkMXJImRz2wZLcvPUiJXAnE3LSr_QJbXD";
        
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

        // Send to Discord (don't fail if this doesn't work)
        await fetch(webhookUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(webhookBody),
        }).catch(err => console.log("Discord notification failed:", err));

        // Clear form
        document.getElementById("name").value = "";
        document.getElementById("email").value = "";
        document.getElementById("subject").value = "";
        document.getElementById("message").value = "";
        
        // Success message with toast
        submitBtn.innerHTML = '<i class="fas fa-check"></i> Sent!';
        toast.success(
            "Message Sent Successfully!",
            "Thank you for reaching out. We'll get back to you soon.",
            5000
        );
        
        setTimeout(() => {
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
        }, 3000);

    } catch (error) {
        console.error("Error:", error);
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
        
        toast.error(
            "Failed to Send Message",
            "There was an error sending your message. Please try again or email us directly at robonexus.ais46@gmail.com",
            6000
        );
    }
}
