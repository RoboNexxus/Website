# Robo Nexus — Induction System (Demo)

> **Notion Database ID:** `5a61b841eb8f4f1c9dab198fdae796b2`

---

## Notion DB Schema

| Field | Notion Type | Notes |
|---|---|---|
| Name | `title` | Applicant's full name — required |
| Email | `email` | Required, used for duplicate check |
| Class | `rich_text` | Current grade/class |
| GitHub | `url` | Optional |
| Skills | `multi_select` | See options below |
| Events Interested | `multi_select` | See options below |
| Previous Experience | `rich_text` | Free-form background text |
| Application Status | `select` | Default: **Applied** |
| Notes | `rich_text` | Website + extra links, auto-populated by API |

> **Skipped fields:** Phone (not needed), Discord Handle (optional — not submitted)

---

## Multi-Select Options

### Skills
`Robotics` · `Arduino` · `Python` · `Electronics` · `CAD/3D Modelling` · `Drone Piloting` · `AI/ML` · `Web Dev` · `Discord Bots` · `Video Editing` · `Builder` · `2D`

### Events Interested
`Robo War` · `Robo Soccer` · `Drone` · `Line Follower` · `Race` · `Innovation` · `Web/Tech`

### Application Status
`Applied` · `Shortlisted` · `Rejected` · `Selected`

---

## API Notes

- **Duplicate check:** queries by `Email` before inserting — returns `409` if already exists.
- **Notes field** is auto-built from `website` + `links` inputs:
  ```
  Website: https://...
  Links: linkedin.com/..., youtube.com/...
  ```
- **Default status** on submission: `Applied`

---

## Demo Code

### `apply.html`

