/* ==========================================================================
   Japhet Ikoule — Main Entry Point (main.js)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  console.log('🌌 Portfolio Japhet Ikoule - Esthétique Cyber-Zen Anime initialisée');

  // Initialize Canvas Background Starfield
  new AnimeCanvas('animeCanvas');

  // Initialize UI Micro-Interactions
  initUIInteractions();

  // Fetch Real GitHub Repositories Dynamically
  fetchGitHubRepositories();
});
