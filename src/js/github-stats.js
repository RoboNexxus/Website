/* ===============================
   GITHUB STATS - Live from GitHub API
   Fetches org data from RoboNexxus
================================ */

(function () {
  const ORG = 'RoboNexxus';
  const API = 'https://api.github.com';

  const LANG_COLORS = {
    Python: '#3572A5',
    TypeScript: '#3178c6',
    JavaScript: '#f1e05a',
    HTML: '#e34c26',
    CSS: '#563d7c',
    Shell: '#89e051',
    Nix: '#7e7eff',
    Procfile: '#3B2F63',
  };

  // Animated counter
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

  async function fetchGitHubStats() {
    try {
      // Fetch repos
      const reposRes = await fetch(`${API}/orgs/${ORG}/repos?per_page=100`);
      if (!reposRes.ok) throw new Error('Failed to fetch repos');
      const repos = await reposRes.json();

      // Filter out .github meta repo
      const realRepos = repos.filter(r => r.name !== '.github');

      const repoCount = realRepos.length;
      const totalStars = realRepos.reduce((sum, r) => sum + r.stargazers_count, 0);

      // Fetch languages for each repo in parallel
      const langPromises = realRepos.map(r =>
        fetch(`${API}/repos/${ORG}/${r.name}/languages`).then(res => res.json())
      );
      const langResults = await Promise.all(langPromises);

      // Aggregate languages
      const allLangs = {};
      langResults.forEach(langObj => {
        Object.entries(langObj).forEach(([lang, bytes]) => {
          allLangs[lang] = (allLangs[lang] || 0) + bytes;
        });
      });

      const totalBytes = Object.values(allLangs).reduce((a, b) => a + b, 0);
      const estimatedLines = Math.round(totalBytes / 40);
      const langCount = Object.keys(allLangs).length;

      // Sort languages by bytes descending
      const sortedLangs = Object.entries(allLangs).sort((a, b) => b[1] - a[1]);

      // Update stat cards with animated counters
      updateStat('stat-repos', repoCount);
      updateStat('stat-lines', estimatedLines);
      updateStat('stat-stars', totalStars);
      updateStat('stat-langs', langCount);

      // Render language bar
      renderLangBar(sortedLangs, totalBytes);
    } catch (err) {
      console.error('GitHub stats error:', err);
      // Fallback to hardcoded values
      updateStat('stat-repos', 4);
      updateStat('stat-lines', 37000);
      updateStat('stat-stars', 5);
      updateStat('stat-langs', 6);
    }
  }

  function updateStat(id, value) {
    const card = document.getElementById(id);
    if (!card) return;
    const numEl = card.querySelector('.stat-number');
    if (!numEl) return;
    numEl.setAttribute('data-target', value);

    // Use ScrollTrigger to animate when visible
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

    // Group small languages into "Other"
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

    // Render bar segments (start at 0 width, animate in)
    bar.innerHTML = mainLangs
      .map(([lang, bytes]) => {
        const color = LANG_COLORS[lang] || '#666';
        return `<div class="lang-bar-segment" style="width:0%;background:${color}" data-pct="${((bytes / totalBytes) * 100).toFixed(1)}" title="${lang}: ${((bytes / totalBytes) * 100).toFixed(1)}%"></div>`;
      })
      .join('');

    // Render legend
    legend.innerHTML = mainLangs
      .map(([lang, bytes]) => {
        const color = LANG_COLORS[lang] || '#666';
        const pct = ((bytes / totalBytes) * 100).toFixed(1);
        return `<div class="lang-legend-item"><span class="lang-legend-dot" style="background:${color}"></span>${lang} <span class="lang-legend-pct">${pct}%</span></div>`;
      })
      .join('');

    // Animate bar segments when scrolled into view
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

  // Initialize
  if (document.getElementById('github-stats-grid')) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fetchGitHubStats);
    } else {
      fetchGitHubStats();
    }
  }
})();
