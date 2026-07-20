import { gainExp } from './rpg-system.js';

const GITHUB_USERNAME = 'nhelyson';

export async function fetchGithubQuests() {
  try {
    const res = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=10`);
    if (!res.ok) throw new Error('API limit or error');
    const repos = await res.json();
    
    return repos.map(repo => analyzeRepoToQuest(repo));
  } catch (error) {
    console.error('Failed to fetch GitHub Quests:', error);
    return getFallbackQuests();
  }
}

// Heuristic engine to transform standard Repo data into a Quest
function analyzeRepoToQuest(repo) {
  const quest = {
    id: repo.id,
    title: `Mission: ${repo.name.replace(/-/g, ' ').toUpperCase()}`,
    difficulty: calculateDifficulty(repo),
    boss: determineBoss(repo),
    rewards: extractRewards(repo),
    summary: repo.description || "Une quête mystérieuse dont les archives ont été perdues...",
    url: repo.html_url,
    demo: repo.homepage || null
  };
  return quest;
}

function calculateDifficulty(repo) {
  // Simple heuristic based on size and stars
  let stars = 1;
  if (repo.size > 1000) stars++;
  if (repo.size > 10000) stars++;
  if (repo.stargazers_count > 0) stars++;
  if (repo.language === 'C' || repo.language === 'Rust') stars++;
  
  return '★'.repeat(Math.min(stars, 5)) + '☆'.repeat(Math.max(5 - stars, 0));
}

function determineBoss(repo) {
  const desc = (repo.description || '').toLowerCase();
  const lang = (repo.language || '').toLowerCase();
  
  if (desc.includes('docker') || lang === 'dockerfile') return "L'Architecture Conteneurisée (Golem)";
  if (desc.includes('linux') || lang === 'shell') return "Le Serveur Déchu (Dragon)";
  if (desc.includes('api') || desc.includes('backend')) return "Le Labyrinthe des Requêtes (Backend)";
  if (desc.includes('ia') || desc.includes('bot')) return "L'Esprit Artificiel (Hydre)";
  if (lang === 'php') return "L'Ancien Code (Nécromancien)";
  
  return "Le Gardien du Dépôt";
}

function extractRewards(repo) {
  const rewards = [];
  if (repo.language) rewards.push(`+ ${repo.language}`);
  
  const desc = (repo.description || '').toLowerCase();
  if (desc.includes('database') || desc.includes('sql')) rewards.push('+ Base de données');
  if (desc.includes('tailwind')) rewards.push('+ Tailwind CSS');
  
  // Guarantee at least one reward
  if (rewards.length === 0) rewards.push('+ EXP');
  return rewards;
}

function getFallbackQuests() {
  return [
    {
      id: 1,
      title: 'Mission: AI MEDICAL DETECTOR',
      difficulty: '★★★★☆',
      boss: "L'Architecture Conteneurisée",
      rewards: ['+ Docker', '+ Ollama', '+ Python'],
      summary: "Une quête héroïque pour détecter des anomalies médicales via une IA hébergée localement.",
      url: "#",
      demo: null
    },
    {
      id: 2,
      title: 'Mission: LINUX SERVER DEPLOYMENT',
      difficulty: '★★★☆☆',
      boss: "Le Serveur Déchu",
      rewards: ['+ Bash', '+ Nginx', '+ Sécurité'],
      summary: "Sécurisation et déploiement d'une infrastructure complète sur Ubuntu Server.",
      url: "#",
      demo: null
    }
  ];
}
