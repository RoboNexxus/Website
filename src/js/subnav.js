/**
 * RoboNexus Navbar Pills
 * Injects Inductions on the left of main nav and RoboNexus '26 on the right.
 */
(function () {

  const INDUCTIONS_PILL_HTML = `
    <div class="rn26-pill" id="rn-inductions-pill">
      <div class="rn26-pill-label">
        <span class="rn26-dot"></span>
        <span class="rn26-year">Inductions</span>
      </div>
      <ul class="rn26-pill-links" id="rn-inductions-links">
        <li>
          <a class="rn26-pill-link" href="/inductions" id="rn-inductions-link-apply">
            <i class="fas fa-user-plus"></i>
            Apply
          </a>
        </li>
      </ul>
      <div class="rn26-spotlight" id="rn-inductions-spotlight"></div>
    </div>
  `;

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

  /* ── Inject into .spotlight-nav-container around the main nav ── */
  function inject() {
    const navContainer = document.querySelector('.spotlight-nav-container');
    if (!navContainer) return;

    const mainNav = navContainer.querySelector('.spotlight-nav');
    const showInductions = window.SITE_CONFIG?.SHOW_INDUCTIONS === true;
    const showRN26 = !!window.SITE_CONFIG?.SHOW_RN26;

    if (showInductions && !document.getElementById('rn-inductions-pill')) {
      if (mainNav) {
        mainNav.insertAdjacentHTML('beforebegin', INDUCTIONS_PILL_HTML);
      } else {
        navContainer.insertAdjacentHTML('afterbegin', INDUCTIONS_PILL_HTML);
      }
    }

    if (showRN26 && !document.getElementById('rn26-pill')) {
      if (mainNav) {
        mainNav.insertAdjacentHTML('afterend', PILL_HTML);
      } else {
        navContainer.insertAdjacentHTML('beforeend', PILL_HTML);
      }
    }

    initSpotlight('rn-inductions-pill', 'rn-inductions-spotlight', '--rn26-x');
    initSpotlight('rn26-pill', 'rn26-spotlight', '--rn26-x');
    setActiveLink();

    // Let the cinematic navbar sequence know that side pills are available.
    if (document.getElementById('rn-inductions-pill') || document.getElementById('rn26-pill')) {
      window.__rnSubnavReady = true;
      window.dispatchEvent(new CustomEvent('subnavReady'));
    }
  }

  /* ── Mark active links + kill main nav glow on register page ── */
  function setActiveLink() {
    const path = window.location.pathname.replace(/\/$/, '') || '/';
    const registerLink = document.getElementById('rn26-link-register');
    const inductionsLink = document.getElementById('rn-inductions-link-apply');

    const isRegisterPage = (path === '/register' || path.endsWith('/register'));
    const isInductionsPage = (path === '/inductions' || path.endsWith('/inductions'));

    if (inductionsLink && isInductionsPage) {
      inductionsLink.classList.add('rn26-active');
    }

    if (registerLink && isRegisterPage) {
      registerLink.classList.add('rn26-active');
      document.body.classList.add('page-register');

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

  /* ── Spotlight on pill navs ── */
  function initSpotlight(pillId, spotlightId, cssVarName) {
    const pill = document.getElementById(pillId);
    const spotlight = document.getElementById(spotlightId);
    if (!pill || !spotlight) return;

    pill.addEventListener('mousemove', function (e) {
      const rect = pill.getBoundingClientRect();
      spotlight.style.setProperty(cssVarName, (e.clientX - rect.left) + 'px');
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
