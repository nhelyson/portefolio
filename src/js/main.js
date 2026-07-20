import { initCanvas } from './canvas.js';
import { initGitHubData } from './github.js';
import { initCarousel } from './carousel.js';

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  initLenis();
  initCanvas();
  initCustomCursor();
  initAnimations();
  initCounters();
  initContactForm();
  initReadingProgress();
  initMobileMenu();

  // Load GitHub repos & populate carousel
  initGitHubData((projects) => {
    initCarousel(projects);
  });
});

/**
 * Lenis Smooth Scroll Initialization
 */
function initLenis() {
  if (typeof window.Lenis === 'undefined') {
    window.scrollToSection = (selector) => {
      const el = document.querySelector(selector);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    };
    return;
  }

  const lenis = new window.Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1,
    smoothTouch: false
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }

  requestAnimationFrame(raf);

  // Expose smooth scroll function for internal links
  window.scrollToSection = (selector) => {
    const el = document.querySelector(selector);
    if (el) lenis.scrollTo(el);
  };
}

/**
 * Custom Cursor for Desktop
 */
function initCustomCursor() {
  const cursorDot = document.getElementById('cursor-dot');
  const cursorRing = document.getElementById('cursor-ring');

  if (!cursorDot || !cursorRing || window.innerWidth < 1024) return;

  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
  });

  function renderRing() {
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;

    cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
    requestAnimationFrame(renderRing);
  }

  renderRing();

  // Hover states for interactive elements
  const interactiveElements = document.querySelectorAll('a, button, input, textarea, .glass-panel');
  interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursorRing.style.width = '50px';
      cursorRing.style.height = '50px';
      cursorRing.style.backgroundColor = 'rgba(56, 189, 248, 0.1)';
    });
    el.addEventListener('mouseleave', () => {
      cursorRing.style.width = '36px';
      cursorRing.style.height = '36px';
      cursorRing.style.backgroundColor = 'transparent';
    });
  });
}

/**
 * Reveal Animations (Intersection Observer + GSAP fallback)
 */
function initAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('opacity-100', 'translate-y-0');
        entry.target.classList.remove('opacity-0', 'translate-y-10');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.animate-reveal').forEach(el => {
    el.classList.add('transition-all', 'duration-700', 'ease-out', 'opacity-0', 'translate-y-10');
    observer.observe(el);
  });
}

/**
 * Animated Counter Metrics
 */
function initCounters() {
  const counterElements = document.querySelectorAll('.counter-val');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const targetVal = parseInt(el.dataset.target, 10);
        let current = 0;
        const increment = Math.max(1, Math.ceil(targetVal / 40));

        const timer = setInterval(() => {
          current += increment;
          if (current >= targetVal) {
            el.innerText = targetVal + (el.dataset.suffix || '');
            clearInterval(timer);
          } else {
            el.innerText = current + (el.dataset.suffix || '');
          }
        }, 30);

        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counterElements.forEach(el => observer.observe(el));
}

/**
 * Reading Progress & Navbar state on scroll
 */
function initReadingProgress() {
  const progressBar = document.getElementById('reading-progress');
  const navbar = document.getElementById('navbar');

  window.addEventListener('scroll', () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;

    if (progressBar) {
      progressBar.style.width = `${progress}%`;
    }

    if (navbar) {
      if (window.scrollY > 50) {
        navbar.classList.add('bg-slate-950/80', 'backdrop-blur-md', 'border-b', 'border-slate-800/80', 'py-3');
        navbar.classList.remove('py-5');
      } else {
        navbar.classList.remove('bg-slate-950/80', 'border-b', 'border-slate-800/80', 'py-3');
        navbar.classList.add('py-5');
      }
    }
  });
}

/**
 * Mobile Navigation Toggle
 */
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobile-menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');

  if (!toggleBtn || !mobileMenu) return;

  toggleBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
  });

  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.add('hidden');
    });
  });
}

/**
 * Form Validation & Toast Notification
 */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const toast = document.getElementById('toast-notification');
  const toastMessage = document.getElementById('toast-message');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('contact-name')?.value.trim();
    const email = document.getElementById('contact-email')?.value.trim();
    const message = document.getElementById('contact-message')?.value.trim();

    if (!name || !email || !message) {
      showToast("Veuillez remplir tous les champs obligatoires.", "error");
      return;
    }

    // Submit animation simulation
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<span class="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block"></span> Envoi en cours...`;

    setTimeout(() => {
      btn.disabled = false;
      btn.innerHTML = originalText;
      form.reset();
      showToast("Merci ! Votre message a été envoyé avec succès.", "success");
    }, 1200);
  });

  function showToast(msg, type = "success") {
    if (!toast || !toastMessage) return;
    toastMessage.innerText = msg;
    toast.classList.remove('hidden', 'translate-y-10', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');

    if (type === "error") {
      toast.classList.remove('border-emerald-500/30', 'bg-emerald-950/90');
      toast.classList.add('border-red-500/30', 'bg-red-950/90');
    } else {
      toast.classList.remove('border-red-500/30', 'bg-red-950/90');
      toast.classList.add('border-emerald-500/30', 'bg-emerald-950/90');
    }

    setTimeout(() => {
      toast.classList.add('translate-y-10', 'opacity-0');
      setTimeout(() => toast.classList.add('hidden'), 300);
    }, 4000);
  }

  // Copy contact to clipboard
  window.copyContactInfo = (text, label) => {
    navigator.clipboard.writeText(text);
    showToast(`${label} copié dans le presse-papier !`, "success");
  };
}
