/**
 * RoboNexus '26 — Second Navbar
 * Injects a proper pill navbar immediately after .navbar on every page.
 *
 * Add to every HTML page:
 *   <link rel="stylesheet" href="/src/css/subnav.css?v=43" />
 *   <script src="/src/js/subnav.js?v=43" defer></script>
 */
(function () {

  const PILL_HTML = `
    <div class="rn26-pill" id="rn26-pill">
      <div class="rn26-pill-label">
        <span class="rn26-dot"></span>
        <span class="rn26-year">RoboNexus '26</span>
      </div>
      <ul class="rn26-pill-links" id="rn26-links">
        <li>
          <a class="rn26-pill-link" href="/register" id="rn26-link-register">
            <i class="fas fa-rocket"></i>
            Register
          </a>
        </li>
      </ul>
      <div class="rn26-spotlight" id="rn26-spotlight"></div>
      <div class="rn26-ambience"  id="rn26-ambience"></div>
    </div>
  `;

  /* ── Inject into .spotlight-nav-container, after the main nav ── */
  function inject() {
    const navContainer = document.querySelector('.spotlight-nav-container');
    if (!navContainer || document.getElementById('rn26-pill')) return;

    navContainer.insertAdjacentHTML('beforeend', PILL_HTML);
    
    initSpotlight();
    setActiveLink();
  }

  /* ── Mark active link + kill main nav glow on register page ── */
  function setActiveLink() {
    const path = window.location.pathname.replace(/\/$/, '') || '/';
    const registerLink = document.getElementById('rn26-link-register');
    if (!registerLink) return;

    const isRegisterPage = (path === '/register' || path.endsWith('/register'));

    if (isRegisterPage) {
      registerLink.classList.add('rn26-active');
      document.body.classList.add('page-register');

      // Kill main navbar spotlight using MutationObserver —
      // watches the overlay/ambience elements and immediately resets
      // any inline opacity/display that spotlight-navbar.js tries to set.
      const targets = [
        document.querySelector('.navbar-spotlight-overlay'),
        document.querySelector('.navbar-ambience-line'),
      ].filter(Boolean);

      targets.forEach(function (el) {
        // Hard-reset immediately
        el.style.setProperty('opacity', '0', 'important');
        el.style.setProperty('display', 'none', 'important');

        // Watch for any JS trying to change these inline styles
        const observer = new MutationObserver(function () {
          el.style.setProperty('opacity', '0', 'important');
          el.style.setProperty('display', 'none', 'important');
        });
        observer.observe(el, { attributes: true, attributeFilter: ['style'] });
      });
    }

    positionAmbienceOn(registerLink);
  }

  /* ── Spotlight / ambience on the RN26 pill ── */
  function initSpotlight() {
    const pill = document.getElementById('rn26-pill');
    const spotlight = document.getElementById('rn26-spotlight');
    const ambience = document.getElementById('rn26-ambience');
    if (!pill || !spotlight || !ambience) return;

    pill.addEventListener('mousemove', function (e) {
      const rect = pill.getBoundingClientRect();
      spotlight.style.setProperty('--rn26-x', (e.clientX - rect.left) + 'px');
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
    requestAnimationFrame(function () {
      const pillRect = pill.getBoundingClientRect();
      const linkRect = linkEl.getBoundingClientRect();
      ambience.style.setProperty('--rn26-amb-x', (linkRect.left - pillRect.left + linkRect.width / 2) + 'px');
    });
  }

  /* ── Boot ── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }

})();
