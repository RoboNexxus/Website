/**
 * RoboNexus '26 Sub-Navbar
 * Auto-injects the event bar immediately after .navbar on every page.
 * Include this script (defer) in every HTML page.
 */
(function () {
  const SUBNAV_HTML = `
    <div class="rn26-subnav" id="rn26-subnav">
      <div class="rn26-subnav-inner">
        <div class="rn26-subnav-left">
          <span class="rn26-subnav-wordmark">RoboNexus <span>'26</span></span>
          <span class="rn26-subnav-badge">Registration Open</span>
        </div>
        <a href="/register" class="rn26-subnav-cta">
          <i class="fas fa-rocket"></i>
          Register Now
        </a>
        <a href="/events" class="rn26-subnav-back">
          <i class="fas fa-arrow-left"></i>
          Back to Events
        </a>
      </div>
    </div>
  `;

  function inject() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    // Don't double-inject
    if (document.getElementById('rn26-subnav')) return;

    navbar.insertAdjacentHTML('afterend', SUBNAV_HTML);
  }

  // Run immediately if DOM is ready, else wait
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
