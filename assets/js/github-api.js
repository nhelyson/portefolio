/* ==========================================================================
   Japhet Ikoule — GitHub Public API Integration (github-api.js)
   Source of Truth: https://api.github.com/users/nhelyson/repos
   ========================================================================== */

const GITHUB_USERNAME = 'nhelyson';
const GITHUB_REPOS_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`;

const LANG_COLORS = {
  'JavaScript': '#f1e05a',
  'PHP': '#4F5D95',
  'HTML': '#e34c26',
  'CSS': '#563d7c',
  'TypeScript': '#3178c6',
  'Python': '#3572A5',
  'C++': '#f34b7d',
  'C': '#555555',
  'Shell': '#89e051',
  'Blade': '#f7523f',
  'Vue': '#41b883',
  'Docker': '#38bdf8'
};

let allRepositories = [];

async function fetchGitHubRepositories() {
  const projectsGrid = document.getElementById('projectsGrid');
  const filterBar = document.getElementById('filterBar');
  const totalReposStat = document.getElementById('statReposCount');
  const totalStarsStat = document.getElementById('statStarsCount');

  if (!projectsGrid) return;

  // Show Skeleton Loaders while fetching
  renderSkeletonLoaders(projectsGrid, 6);

  try {
    const response = await fetch(GITHUB_REPOS_URL);
    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}`);
    }

    const repos = await response.json();
    
    // Sort repos by updated date descending
    allRepositories = repos.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

    // Update real stats in About section
    if (totalReposStat) totalReposStat.textContent = allRepositories.length;
    if (totalStarsStat) {
      const totalStars = allRepositories.reduce((acc, repo) => acc + (repo.stargazers_count || 0), 0);
      totalStarsStat.textContent = totalStars;
    }

    // Build filter buttons based on actual languages present in GitHub account
    buildFilterBar(allRepositories, filterBar);

    // Render project cards
    renderProjects(allRepositories, projectsGrid);

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des repositories GitHub:', error);
    projectsGrid.innerHTML = `
      <div class="card" style="grid-column: 1 / -1; text-align: center; padding: 3rem 1.5rem; border-color: rgba(239, 68, 68, 0.4);">
        <p style="font-size: 1.25rem; font-weight: 700; color: #ef4444; margin-bottom: 0.5rem;">⚠️ Impossible d'accéder à l'API GitHub</p>
        <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1.25rem;">Les données des repositories publics n'ont pas pu être récupérées automatiquement.</p>
        <a href="https://github.com/${GITHUB_USERNAME}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">
          Consulter mon profil GitHub &rarr;
        </a>
      </div>
    `;
  }
}

function renderSkeletonLoaders(container, count) {
  let html = '';
  for (let i = 0; i < count; i++) {
    html += `
      <div class="card skeleton-shimmer" style="height: 240px; display: flex; flex-direction: column; justify-content: space-between;">
        <div style="height: 24px; width: 60%; background: rgba(255,255,255,0.06); border-radius: 6px;"></div>
        <div style="height: 16px; width: 90%; background: rgba(255,255,255,0.04); border-radius: 4px; margin-top: 10px;"></div>
        <div style="height: 16px; width: 75%; background: rgba(255,255,255,0.04); border-radius: 4px; margin-top: 6px;"></div>
        <div style="display: flex; gap: 8px; margin-top: 20px;">
          <div style="height: 20px; width: 60px; background: rgba(255,255,255,0.06); border-radius: 12px;"></div>
          <div style="height: 20px; width: 80px; background: rgba(255,255,255,0.06); border-radius: 12px;"></div>
        </div>
      </div>
    `;
  }
  container.innerHTML = html;
}

