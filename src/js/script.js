function loadTeamMembers() {
  const teamContainer = document.getElementById("team-container");

  if (teamContainer) {
    fetch(`/src/js/team.json?v=82&t=${GLOBAL_CACHE_MASTER}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load team data');
        return res.json();
      })
      .then(data => {
        // Define role and class hierarchy for sorting
        const roleOrder = {
          "President": 1,
          "Head": 1,
          "Vice President": 2,
          "Core Member": 3,
          "Member": 4
        };

        // Sort members by role, class, then alphabetically by name
        const members = data.members.sort((a, b) => {
          const roleComparison = (roleOrder[a.role] || 999) - (roleOrder[b.role] || 999);
          if (roleComparison !== 0) return roleComparison;

          const classComparison = (a.class || 999) - (b.class || 999);
          if (classComparison !== 0) return classComparison;

          return a.name.localeCompare(b.name);
        });

        teamContainer.innerHTML = members.map((member) => {
          let imagePath = member.image;
          if (!imagePath.startsWith('/') && !imagePath.startsWith('src/')) {
            imagePath = `/src/${imagePath}`;
          } else if (imagePath.startsWith('src/')) {
            imagePath = `/${imagePath}`;
          }

          return `
            <div class="team-card ${member.leavingSoon ? 'leaving-soon' : ''}">
              ${member.leavingSoon ? '<span class="leaving-badge">Leaving Soon</span>' : ''}
              <img src="${imagePath}" alt="${member.name}" width="300" height="300" loading="lazy" onerror="this.src='/src/assets/images/Robo_Nexus_Logo.webp'">
              <h2>${member.name}</h2>
              <p>${member.role}</p>
              <p>Class: ${member.class}</p>
              <div class="social-links">
                ${member.links.github ? `<a href="${member.links.github}" target="_blank"><i class="fab fa-github"></i></a>` : ""}
                ${member.links.linkedin ? `<a href="${member.links.linkedin}" target="_blank"><i class="fab fa-linkedin"></i></a>` : ""}
                ${member.links.website ? `<a href="${member.links.website}" target="_blank"><i class="fas fa-globe"></i></a>` : ""}
              </div>
            </div>
          `;
        }).join("");
      })
      .catch(err => {
        console.error('Team loading error:', err);
        teamContainer.innerHTML = '<p>Error loading team data. Please try again later.</p>';
      });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadTeamMembers);
} else {
  loadTeamMembers();
}