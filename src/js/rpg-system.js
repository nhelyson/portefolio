// --- RPG System & Logic ---

let exp = 0;
let level = 1;
const maxExp = 1000;

export function initializeRPG() {
  // Bind Konami Code
  initKonamiCode();
  
  // Bind Page Turns
  bindPageInteraction();

  // Make Sage global for inline onclick
  window.toggleSageChat = toggleSageChat;
  window.sendSageMessage = sendSageMessage;
  
  // Initialize the Radar Chart
  initStatsRadar();
  
  // Grant initial EXP for opening the Grimoire
  gainExp(150);
}

export function gainExp(amount) {
  exp += amount;
  
  if (exp >= maxExp) {
    exp = exp - maxExp;
    level++;
    document.getElementById('player-level').innerText = level;
    showToast(`Niveau Supérieur ! Niveau ${level}`);
  }

  const expPercent = (exp / maxExp) * 100;
  document.getElementById('exp-text').innerText = exp;
  document.getElementById('exp-bar').style.width = `${expPercent}%`;
}

function bindPageInteraction() {
  const pageRight = document.getElementById('page-right');
  const pageLeft = document.getElementById('page-left');

  pageRight.addEventListener('click', () => {
    // Add page turn class
    pageRight.classList.add('page-turn-left');
    
    // Play sound if possible (Placeholder for AudioContext)
    gainExp(50);
    
    setTimeout(() => {
      // Logic to load Next Chapter content into the pages
      document.getElementById('page-left-content').innerHTML = `
        <h2 class="font-title text-3xl mb-4 text-grimoire-ink border-b border-grimoire-ink/20 pb-2">Chapitre II : Le Bestiaire</h2>
        <p class="font-body text-grimoire-ink/80 text-sm">Les créatures domptées lors de l'aventure.</p>
        <div class="mt-4 flex flex-col gap-4">
          <div class="p-3 border border-grimoire-ink/30 rounded flex gap-4">
             <div class="w-16 h-16 bg-slate-800 rounded border border-grimoire-gold"></div>
             <div>
               <h3 class="font-title font-bold text-lg">Le Golem Docker</h3>
               <p class="font-mono text-xs text-grimoire-ink/60">Gardien des Conteneurs (Niv. 4)</p>
             </div>
          </div>
        </div>
      `;
      document.getElementById('page-right-content').innerHTML = `
        <div class="flex flex-col items-center justify-center h-full">
          <p class="font-mono text-xs uppercase tracking-[0.3em] text-grimoire-ink/50 text-center">
            Cliquez pour la quête suivante
          </p>
        </div>
      `;
      // Reset animation state
      pageRight.classList.remove('page-turn-left');
    }, 1000);
  });
}

function initKonamiCode() {
  const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  let konamiIndex = 0;

  document.addEventListener('keydown', (e) => {
    if (e.key === konamiCode[konamiIndex]) {
      konamiIndex++;
      if (konamiIndex === konamiCode.length) {
        unlockSecretRoom();
        konamiIndex = 0;
      }
    } else {
      konamiIndex = 0;
    }
  });
}

function unlockSecretRoom() {
  showToast("Le Sceau se brise... La Chambre Secrète s'ouvre !");
  document.body.style.filter = "hue-rotate(320deg) saturate(1.5)"; // Turn everything crimson/dark
  gainExp(500);
  
  // Transition logic to Secret Room
  document.getElementById('page-left-content').innerHTML = `
     <h1 class="font-title text-4xl text-center mb-8 border-b border-grimoire-ink/20 pb-4 text-red-800">Developer's Secret Room</h1>
     <p class="font-mono text-sm text-grimoire-ink/80">
       Projets abandonnés, expériences IA sombres et notes interdites...
     </p>
  `;
}

// --- Sage Ollama Logic ---
function toggleSageChat() {
  const chat = document.getElementById('sage-chat');
  chat.classList.toggle('hidden');
  chat.classList.toggle('flex');
}

function sendSageMessage() {
  const input = document.getElementById('sage-input');
  const msg = input.value.trim();
  if(!msg) return;

  const messagesDiv = document.getElementById('sage-messages');
  
  // User message
  messagesDiv.innerHTML += `<div class="text-white text-right"><b>Vous:</b> ${msg}</div>`;
  input.value = '';

  // Simulate LLM / Heuristic response
  setTimeout(() => {
    let reply = "Je fouille dans les archives...";
    const lowerMsg = msg.toLowerCase();
    
    if (lowerMsg.includes('qui es')) {
      reply = "Je suis Le Sage Ollama, invoqué par Nhelyson pour garder ce Codex. Pose-moi des questions sur ses quêtes !";
    } else if (lowerMsg.includes('docker')) {
      reply = "Docker est le Gardien des Conteneurs. Nhelyson a vaincu ce Golem pour isoler ses applications dans des environnements parfaits.";
    } else if (lowerMsg.includes('linux')) {
      reply = "Le Royaume des Serveurs. Un dragon ancien que peu savent dompter. Nhelyson l'a chevauché (Debian, Ubuntu).";
    } else {
      reply = "Ma magie ne me permet pas de répondre à ceci pour le moment... J'étudie encore le grimoire.";
    }

    messagesDiv.innerHTML += `<div class="text-grimoire-magic"><b>Ollama:</b> ${reply}</div>`;
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    gainExp(10); // Reward interaction
  }, 1000);
}

function showToast(msg) {
  // Simple toast implementation or use a div
  console.log("RPG Toast:", msg);
}

function initStatsRadar() {
  const ctx = document.getElementById('statsRadarChart');
  if (!ctx || !window.Chart) return;
  
  new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['Frontend', 'Backend', 'Linux/Sys', 'Docker', 'IA', 'Curiosité'],
      datasets: [{
        label: 'Statistiques',
        data: [75, 80, 85, 90, 70, 95],
        fill: true,
        backgroundColor: 'rgba(212, 175, 55, 0.2)', // grimoire-gold with opacity
        borderColor: '#D4AF37', // grimoire-gold
        pointBackgroundColor: '#D4AF37',
        pointBorderColor: '#1A1A1A',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#D4AF37'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          angleLines: { color: 'rgba(26, 26, 26, 0.2)' },
          grid: { color: 'rgba(26, 26, 26, 0.2)' },
          pointLabels: {
            color: '#1A1A1A',
            font: { family: 'JetBrains Mono', size: 10, weight: 'bold' }
          },
          ticks: { display: false, min: 0, max: 100 }
        }
      },
      plugins: {
        legend: { display: false }
      }
    }
  });
  
  // Simulate stamp appearing after chart loads
  setTimeout(() => {
    const stamp = document.getElementById('stamp-linux');
    if(stamp) {
      stamp.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      stamp.style.opacity = '0.9';
      stamp.style.transform = 'rotate(-10deg) scale(1)';
    }
  }, 1500);
}
