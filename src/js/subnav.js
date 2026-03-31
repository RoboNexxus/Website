/**
 * RoboNexus '26 — Second Navbar
 * Injects a proper pill navbar immediately after .navbar on every page.
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

      // Kill main navbar spotlight using MutationObserver
      const overlay = document.querySelector('.navbar-spotlight-overlay');
      if (overlay) {
        overlay.style.setProperty('opacity', '0', 'important');
        overlay.style.setProperty('display', 'none', 'important');

        const observer = new MutationObserver(function () {
          overlay.style.setProperty('opacity', '0', 'important');
          overlay.style.setProperty('display', 'none', 'important');
        });
        observer.observe(overlay, { attributes: true, attributeFilter: ['style'] });
      }
    }
  }

  /* ── Spotlight on the RN26 pill ── */
  function initSpotlight() {
    const pill = document.getElementById('rn26-pill');
    const spotlight = document.getElementById('rn26-spotlight');
    if (!pill || !spotlight) return;

    pill.addEventListener('mousemove', function (e) {
      const rect = pill.getBoundingClientRect();
      spotlight.style.setProperty('--rn26-x', (e.clientX - rect.left) + 'px');
      spotlight.style.opacity = '1';
    });

    pill.addEventListener('mouseleave', function () {
      spotlight.style.opacity = '0';
    });
  }

  /* ── Boot ── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }

})();
