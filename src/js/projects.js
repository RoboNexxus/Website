// ── Supabase Config — loaded from Vercel env via /api/config ──
let SUPABASE_URL = '';
let SUPABASE_KEY = '';
let SB_HEADERS = {};

async function loadSupabaseConfig() {
  try {
    const res = await fetch('/api/config?v=52');
    if (!res.ok) throw new Error('Config fetch failed');
    const cfg = await res.json();
    SUPABASE_URL = cfg.url;
    SUPABASE_KEY = cfg.key;
    SB_HEADERS = {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    };
  } catch (err) {
    console.warn('Could not load Supabase config:', err);
  }
}

// ── State ────────────────────────────────────────────────────────
let tutorials = [];
let modal, modalBody, modalClose;

// ── Init ─────────────────────────────────────────────────────────
async function initProjects() {
  modal = document.getElementById('project-modal');
  modalBody = document.getElementById('modal-body');
  modalClose = document.querySelector('.modal-close');

  modalClose?.addEventListener('click', closeModal);
  modal?.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  try {
    await loadSupabaseConfig();
    const tutData = await fetch('/src/js/tutorials.json?v=52').then(r => r.json());
    tutorials = tutData.tutorials || [];
  } catch (err) {
    console.error('Init error:', err);
    tutorials = [];
  }

  renderTutorials();
}

document.addEventListener('DOMContentLoaded', initProjects);

// ── Render project cards ──────────────────────────────────────────
function renderTutorials() {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;

  if (!tutorials.length) {
    grid.innerHTML = '<p style="color:rgba(255,255,255,0.4); text-align:center; padding:40px 0;">No projects yet. Check back soon!</p>';
    return;
  }

  grid.innerHTML = tutorials.map(t => `
    <div class="project-card" data-id="${t.id}">
      <div class="project-image">
        <img src="${t.image}" alt="${t.title}" width="400" height="300" loading="lazy"
             onerror="this.src='/src/assets/images/Robo_Nexus_Logo.webp'">
        <div class="project-overlay">
          <span class="project-category">${t.category.toUpperCase()}</span>
          <span class="project-status ${t.status === 'Completed' ? 'completed' : 'progress'}">${t.status}</span>
        </div>
      </div>
      <div class="project-info">
        <h3>${t.title}</h3>
        <p>${t.description}</p>
        <div class="project-tech">
          ${t.tech.map(tag => `<span class="tech-tag">${tag}</span>`).join('')}
        </div>
        <div class="project-creator-row">
          <span class="project-creator-name">
            <i class="fas fa-user"></i> ${t.creator || 'Unknown'}
          </span>
          ${t.team ? `<span class="project-team-badge"><i class="fas fa-users"></i> ${t.team}</span>` : ''}
        </div>
        <button class="view-project-btn" data-id="${t.id}">
          View Details <i class="fas fa-arrow-right"></i>
        </button>
      </div>
    </div>
  `).join('');

  document.querySelectorAll('.view-project-btn').forEach(btn => {
    btn.addEventListener('click', () => openModal(btn.dataset.id));
  });
}

// ── Modal ─────────────────────────────────────────────────────────
function openModal(id) {
  const t = tutorials.find(t => t.id == id);
  if (!t || !modal) return;

  modalBody.innerHTML = `
    <div class="modal-image">
      <img src="${t.image}" alt="${t.title}" width="600" height="400" loading="lazy"
           onerror="this.src='/src/assets/images/Robo_Nexus_Logo.webp'">
    </div>
    <div class="modal-info">
      <span class="modal-category">${t.category.toUpperCase()}</span>
      <h2>${t.title}</h2>
      <div class="modal-meta-row">
        <p class="modal-year"><i class="fas fa-calendar"></i> ${t.year}</p>
        <p class="modal-creator-info">
          <i class="fas fa-user"></i> ${t.creator || 'Unknown'}
          ${t.team ? `&nbsp;&middot;&nbsp;<i class="fas fa-users"></i> ${t.team}` : ''}
        </p>
      </div>
      <p class="modal-desc">${t.description}</p>
      <div class="modal-tech">
        <h4>Technologies Used:</h4>
        ${t.tech.map(tag => `<span class="tech-tag">${tag}</span>`).join('')}
      </div>
      <div class="modal-status">
        <span class="${t.status === 'Completed' ? 'completed' : 'progress'}">
          <i class="fas ${t.status === 'Completed' ? 'fa-check-circle' : 'fa-spinner fa-spin'}"></i>
          ${t.status}
        </span>
      </div>
    </div>
  `;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modal?.classList.remove('active');
  document.body.style.overflow = 'auto';
}
