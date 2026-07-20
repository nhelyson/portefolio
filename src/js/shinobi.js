// --- SHINOBI PORTFOLIO ENGINE ---

// Global Lenis Instance
let lenis;

document.addEventListener("DOMContentLoaded", () => {
    initLenis();
    initGSAP();
    createLeaves();
    fetchGithubMissions();
    
    // Bind global functions
    window.enterScroll = enterScroll;
    window.scrollToMissions = scrollToMissions;

    // Intro Animation
    setTimeout(playIntroCinematic, 500);
});

// --- Smooth Scrolling (Lenis) ---
function initLenis() {
    lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
    });

    // We stop scrolling while the intro screen is active
    lenis.stop();

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
}

// --- GSAP Animations ---
function initGSAP() {
    gsap.registerPlugin(ScrollTrigger);

    // Reveal elements on scroll
    const revealElements = document.querySelectorAll('.gs-reveal');
    revealElements.forEach(el => {
        gsap.to(el, {
            scrollTrigger: {
                trigger: el,
                start: "top 85%",
                toggleActions: "play none none reverse"
            },
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out"
        });
    });
}

function playIntroCinematic() {
    const tl = gsap.timeline();
    
    // Animate Title (simulating ink draw)
    tl.fromTo("#intro-name", 
        { opacity: 0, scale: 1.5, filter: "blur(10px)" },
        { opacity: 1, scale: 1, filter: "blur(0px)", duration: 2, ease: "power4.out" }
    )
    .to("#intro-subtitle", { opacity: 1, y: 0, duration: 1, ease: "power2.out" }, "-=1")
    .to("#intro-actions", { opacity: 1, duration: 1 }, "-=0.5");
}

function enterScroll() {
    const intro = document.getElementById('intro-screen');
    
    gsap.to(intro, {
        y: "-100%",
        duration: 1.2,
        ease: "power4.inOut",
        onComplete: () => {
            intro.style.display = 'none';
            lenis.start(); // Enable scrolling
        }
    });
}

function scrollToMissions() {
    enterScroll();
    setTimeout(() => {
        lenis.scrollTo('#missions');
    }, 1200);
}

// --- Visual Effects (Leaves Particle System) ---
function createLeaves() {
    const container = document.getElementById('particles-container');
    const leafCount = 20; // Number of leaves

    for(let i = 0; i < leafCount; i++) {
        spawnLeaf(container, i);
    }
}

function spawnLeaf(container, delayMultiplier) {
    const leaf = document.createElement('div');
    leaf.classList.add('leaf');
    
    // Randomize properties
    const startX = Math.random() * 100; // vw
    const duration = 5 + Math.random() * 5; // 5s to 10s
    const delay = Math.random() * 10;
    
    leaf.style.left = `${startX}vw`;
    leaf.style.animationDuration = `${duration}s`;
    leaf.style.animationDelay = `${delay}s`;
    
    container.appendChild(leaf);
    
    // Respawn leaf infinitely
    leaf.addEventListener('animationend', () => {
        leaf.remove();
        spawnLeaf(container, 0); // Respawn without initial large delay
    });
}


// --- GitHub Missions System ---
const GITHUB_USERNAME = 'nhelyson';

async function fetchGithubMissions() {
    const container = document.getElementById('github-missions-container');
    
    try {
        const res = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=6`);
        if (!res.ok) throw new Error('GitHub API Error');
        const repos = await res.json();
        
        container.innerHTML = ''; // Clear loader
        
        repos.forEach(repo => {
            container.appendChild(createMissionCard(repo));
        });
        
    } catch(err) {
        console.error(err);
        container.innerHTML = `<div class="col-span-full text-center text-shinobi-red">Impossible d'accéder aux archives secrètes (API Limit).</div>`;
    }
}

function createMissionCard(repo) {
    const rank = determineMissionRank(repo);
    const card = document.createElement('div');
    card.className = "bg-shinobi-black border border-shinobi-stone/30 p-6 relative overflow-hidden group hover:border-shinobi-red/50 transition-colors";
    
    // Decoration tape/seal
    card.innerHTML = `
        <div class="absolute -top-6 -right-6 w-16 h-16 bg-shinobi-red rotate-45 group-hover:scale-110 transition-transform flex items-end justify-center pb-1">
            <span class="text-shinobi-parchment font-title font-bold -rotate-45 text-sm">${rank}</span>
        </div>
        
        <h4 class="font-title text-xl text-shinobi-parchment mb-2 pr-8">${repo.name.replace(/-/g, ' ').toUpperCase()}</h4>
        <p class="font-sans text-sm text-shinobi-stone mb-4 line-clamp-3 min-h-[60px]">
            ${repo.description || "Mission secrète dont les détails sont cryptés."}
        </p>
        
        <div class="flex flex-wrap gap-2 mb-6">
            ${repo.language ? `<span class="px-2 py-1 bg-shinobi-stone/20 text-shinobi-parchment text-xs font-mono rounded">${repo.language}</span>` : ''}
        </div>
        
        <div class="flex gap-4">
            <a href="${repo.html_url}" target="_blank" class="text-sm font-title text-shinobi-red hover:text-shinobi-orange transition-colors flex items-center gap-1">
                Consulter <i data-lucide="external-link" class="w-4 h-4"></i>
            </a>
            ${repo.homepage ? `<a href="${repo.homepage}" target="_blank" class="text-sm font-title text-shinobi-stone hover:text-white transition-colors flex items-center gap-1">Démo <i data-lucide="eye" class="w-4 h-4"></i></a>` : ''}
        </div>
    `;
    return card;
}

function determineMissionRank(repo) {
    let score = 0;
    if(repo.size > 5000) score += 2;
    if(repo.stargazers_count > 0) score += 1;
    if(repo.has_pages) score += 1;
    if(['TypeScript', 'Rust', 'C++'].includes(repo.language)) score += 1;
    
    if(score >= 4) return 'S';
    if(score >= 3) return 'A';
    if(score >= 1) return 'B';
    return 'C';
}
