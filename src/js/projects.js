// ── Supabase Config — loaded from Vercel env via /api/config ──
let SUPABASE_URL = '';
let SUPABASE_KEY = '';
let SB_HEADERS = {};

async function loadSupabaseConfig() {
  try {
    const res = await fetch('/api/config');
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
let voteCounts = {};
let votedList = JSON.parse(localStorage.getItem('rn_voted') || '[]');

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
    const [tutData] = await Promise.all([
      fetch('/src/js/tutorials.json').then(r => r.json()),
      loadVotes()
    ]);
    tutorials = tutData.tutorials || [];
  } catch (err) {
    console.error('Init error:', err);
    tutorials = [];
  }

  renderTutorials();
  renderVotingSection();
}

document.addEventListener('DOMContentLoaded', initProjects);

// ── Load votes from Supabase ─────────────────────────────────────
async function loadVotes() {
  if (!SUPABASE_KEY) return;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/project_votes?select=project_id,vote_count`, {
      headers: SB_HEADERS
    });
    const rows = await res.json();
    voteCounts = {};
    if (Array.isArray(rows)) {
      rows.forEach(r => { voteCounts[r.project_id] = r.vote_count; });
    }
  } catch (err) {
    console.warn('Could not load votes:', err);
  }
}

// ── Cast a vote ───────────────────────────────────────────────────
async function castVote(projectId) {
  projectId = Number(projectId);
  if (votedList.includes(projectId)) return;

  const project = tutorials.find(t => t.id == projectId);

  // Optimistic UI update
  voteCounts[projectId] = (voteCounts[projectId] || 0) + 1;
  votedList.push(projectId);
  localStorage.setItem('rn_voted', JSON.stringify(votedList));
  renderVotingSection();

  if (typeof toast !== 'undefined') {
    toast.success('Vote Registered!', `You voted for ${project ? project.title : 'this project'}.`, 4000);
  }

  // Persist to Supabase
  if (!SUPABASE_KEY) return;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/increment_vote`, {
      method: 'POST',
      headers: SB_HEADERS,
      body: JSON.stringify({ p_id: projectId })
    });
    if (!res.ok) throw new Error('Vote sync failed');
  } catch (err) {
    console.warn('Vote sync failed:', err);
    // Silent fail in UI as we already did optimistic update
  }
}

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

// ── Render voting cards + leaderboard ────────────────────────────
function renderVotingSection() {
  renderVotingCards();
  renderLeaderboard();
}

function renderVotingCards() {
  const container = document.getElementById('voting-cards');
  if (!container) return;

  if (!tutorials.length) {
    container.innerHTML = `<p style="color:rgba(255,255,255,0.4); font-style:italic;">No projects to vote on yet.</p>`;
    return;
  }

  container.innerHTML = tutorials.map(t => {
    const votes = voteCounts[t.id] || 0;
    const voted = votedList.includes(Number(t.id));
    return `
      <div class="vote-card ${voted ? 'vote-card--voted' : ''}">
        <div class="vote-card-info">
          <p class="vote-card-title">${t.title}</p>
          <p class="vote-card-team">
            ${t.team
        ? `<i class="fas fa-users"></i> ${t.team}`
        : `<i class="fas fa-user"></i> ${t.creator || 'Unknown'}`
      }
          </p>
        </div>
        <div class="vote-card-right">
          <span class="vote-count">${votes}</span>
          <button class="vote-btn ${voted ? 'vote-btn--done' : ''}"
                  onclick="castVote(${t.id})"
                  ${voted ? 'disabled' : ''}
                  title="${voted ? 'Already voted!' : 'Vote for this project'}">
            <i class="fas ${voted ? 'fa-check' : 'fa-arrow-up'}"></i>
            ${voted ? 'Voted' : 'Vote'}
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function renderLeaderboard() {
  const container = document.getElementById('leaderboard-list');
  if (!container) return;

  if (!tutorials.length) {
    container.innerHTML = `<p class="leaderboard-empty">No projects yet.</p>`;
    return;
  }

  const medals = ['🥇', '🥈', '🥉'];

  const ranked = tutorials
    .map(t => ({
      label: t.team || t.creator || t.title,
      title: t.title,
      votes: voteCounts[t.id] || 0,
      hasTeam: !!t.team
    }))
    .reduce((acc, cur) => {
      const ex = acc.find(x => x.label === cur.label);
      if (ex) { ex.votes += cur.votes; }
      else { acc.push({ ...cur }); }
      return acc;
    }, [])
    .sort((a, b) => b.votes - a.votes)
    .slice(0, 5);

  const hasAnyVotes = ranked.some(r => r.votes > 0);

  if (!hasAnyVotes) {
    container.innerHTML = `<p class="leaderboard-empty">No votes yet — be the first!</p>`;
    return;
  }

  container.innerHTML = ranked.map((r, i) => `
    <div class="lb-row">
      <span class="lb-rank">${medals[i] || `#${i + 1}`}</span>
      <div class="lb-info">
        <p class="lb-label">${r.label}</p>
        ${r.hasTeam ? `<p class="lb-sublabel">${r.title}</p>` : ''}
      </div>
      <span class="lb-votes">${r.votes} <i class="fas fa-arrow-up"></i></span>
    </div>
  `).join('');
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