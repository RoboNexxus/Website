# Contact Form Setup Guide

## Dual System: Email + Discord Notifications

Your contact form now sends:
1. ✅ **Email** to robonexus.ais46@gmail.com (via Web3Forms)
2. ✅ **Discord notification** with full message content (via Discord Webhook)

---

## Setup Instructions

### Step 1: Get Web3Forms Access Key (for Email)

1. Go to https://web3forms.com/
2. Click **"Create Access Key"** (no signup needed for free plan!)
3. Enter your email: **robonexus.ais46@gmail.com**
4. Click **"Create Access Key"**
5. Copy the access key (looks like: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)
6. Open `src/js/contact.js`
7. Replace `YOUR_WEB3FORMS_ACCESS_KEY_HERE` with your actual key
8. Save the file

**Web3Forms Free Plan:**
- 250 submissions/month
- Email delivery to robonexus.ais46@gmail.com
- 30-day submission storage
- 100% free forever

### Step 2: Discord Webhook (Already Done! ✅)

Your Discord webhook is already configured:
```
https://discord.com/api/webhooks/1475461950719660212/...
```

This will send instant notifications to your Discord server with the full message content.

---

## How It Works

When someone submits the contact form:

1. **Web3Forms** sends an email to robonexus.ais46@gmail.com
2. **Discord** gets a notification with:
   - Sender's name and email
   - Subject
   - Full message
   - Timestamp

You get BOTH email and Discord notification for every submission!

---

## What You Get

### Email (via Web3Forms):
- Professional email to robonexus.ais46@gmail.com
- Contains all form details
- Can reply directly to sender
- Permanent record in your inbox

### Discord (via Webhook):
- Instant notification
- Beautiful formatted embed
- See submissions in real-time
- Great for team collaboration

---

## Testing

1. Open your website
2. Go to Contact page
3. Fill out the form
4. Click Submit
5. Check:
   - ✅ Your Gmail inbox (robonexus.ais46@gmail.com)
   - ✅ Your Discord channel

---

## Troubleshooting

### Not receiving emails?
- Check spam folder
- Verify Web3Forms access key is correct
- Make sure you entered robonexus.ais46@gmail.com when creating the key

### Not receiving Discord notifications?
- Your webhook is already set up correctly
- If it stops working, the webhook might have been deleted
- Create a new webhook and update the URL in contact.js

### Form shows error?
- Check browser console (F12) for errors
- Make sure both access key and webhook URL are correct
- Test your internet connection

---

## Security Notes

- Web3Forms access key is visible in frontend code (this is normal and safe)
- Discord webhook URL is also visible (can only post to that channel)
- For a school/personal website, this is perfectly fine
- If someone abuses it, you can regenerate both keys easily

---

## Cost

**100% FREE** ✅
- Web3Forms: Free forever (250 submissions/month)
- Discord: Free forever (unlimited messages)
- No credit card required
- No hidden fees

---

**That's it!** Just add your Web3Forms access key and you're done! 🚀
