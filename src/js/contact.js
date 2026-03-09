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
    const originalBtnHTML = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="button-text"><i class="fas fa-spinner fa-spin"></i> Sending...</span>';
    submitBtn.disabled = true;

    try {
        // Send data to our secure serverless function
        const response = await fetch("/.netlify/functions/contact", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name, email, subject, message }),
        });

        if (!response.ok) {
            throw new Error("Failed to submit form");
        }

        // Clear form
        document.getElementById("name").value = "";
        document.getElementById("email").value = "";
        document.getElementById("subject").value = "";
        document.getElementById("message").value = "";

        // Success message with toast
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
            "There was an error sending your message. Please try again or email us directly at robonexus.ais46@gmail.com",
            6000
        );
    }
}
