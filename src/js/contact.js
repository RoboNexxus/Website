async function sendMail() {
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const subject = document.getElementById("subject").value.trim();
    const message = document.getElementById("message").value.trim();

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
        const res = await fetch("/api/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, subject, message })
        });

        if (!res.ok) throw new Error("Server error");

        document.getElementById("name").value = "";
        document.getElementById("email").value = "";
        document.getElementById("subject").value = "";
        document.getElementById("message").value = "";

        submitBtn.innerHTML = '<span class="button-text"><i class="fas fa-check"></i> Sent!</span>';
        toast.success("Message Sent!", "We'll get back to you soon.", 5000);

        setTimeout(() => {
            submitBtn.innerHTML = originalBtnHTML;
            submitBtn.disabled = false;
        }, 3000);

    } catch (err) {
        submitBtn.innerHTML = originalBtnHTML;
        submitBtn.disabled = false;
        toast.error("Failed to Send", "Something went wrong. Email us directly at robonexus.ais46@gmail.com", 6000);
    }
}