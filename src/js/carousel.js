/**
 * Responsive Projects Carousel with Touch Swipe & Smooth Animations
 */
export function initCarousel(projects) {
  const container = document.getElementById('projects-carousel-container');
  const dotsContainer = document.getElementById('carousel-dots');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');

  if (!container) return;

  let currentIndex = 0;
  let touchStartX = 0;
  let touchEndX = 0;

  // Render cards
  container.innerHTML = projects.map((p, idx) => {
    const formattedDate = new Date(p.updated_at).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    const topicsBadges = (p.topics || ['code'])
      .slice(0, 4)
      .map(t => `<span class="px-2.5 py-1 text-[11px] font-mono bg-brand-blue/10 text-brand-cyan border border-brand-blue/20 rounded-full">#${t}</span>`)
      .join(' ');

    return `
      <div class="carousel-slide min-w-full md:min-w-[50%] lg:min-w-[33.333%] p-3 transition-transform duration-500 ease-out" data-index="${idx}">
        <div class="glass-panel glass-panel-hover rounded-2xl p-6 h-full flex flex-col justify-between relative overflow-hidden group">
          <div class="absolute -right-12 -top-12 w-32 h-32 bg-brand-blue/10 rounded-full blur-2xl group-hover:bg-brand-blue/20 transition-all duration-500"></div>
          
          <div>
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center space-x-2">
                <span class="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
                <span class="text-xs font-mono text-slate-400">${p.language || 'Code'}</span>
              </div>
              <div class="flex items-center space-x-1.5 text-xs text-amber-400 font-mono bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                <i data-lucide="star" class="w-3.5 h-3.5 fill-amber-400"></i>
                <span>${p.stargazers_count}</span>
              </div>
            </div>

            <h3 class="text-xl font-display font-bold text-white mb-2 group-hover:text-brand-cyan transition-colors flex items-center gap-2">
              ${p.name}
            </h3>

            <p class="text-slate-400 text-sm mb-6 line-clamp-3 leading-relaxed">
              ${p.description}
            </p>

            <div class="flex flex-wrap gap-1.5 mb-6">
              ${topicsBadges}
            </div>
          </div>

          <div>
            <div class="text-[11px] font-mono text-slate-500 mb-4 border-t border-slate-800/80 pt-3 flex justify-between">
              <span>Mise à jour : ${formattedDate}</span>
              <span>Dépôt Public</span>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <button onclick="openReadmeModal('${p.name}')" class="px-3 py-2 text-xs font-medium text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/50 rounded-xl transition flex items-center justify-center gap-1.5">
                <i data-lucide="file-text" class="w-3.5 h-3.5 text-brand-blue"></i>
                <span>Aperçu</span>
              </button>
              <a href="${p.html_url}" target="_blank" rel="noopener noreferrer" class="px-3 py-2 text-xs font-medium text-white bg-brand-blue hover:bg-blue-600 rounded-xl transition flex items-center justify-center gap-1.5 shadow-lg shadow-blue-500/20">
                <i data-lucide="github" class="w-3.5 h-3.5"></i>
                <span>GitHub</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Re-initialize lucide icons for newly rendered DOM elements
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Dots
  const getVisibleCount = () => {
    if (window.innerWidth >= 1024) return 3;
    if (window.innerWidth >= 768) return 2;
    return 1;
  };

  const updateDots = () => {
    if (!dotsContainer) return;
    const maxIndex = Math.max(0, projects.length - getVisibleCount());
    dotsContainer.innerHTML = Array.from({ length: maxIndex + 1 }, (_, i) => `
      <button class="w-2.5 h-2.5 rounded-full transition-all duration-300 ${i === currentIndex ? 'bg-brand-cyan w-6' : 'bg-slate-700 hover:bg-slate-500'}" data-slide="${i}"></button>
    `).join('');

    dotsContainer.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        currentIndex = parseInt(btn.dataset.slide);
        slideCarousel();
      });
    });
  };

  const slideCarousel = () => {
    const visibleCount = getVisibleCount();
    const maxIndex = Math.max(0, projects.length - visibleCount);
    if (currentIndex > maxIndex) currentIndex = maxIndex;
    if (currentIndex < 0) currentIndex = 0;

    const stepPct = 100 / visibleCount;
    container.style.transform = `translateX(-${currentIndex * stepPct}%)`;
    updateDots();
  };

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      currentIndex--;
      slideCarousel();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      currentIndex++;
      slideCarousel();
    });
  }

  // Touch Swipe
  container.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  container.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    if (touchStartX - touchEndX > 40) {
      currentIndex++;
      slideCarousel();
    } else if (touchEndX - touchStartX > 40) {
      currentIndex--;
      slideCarousel();
    }
  }, { passive: true });

  window.addEventListener('resize', slideCarousel);
  updateDots();
  slideCarousel();
}
