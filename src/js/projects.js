const SUPABASE_URL = 'https://wgyrgoybcxegqgljhaat.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;
const SB_HEADERS = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json'
};

// ── State ────────────────────────────────────────────────────────
let tutorials = [];
let voteCounts = {};     // { projectId: number }
let votedList = JSON.parse(localStorage.getItem('rn_voted_projects') || '[]');

let tutorialsGrid, modal, modalBody, modalClose;

// ── Init ─────────────────────────────────────────────────────────
async function initProjects() {
  tutorialsGrid = document.getElementById('projects-grid');
  modal = document.getElementById('project-modal');
  modalBody = document.getElementById('modal-body');
  modalClose = document.querySelector('.modal-close');

  // Modal close listeners
  modalClose?.addEventListener('click', closeModal);
  modal?.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  try {
    const [tutorialsRes] = await Promise.all([
      fetch('/src/js/tutorials.json?v=19.0').then(r => r.json()),
      loadVotes()
    ]);
    tutorials = tutorialsRes.tutorials;
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
    voteCounts = {};
  }
}

// ── Cast a vote ───────────────────────────────────────────────────
async function castVote(projectId) {
  if (votedList.includes(projectId)) return;

  // Optimistic update
  voteCounts[projectId] = (voteCounts[projectId] || 0) + 1;
  votedList.push(projectId);
  localStorage.setItem('rn_voted_projects', JSON.stringify(votedList));
  renderVotingSection(); // instant UI update

  // Persist to Supabase via RPC
  // SQL to create: see bottom of this file
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/rpc/increment_vote`, {
      method: 'POST',
      headers: SB_HEADERS,
      body: JSON.stringify({ p_id: projectId })
    });
  } catch (err) {
    console.warn('Vote sync failed:', err);
  }
}

// ── Render project cards ──────────────────────────────────────────
function renderTutorials() {
  if (!tutorialsGrid) return;

  tutorialsGrid.innerHTML = tutorials.map(t => `
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

// ── Render voting section + leaderboard ──────────────────────────
function renderVotingSection() {
  const votingCards = document.getElementById('voting-cards');
  const leaderboard = document.getElementById('leaderboard-list');
  if (!votingCards || !leaderboard) return;

  // ── Voting cards
  if (tutorials.length === 0) {
    votingCards.innerHTML = `<p style="color:rgba(255,255,255,0.4); font-style:italic;">No projects to vote on yet.</p>`;
  } else {
    votingCards.innerHTML = tutorials.map(t => {
      const votes = voteCounts[t.id] || 0;
      const voted = votedList.includes(t.id);
      return `
        <div class="vote-card ${voted ? 'vote-card--voted' : ''}">
          <div class="vote-card-info">
            <p class="vote-card-title">${t.title}</p>
            ${t.team ? `<p class="vote-card-team"><i class="fas fa-users"></i> ${t.team}</p>` : `<p class="vote-card-team"><i class="fas fa-user"></i> ${t.creator || 'Unknown'}</p>`}
          </div>
          <div class="vote-card-right">
            <span class="vote-count" id="vc-${t.id}">${votes}</span>
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

  // ── Leaderboard (top 5 by votes, grouped by team if available)
  const ranked = [...tutorials]
    .map(t => ({
      label: t.team || t.creator || t.title,
      votes: voteCounts[t.id] || 0,
      title: t.title,
      hasTeam: !!t.team
    }))
    // aggregate by label
    .reduce((acc, cur) => {
      const existing = acc.find(x => x.label === cur.label);
      if (existing) { existing.votes += cur.votes; }
      else { acc.push({ ...cur }); }
      return acc;
    }, [])
    .sort((a, b) => b.votes - a.votes)
    .slice(0, 5);

  const medals = ['🥇', '🥈', '🥉'];

  leaderboard.innerHTML = ranked.length === 0
    ? `<p class="leaderboard-empty">No votes yet — be the first!</p>`
    : ranked.map((r, i) => `
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
          ${t.team ? `&nbsp;·&nbsp;<i class="fas fa-users"></i> ${t.team}` : ''}
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

