/**
 * RoboNexus '26 — Second Navbar
 * Injects a proper pill navbar (matching the main nav style)
 * immediately after .navbar on every page.
 *
 * Add to every HTML page:
 *   <link rel="stylesheet" href="/src/css/subnav.css?v=22.0" />
 *   <script src="/src/js/subnav.js?v=22.0" defer></script>
 */
(function () {

  const SUBNAV_HTML = `
    <div class="rn26-navbar" id="rn26-navbar" role="navigation" aria-label="RoboNexus '26">
      <div class="rn26-pill" id="rn26-pill">

        <!-- Event label -->
        <div class="rn26-pill-label">
          <span class="rn26-dot"></span>
          <span class="rn26-year">RoboNexus '26</span>
        </div>

        <!-- Nav links — currently just Register -->
        <ul class="rn26-pill-links" id="rn26-links">
          <li>
            <a class="rn26-pill-link" href="/register" id="rn26-link-register">
              <i class="fas fa-rocket"></i>
              Register
            </a>
          </li>
        </ul>

        <!-- Spotlight + ambience (mirrors main navbar) -->
        <div class="rn26-spotlight" id="rn26-spotlight"></div>
        <div class="rn26-ambience"  id="rn26-ambience"></div>

      </div>
    </div>
  `;

  /* ── Inject after .navbar ── */
  function inject() {
    const navbar = document.querySelector('.navbar');
    if (!navbar || document.getElementById('rn26-navbar')) return;
    navbar.insertAdjacentHTML('afterend', SUBNAV_HTML);
    initSpotlight();
    setActiveLink();
  }

  /* ── Mark current page link as active ── */
  function setActiveLink() {
    const path = window.location.pathname.replace(/\/$/, '') || '/';
    const registerLink = document.getElementById('rn26-link-register');
    if (!registerLink) return;

    // Mark active + position ambience on it
    if (path === '/register' || path.endsWith('/register')) {
      registerLink.classList.add('rn26-active');
    }

    // Always position ambience on the register link (it's the only one)
    positionAmbienceOn(registerLink);
  }

  /* ── Spotlight / ambience behaviour (mirrors spotlight-navbar.js) ── */
  function initSpotlight() {
    const pill = document.getElementById('rn26-pill');
    const spotlight = document.getElementById('rn26-spotlight');
    const ambience = document.getElementById('rn26-ambience');
    if (!pill || !spotlight || !ambience) return;

    pill.addEventListener('mousemove', function (e) {
      const rect = pill.getBoundingClientRect();
      const x = e.clientX - rect.left;
      spotlight.style.setProperty('--rn26-x', x + 'px');
      spotlight.style.opacity = '1';
    });

    pill.addEventListener('mouseleave', function () {
      spotlight.style.opacity = '0';
    });
  }

  function positionAmbienceOn(linkEl) {
    const ambience = document.getElementById('rn26-ambience');
    const pill = document.getElementById('rn26-pill');
    if (!ambience || !pill || !linkEl) return;

    // Use rAF so layout is settled
    requestAnimationFrame(function () {
      const pillRect = pill.getBoundingClientRect();
      const linkRect = linkEl.getBoundingClientRect();
      const x = linkRect.left - pillRect.left + linkRect.width / 2;
      ambience.style.setProperty('--rn26-amb-x', x + 'px');
    });
  }

  /* ── Boot ── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }

})();