```html
<!DOCTYPE html>
<html lang="en">

<head>
  <!-- Google Tag Manager -->
  <script>(function (w, d, s, l, i) { w[l] = w[l] || []; w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' }); var f = d.getElementsByTagName(s)[0], j = d.createElement(s), dl = l != 'dataLayer' ? '&l=' + l : ''; j.async = true; j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl; f.parentNode.insertBefore(j, f); })(window, document, 'script', 'dataLayer', 'GTM-53TPG7NL');</script>
  <!-- End Google Tag Manager -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-KKPK7KF3CQ"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    gtag('js', new Date());
    gtag('config', 'G-KKPK7KF3CQ');
  </script>

  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Join RoboNexus</title>

  <meta name="description" content="Apply to join RoboNexus — the official robotics club of Amity International School, Sector 46, Gurugram.">
  <meta property="og:title" content="Join RoboNexus">
  <meta property="og:description" content="Apply to join RoboNexus robotics club.">
  <meta property="og:image" content="https://robonexus46.vercel.app/src/assets/images/Robo_Nexus_Logo.webp">

  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; min-height: 100%; overflow-x: hidden; }
    body { background: #000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    .page-transition { position: fixed; inset: 0; background: #000; z-index: 9999; pointer-events: none; opacity: 0; display: none; }
    .page-content { position: relative; z-index: 1; min-height: 100vh; }
    #particle-canvas { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 0; pointer-events: none; }
  </style>

  <link rel="preload" as="image" href="/src/assets/images/Robo_Nexus_Logo.webp" />
  <link rel="preload" href="/src/css/style.css?v=82" as="style" />
  <link rel="stylesheet" href="/src/css/style.css?v=82" />
  <link rel="stylesheet" href="/src/css/subnav.css?v=82" />
  <link rel="stylesheet" href="/src/css/toast.css?v=82" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" media="print" onload="this.media='all'" />
  <noscript><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" /></noscript>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap" rel="stylesheet">
  <link rel="apple-touch-icon" sizes="180x180" href="/src/assets/images/apple-touch-icon.png">
  <link rel="icon" type="image/png" sizes="32x32" href="/src/assets/images/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/src/assets/images/favicon-16x16.png">

  <style>
    /* Force dark nav */
    .spotlight-nav {
      background: rgba(10, 10, 10, 0.95) !important;
      border: 1px solid rgba(255, 255, 255, 0.15) !important;
    }
    .nav-links { color: rgba(255, 255, 255, 0.6) !important; }
    .nav-links:hover { color: rgba(255, 255, 255, 0.9) !important; }
    .nav-links.active { color: #ffffff !important; }

    /* Hero */
    .apply-hero {
      text-align: center;
      padding: 52px 20px 20px;
      position: relative;
      z-index: 1;
    }
    .apply-hero .event-year {
      font-size: .88rem;
      letter-spacing: 6px;
      text-transform: uppercase;
      color: #47a0b8;
      margin-bottom: 10px;
      font-weight: 600;
    }

    /* Layout */
    .apply-outer {
      max-width: 860px;
      margin: 0 auto;
      padding: 28px 40px 80px;
    }

    /* Card */
    .apply-card {
      background: linear-gradient(135deg, rgba(18,18,18,.97), rgba(28,28,28,.97));
      border: 1px solid rgba(71,160,184,.25);
      border-radius: 20px;
      padding: 34px 30px;
      margin-bottom: 16px;
    }

    .apply-section-label {
      font-size: .72rem;
      color: rgba(255,255,255,.35);
      text-transform: uppercase;
      letter-spacing: 2px;
      font-weight: 600;
      margin-bottom: 18px;
      display: flex;
      align-items: center;
      gap: 7px;
    }
    .apply-section-label i { color: #47a0b8; font-size: .75rem; }

    .apply-divider {
      height: 1px;
      background: rgba(71,160,184,.1);
      margin: 22px 0 20px;
    }

    /* Fields */
    .apply-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 13px;
      margin-bottom: 13px;
    }

    .apply-field {
      display: flex;
      flex-direction: column;
      gap: 7px;
      margin-bottom: 13px;
    }
    .apply-field:last-child { margin-bottom: 0; }

    .apply-field label {
      font-size: .8rem;
      font-weight: 600;
      color: rgba(255,255,255,.5);
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .apply-field label i { color: #47a0b8; font-size: .73rem; }
    .apply-field label .req { color: #e74c3c; margin-left: 1px; }
    .apply-field label .opt { color: rgba(255,255,255,.25); font-size:.7rem; font-weight:400; margin-left:4px; }

    .apply-field input,
    .apply-field textarea {
      width: 100%;
      background: rgba(255,255,255,.04);
      border: 1px solid rgba(71,160,184,.2);
      padding: 11px 15px;
      border-radius: 10px;
      outline: none;
      font-size: .92rem;
      color: #fff;
      transition: border-color .25s, box-shadow .25s;
      font-family: inherit;
      resize: vertical;
    }
    .apply-field input::placeholder,
    .apply-field textarea::placeholder { color: rgba(255,255,255,.22); }
    .apply-field input:focus,
    .apply-field textarea:focus {
      border-color: #47a0b8;
      box-shadow: 0 0 0 3px rgba(71,160,184,.1);
    }
    .apply-field input.error { border-color: #e74c3c; box-shadow: 0 0 0 3px rgba(231,76,60,.1); }

    /* Multi-select chips */
    .chip-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .chip-item input[type="checkbox"] {
      position: absolute;
      opacity: 0;
      width: 0; height: 0;
    }

    .chip-item label {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 7px 14px;
      border: 1.5px solid rgba(71,160,184,.2);
      border-radius: 20px;
      cursor: pointer;
      font-size: .78rem;
      font-weight: 600;
      color: rgba(255,255,255,.45);
      transition: all .2s;
      background: rgba(71,160,184,.03);
      user-select: none;
    }

    .chip-item input:checked + label {
      border-color: #47a0b8;
      background: rgba(71,160,184,.12);
      color: #47a0b8;
    }

    .chip-item label:hover {
      border-color: rgba(71,160,184,.45);
      background: rgba(71,160,184,.07);
    }

    /* Submit */
    .apply-submit-btn {
      width: 100%;
      margin-top: 10px;
      padding: 15px 30px;
      font-weight: 700;
      font-size: 1rem;
      background: linear-gradient(135deg, #47a0b8, #02cadc);
      border: none;
      border-radius: 12px;
      cursor: pointer;
      color: #000;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      transition: all .3s ease;
    }
    .apply-submit-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 12px 35px rgba(71,160,184,.35);
    }
    .apply-submit-btn:disabled { opacity: .65; cursor: not-allowed; }

    /* Responsive */
    @media (max-width: 640px) {
      .apply-outer { padding: 20px 15px 60px; }
      .apply-row { grid-template-columns: 1fr; }
      .apply-card { padding: 22px 15px; }
    }
  </style>
</head>

<body class="sticky-nav">
  <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-53TPG7NL" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>

  <canvas id="particle-canvas"></canvas>
  <div class="page-transition"></div>

  <nav class="navbar">
    <div class="navbar-content">
      <div class="nav-logo-wrap">
        <div class="nav-logo">
          <a href="/"><img src="/src/assets/images/Robo_Nexus_Logo.webp" alt="Robo Nexus Logo" /></a>
        </div>
        <a href="/" class="nav-logo-pill">
          <img src="/src/assets/images/Robo_Nexus_Logo.webp" alt="Robo Nexus" />
        </a>
      </div>
      <div class="spotlight-nav-container">
        <div class="spotlight-nav">
          <ul class="nav-links-ul">
            <li><a class="nav-links" href="/" data-index="0">Home</a></li>
            <li><a class="nav-links" href="/about" data-index="1">About</a></li>
            <li><a class="nav-links" href="/team" data-index="2">Team</a></li>
            <li><a class="nav-links" href="/projects" data-index="3">Projects</a></li>
            <li><a class="nav-links" href="/events" data-index="4">Events</a></li>
            <li><a class="nav-links" href="/contact" data-index="5">Contact</a></li>
          </ul>
          <div class="navbar-spotlight-overlay"></div>
        </div>
      </div>
      <div class="hamburger"><span></span><span></span><span></span></div>
    </div>
  </nav>

  <div class="page-content">
    <section class="apply-hero reveal">
      <p class="event-year">RoboNexus</p>
      <h1 class="page-title">Join the Club</h1>
      <p class="hero-subtitle">Tell us about yourself and your robotics journey</p>
    </section>

    <div class="apply-outer">

      <!-- CARD 1: Identity -->
      <div class="apply-card reveal">
        <p class="apply-section-label"><i class="fas fa-user"></i> Basic Information</p>

        <div class="apply-row">
          <div class="apply-field">
            <label><i class="fas fa-user"></i> Full Name <span class="req">*</span></label>
            <input type="text" id="apply-name" placeholder="e.g. Robo Nexus" />
          </div>
          <div class="apply-field">
            <label><i class="fas fa-envelope"></i> Email <span class="req">*</span></label>
            <input type="email" id="apply-email" placeholder="you@email.com" />
          </div>
        </div>

        <div class="apply-row">
          <div class="apply-field">
            <label><i class="fab fa-github"></i> GitHub <span class="opt">(optional)</span></label>
            <input type="url" id="apply-github" placeholder="https://github.com/username" />
          </div>
          <div class="apply-field">
            <label><i class="fas fa-globe"></i> Website <span class="opt">(optional)</span></label>
            <input type="url" id="apply-website" placeholder="https://yoursite.com" />
          </div>
        </div>

        <div class="apply-field">
          <label><i class="fas fa-link"></i> Other Links <span class="opt">(optional)</span></label>
          <input type="text" id="apply-links" placeholder="LinkedIn, portfolio, Hackaday, YouTube — any relevant links" />
        </div>
      </div>

      <!-- CARD 2: Robotics -->
      <div class="apply-card reveal">
        <p class="apply-section-label"><i class="fas fa-microchip"></i> Robotics & Tech Skills</p>

        <div class="chip-grid" id="skills-grid">
          <!-- injected by JS -->
        </div>

        <div class="apply-divider"></div>

        <p class="apply-section-label"><i class="fas fa-trophy"></i> Events Interested In</p>

        <div class="chip-grid" id="events-grid">
          <!-- injected by JS -->
        </div>

        <div class="apply-divider"></div>

        <div class="apply-field">
          <label><i class="fas fa-robot"></i> Robotics Experience</label>
          <textarea id="apply-experience" rows="5"
            placeholder="Tell us about your robotics background — projects you've built, competitions you've participated in, hardware you've worked with, anything relevant. No experience needed, just be honest."></textarea>
        </div>
      </div>

      <!-- Submit -->
      <div class="apply-card reveal">
        <p class="apply-section-label"><i class="fas fa-paper-plane"></i> Submit Application</p>
        <p style="font-size:.85rem;color:rgba(255,255,255,.45);margin-bottom:18px;line-height:1.6;">
          Your application goes directly to the RoboNexus team. We'll reach out over email if you're shortlisted for an interview.
        </p>
        <button class="apply-submit-btn" id="apply-submit-btn" onclick="submitApplication()">
          <i class="fas fa-rocket"></i>
          Submit Application
        </button>
      </div>

    </div>

    <footer class="footer">
      <p>&copy; 2026 Robo Nexus. All rights reserved.</p>
    </footer>
  </div>

  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js" defer></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js" defer></script>
  <script src="/src/js/toast.js?v=82" defer></script>
  <script src="/src/js/subnav.js?v=82" defer></script>
  <script src="/src/js/spotlight-navbar.js?v=82" defer></script>
  <script src="/src/js/particles.js?v=82" defer></script>
  <script src="/src/js/script.js?v=82" defer></script>
  <script src="/src/js/prefetch.js?v=82" defer></script>
  <script src="/src/js/protection.js?v=82" defer></script>
  <script src="/src/js/animations.js?v=82" defer></script>

  <script>
    const SKILLS = [
      'Robotics', 'Arduino', 'Python', 'Electronics', 'CAD/3D Modelling',
      'Drone Piloting', 'AI/ML', 'Web Dev', 'Discord Bots', 'Video Editing', 'Builder', '2D'
    ];

    const EVENTS = [
      { label: '⚔️ Robo War', value: 'Robo War' },
      { label: '⚽ Robo Soccer', value: 'Robo Soccer' },
      { label: '🚁 Drone', value: 'Drone' },
      { label: '〰️ Line Follower', value: 'Line Follower' },
      { label: '🏁 Race', value: 'Race' },
      { label: '💡 Innovation', value: 'Innovation' },
      { label: '💻 Web/Tech', value: 'Web/Tech' },
    ];

    function buildChips(items, containerId, namePrefix) {
      const container = document.getElementById(containerId);
      container.innerHTML = items.map((item, i) => {
        const val = typeof item === 'string' ? item : item.value;
        const label = typeof item === 'string' ? item : item.label;
        const id = `${namePrefix}-${i}`;
        return `
          <div class="chip-item">
            <input type="checkbox" id="${id}" value="${val}" name="${namePrefix}">
            <label for="${id}">${label}</label>
          </div>
        `;
      }).join('');
    }

    document.addEventListener('DOMContentLoaded', function () {
      buildChips(SKILLS, 'skills-grid', 'skill');
      buildChips(EVENTS, 'events-grid', 'event');
    });

    function getChecked(name) {
      return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`)).map(el => el.value);
    }

    async function submitApplication() {
      const name     = document.getElementById('apply-name').value.trim();
      const email    = document.getElementById('apply-email').value.trim();
      const github   = document.getElementById('apply-github').value.trim();
      const website  = document.getElementById('apply-website').value.trim();
      const links    = document.getElementById('apply-links').value.trim();
      const experience = document.getElementById('apply-experience').value.trim();
      const skills          = getChecked('skill');
      const eventsInterested = getChecked('event');

      if (!name) {
        document.getElementById('apply-name').classList.add('error');
        toast.error('Missing Field', 'Please enter your name.');
        return;
      }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        document.getElementById('apply-email').classList.add('error');
        toast.error('Invalid Email', 'Please enter a valid email address.');
        return;
      }

      document.getElementById('apply-name').classList.remove('error');
      document.getElementById('apply-email').classList.remove('error');

      const btn = document.getElementById('apply-submit-btn');
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

      try {
        const res = await fetch('/api/apply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, github, website, links, skills, eventsInterested, experience }),
        });

        const data = await res.json();

        if (res.status === 409) {
          btn.disabled = false;
          btn.innerHTML = '<i class="fas fa-rocket"></i> Submit Application';
          toast.error('Already Applied', 'An application with this email already exists.');
          return;
        }

        if (!res.ok) throw new Error(data.message || 'Server error');

        ['apply-name','apply-email','apply-github','apply-website','apply-links','apply-experience']
          .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
        document.querySelectorAll('#skills-grid input, #events-grid input').forEach(el => el.checked = false);

        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-check"></i> Application Submitted!';
        toast.success('Application Received!', "We'll reach out if you're shortlisted. Keep building.", 7000);

        setTimeout(() => {
          btn.innerHTML = '<i class="fas fa-rocket"></i> Submit Application';
        }, 4000);

      } catch (err) {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-rocket"></i> Submit Application';
        toast.error('Submission Failed', 'Something went wrong. Please try again.', 6000);
      }
    }
  </script>
