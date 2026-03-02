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
    const match = content.match(/Total_Lines[_-](\d+)/i);
    return match ? parseInt(match[1], 10) : null;
  }

  async function fetchGitHubStats() {
    try {
      // Fetch repos + README in parallel
      const [reposRes, readmeRes] = await Promise.all([
        fetch(`${API}/orgs/${ORG}/repos?per_page=100`),
        fetch(README_URL, { headers: { Accept: 'application/vnd.github.v3.raw' } }),
      ]);

      if (!reposRes.ok) throw new Error('Failed to fetch repos');
      const repos = await reposRes.json();
      const realRepos = repos.filter(r => r.name !== '.github');
      const totalStars = realRepos.reduce((sum, r) => sum + r.stargazers_count, 0);

      // Get line count from README (includes private repos)
      let totalLines = null;
      if (readmeRes.ok) {
        const readmeText = await readmeRes.text();
        totalLines = parseLinesFromReadme(readmeText);
      }

      // Fetch languages for each public repo in parallel
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

      const totalBytes = Object.values(allLangs).reduce((a, b) => a + b, 0);
      const langCount = Object.keys(allLangs).length;
      const sortedLangs = Object.entries(allLangs).sort((a, b) => b[1] - a[1]);

      // Use 5 repos (README says "all 5 repositories" including private)
      updateStat('stat-repos', 5);
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
