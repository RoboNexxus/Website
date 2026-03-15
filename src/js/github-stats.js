/* ===============================
   GITHUB STATS - Live from GitHub API
   Fetches org data + README line count from RoboNexxus
   Line count comes from .github/Profile/Readme.md badge
   (updated by GitHub Actions on every commit, includes private repos)
================================ */

(function () {
  const ORG = 'RoboNexxus';
  const API = 'https://api.github.com';
  const README_URL = `${API}/repos/${ORG}/.github/contents/Profile/Readme.md`;

  const LANG_COLORS = {
    Python: '#3572A5',
    TypeScript: '#3178c6',
    JavaScript: '#f1e05a',
    HTML: '#e34c26',
    CSS: '#563d7c',
    Shell: '#89e051',
    Nix: '#7e7eff',
    Procfile: '#3B2F63',
    'C++': '#f34b7d',
    C: '#555555',
  };

  function animateCount(el, target, duration) {
    if (typeof gsap === 'undefined') {
      el.textContent = target.toLocaleString();
      return;
    }
    const obj = { val: 0 };
    gsap.to(obj, {
      val: target,
      duration: duration || 2,
      ease: 'power2.out',
      onUpdate: () => {
        el.textContent = Math.round(obj.val).toLocaleString();
      },
    });
  }

  // Parse total lines from the README badge: Total_Lines-XXXXX
  function parseLinesFromReadme(content) {
    const match = content.match(/Total_Lines[_-]([\d,]+)/i);
    return match ? parseInt(match[1].replace(/,/g, ''), 10) : null;
  }

  // Parse repo count from README: "Across all X repositories"
  function parseRepoCountFromReadme(content) {
    // Try plain text first
    const textMatch = content.match(/Across all (\d+) repositories/i);
    if (textMatch) return parseInt(textMatch[1], 10);
    
    // Fall back to badge
    const badgeMatch = content.match(/Repositories-(\d+)-00d9ff/i);
    return badgeMatch ? parseInt(badgeMatch[1], 10) : null;
  }

  // Parse language breakdown from README comment: <!-- LANG_DATA:Python:12345,JavaScript:6789 -->
  function parseLangsFromReadme(content) {
    const match = content.match(/<!-- LANG_DATA:(.+?) -->/);
    if (!match) return null;
    const langs = {};
    match[1].split(',').forEach(pair => {
      const [lang, lines] = pair.split(':');
      if (lang && lines) langs[lang] = parseInt(lines, 10);
    });
    return Object.keys(langs).length > 0 ? langs : null;
  }

  async function fetchGitHubStats() {
    try {
      // Fetch repos (public) + README (has all data including private) in parallel
      const [reposRes, readmeRes] = await Promise.all([
        fetch(`${API}/orgs/${ORG}/repos?per_page=100`),
        fetch(README_URL, { headers: { Accept: 'application/vnd.github.v3.raw' } }),
      ]);

      if (!reposRes.ok) throw new Error('Failed to fetch repos');
      const repos = await reposRes.json();
      const realRepos = repos.filter(r => r.name !== '.github');
      const totalStars = realRepos.reduce((sum, r) => sum + r.stargazers_count, 0);

      // Parse README for accurate stats (includes private repos)
      let totalLines = null;
      let repoCount = null;
      let readmeLangs = null;
      if (readmeRes.ok) {
        const readmeText = await readmeRes.text();
        totalLines = parseLinesFromReadme(readmeText);
        repoCount = parseRepoCountFromReadme(readmeText);
        readmeLangs = parseLangsFromReadme(readmeText);
      }

      // Use README language data if available, otherwise fall back to API
      let sortedLangs;
      let totalBytes;

      if (readmeLangs) {
        totalBytes = Object.values(readmeLangs).reduce((a, b) => a + b, 0);
        sortedLangs = Object.entries(readmeLangs).sort((a, b) => b[1] - a[1]);
      } else {
        // Fallback: fetch languages from public repos only
        const langPromises = realRepos.map(r =>
          fetch(`${API}/repos/${ORG}/${r.name}/languages`).then(res => res.json())
        );
        const langResults = await Promise.all(langPromises);
        const allLangs = {};
        langResults.forEach(langObj => {
          Object.entries(langObj).forEach(([lang, bytes]) => {
            allLangs[lang] = (allLangs[lang] || 0) + bytes;
          });
        });
        totalBytes = Object.values(allLangs).reduce((a, b) => a + b, 0);
        sortedLangs = Object.entries(allLangs).sort((a, b) => b[1] - a[1]);
      }

      const langCount = sortedLangs.length;

      updateStat('stat-repos', repoCount || realRepos.length);
      updateStat('stat-lines', totalLines || Math.round(totalBytes / 40));
      updateStat('stat-stars', totalStars);
      updateStat('stat-langs', langCount);

      renderLangBar(sortedLangs, totalBytes);
    } catch (err) {
      console.error('GitHub stats error:', err);
      updateStat('stat-repos', 5);
      updateStat('stat-lines', 46453);
      updateStat('stat-stars', 6);
      updateStat('stat-langs', 6);
    }
  }

  function updateStat(id, value) {
    const card = document.getElementById(id);
    if (!card) return;
    const numEl = card.querySelector('.stat-number');
    if (!numEl) return;
    numEl.setAttribute('data-target', value);

    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.create({
        trigger: card,
        start: 'top 85%',
        once: true,
        onEnter: () => animateCount(numEl, value, 2),
      });
    } else {
      animateCount(numEl, value, 2);
    }
  }

  function renderLangBar(sortedLangs, totalBytes) {
    const bar = document.getElementById('lang-bar');
    const legend = document.getElementById('lang-legend');
    if (!bar || !legend) return;

    const threshold = 0.01;
    const mainLangs = [];
    let otherBytes = 0;

    sortedLangs.forEach(([lang, bytes]) => {
      if (bytes / totalBytes >= threshold) {
        mainLangs.push([lang, bytes]);
      } else {
        otherBytes += bytes;
      }
    });
    if (otherBytes > 0) mainLangs.push(['Other', otherBytes]);

    bar.innerHTML = mainLangs
      .map(([lang, bytes]) => {
        const color = LANG_COLORS[lang] || '#666';
        return `<div class="lang-bar-segment" style="width:0%;background:${color}" data-pct="${((bytes / totalBytes) * 100).toFixed(1)}" title="${lang}: ${((bytes / totalBytes) * 100).toFixed(1)}%"></div>`;
      })
      .join('');

    legend.innerHTML = mainLangs
      .map(([lang, bytes]) => {
        const color = LANG_COLORS[lang] || '#666';
        const pct = ((bytes / totalBytes) * 100).toFixed(1);
        return `<div class="lang-legend-item"><span class="lang-legend-dot" style="background:${color}"></span>${lang} <span class="lang-legend-pct">${pct}%</span></div>`;
      })
      .join('');

    const segments = bar.querySelectorAll('.lang-bar-segment');
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.create({
        trigger: bar,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          segments.forEach(seg => {
            gsap.to(seg, {
              width: seg.dataset.pct + '%',
              duration: 1.5,
              ease: 'power2.out',
              delay: 0.2,
            });
          });
        },
      });
    } else {
      segments.forEach(seg => {
        seg.style.width = seg.dataset.pct + '%';
      });
    }
  }

  if (document.getElementById('github-stats-grid')) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fetchGitHubStats);
    } else {
      fetchGitHubStats();
    }
  }
})();