function buildFilterBar(repos, filterContainer) {
  if (!filterContainer) return;

  const languages = new Set();
  repos.forEach(repo => {
    if (repo.language) languages.add(repo.language);
  });

  let html = `<button class="filter-btn active" data-filter="all">Tous (${repos.length})</button>`;
  languages.forEach(lang => {
    const count = repos.filter(r => r.language === lang).length;
    html += `<button class="filter-btn" data-filter="${lang}">${lang} (${count})</button>`;
  });

  filterContainer.innerHTML = html;

  // Add filter click events
  const filterBtns = filterContainer.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');
      const filtered = filter === 'all' 
        ? repos 
        : repos.filter(r => r.language === filter);

      renderProjects(filtered, document.getElementById('projectsGrid'));
    });
  });
}

function renderProjects(repos, container) {
  if (!container) return;

  if (repos.length === 0) {
    container.innerHTML = `
      <div class="card" style="grid-column: 1 / -1; text-align: center; padding: 2.5rem; color: var(--text-muted);">
        <p>Aucun repository trouvé pour cette technologie.</p>
      </div>
    `;
    return;
  }

  let html = '';
  repos.forEach(repo => {
    const lang = repo.language || 'Code';
    const langColor = LANG_COLORS[lang] || '#8b5cf6';
    const description = repo.description || 'Pas de description fournie sur GitHub.';
    const stars = repo.stargazers_count || 0;
    const forks = repo.forks_count || 0;
    const updatedDate = formatDate(repo.updated_at);
    
    // Check if repo is one of Japhet's major highlighted projects
    const isMajor = repo.name.toLowerCase().includes('novel') || repo.name.toLowerCase().includes('scan');

    html += `
      <div class="card project-card hud-corner glow-halo" ${isMajor ? 'style="border-color: rgba(139, 92, 246, 0.4);"' : ''}>
        <div>
          <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 0.75rem; margin-bottom: 0.75rem;">
            <div>
              <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                <h3 style="font-size: 1.2rem; font-weight: 700; color: #ffffff;">${escapeHtml(repo.name)}</h3>
                ${isMajor ? '<span class="badge" style="background: rgba(139, 92, 246, 0.2); font-size: 0.65rem;">Majeur</span>' : ''}
              </div>
              <span style="font-family: var(--font-mono); font-size: 0.7rem; color: var(--text-muted);">Mis à jour ${updatedDate}</span>
            </div>
            
            <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm" title="Voir sur GitHub">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
            </a>
          </div>

          <p style="font-size: 0.875rem; color: var(--text-secondary); line-height: 1.6; margin-bottom: 1.25rem;">
            ${escapeHtml(description)}
          </p>
        </div>

        <div>
          <!-- Tags / Topics if any -->
          ${repo.topics && repo.topics.length > 0 ? `
            <div style="display: flex; flex-wrap: wrap; gap: 0.35rem; margin-bottom: 1rem;">
              ${repo.topics.slice(0, 4).map(t => `<span class="tag-badge" style="font-size: 0.65rem;">#${escapeHtml(t)}</span>`).join('')}
            </div>
          ` : ''}

          <!-- Footer stats & language -->
          <div style="display: flex; align-items: center; justify-content: space-between; padding-top: 0.85rem; border-top: 1px solid rgba(255,255,255,0.06); font-family: var(--font-mono); font-size: 0.75rem;">
            <span class="lang-badge">
              <span class="lang-dot" style="background-color: ${langColor};"></span>
              ${escapeHtml(lang)}
            </span>

            <div style="display: flex; items-center; gap: 0.85rem; color: var(--text-muted);">
              ${stars > 0 ? `<span>★ ${stars}</span>` : ''}
              ${forks > 0 ? `<span>⑂ ${forks}</span>` : ''}
              <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" style="color: var(--accent-cyan); text-decoration: none; font-weight: 600;">
                Détails &rarr;
              </a>
            </div>
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "aujourd'hui";
  if (diffDays === 1) return "hier";
  if (diffDays < 30) return `il y a ${diffDays} jours`;
  
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, match => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[match]));
}