</body>
</html>
```

---

### `api/apply.js`

```js
const NOTION_DB = '5a61b841eb8f4f1c9dab198fdae796b2'; // updated

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  try {
    const { name, email, github, website, links, skills, eventsInterested, experience } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    const NOTION_TOKEN = process.env.NOTION_TOKEN;
    if (!NOTION_TOKEN) return res.status(500).json({ message: 'Server configuration error' });

    const NOTION_HEADERS = {
      Authorization: `Bearer ${NOTION_TOKEN}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
    };

    // Duplicate check
    try {
      const dupRes = await fetch(`https://api.notion.com/v1/databases/${NOTION_DB}/query`, {
        method: 'POST',
        headers: NOTION_HEADERS,
        body: JSON.stringify({
          filter: { property: 'Email', email: { equals: email } },
          page_size: 1,
        }),
      });
      const dupData = await dupRes.json();
      if (dupData.results?.length > 0) {
        return res.status(409).json({ message: 'An application with this email already exists.' });
      }
    } catch (_) {}

    // Build Notes from website + extra links
    const notesParts = [];
    if (website?.trim()) notesParts.push(`Website: ${website.trim()}`);
    if (links?.trim())   notesParts.push(`Links: ${links.trim()}`);

    const notionBody = {
      parent: { database_id: NOTION_DB },
      properties: {
        Name:  { title: [{ text: { content: name } }] },
        Email: { email },
        ...(github?.trim() ? { GitHub: { url: github.trim() } } : {}),
        Skills: {
          multi_select: (Array.isArray(skills) ? skills : [])
            .filter(Boolean).map(s => ({ name: s })),
        },
        'Events Interested': {
          multi_select: (Array.isArray(eventsInterested) ? eventsInterested : [])
            .filter(Boolean).map(e => ({ name: e })),
        },
        ...(experience?.trim()
          ? { 'Previous Experience': { rich_text: [{ text: { content: experience.trim() } }] } }
          : {}),
        ...(notesParts.length
          ? { Notes: { rich_text: [{ text: { content: notesParts.join('\n') } }] } }
          : {}),
        'Application Status': { select: { name: 'Applied' } },
      },
    };

    const notionRes = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: NOTION_HEADERS,
      body: JSON.stringify(notionBody),
    });

    if (!notionRes.ok) {
      const err = await notionRes.text();
      console.error('Notion error:', err);
      return res.status(500).json({ message: 'Failed to save application' });
    }

    return res.status(200).json({ message: 'Application submitted successfully' });

  } catch (error) {
    console.error('Apply error:', error.message);
    return res.status(500).json({ message: 'Failed to process application' });
  }
}
```
