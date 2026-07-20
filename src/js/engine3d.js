import { initializeRPG } from './rpg-system.js';

// --- Global Variables ---
let scene, camera, renderer;
let bookGroup, coverMesh, pageMesh;
let particlesSystem;
let isBookOpen = false;

// --- Initialize Engine ---
export function initEngine() {
  const canvas = document.getElementById('webgl-canvas');
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0a0b1a, 0.015);

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 5, 20);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
  scene.add(ambientLight);

  const spotLight = new THREE.SpotLight(0xd4af37, 1.5);
  spotLight.position.set(0, 15, 5);
  spotLight.angle = Math.PI / 4;
  spotLight.penumbra = 0.5;
  spotLight.castShadow = true;
  scene.add(spotLight);

  // Create Book
  createBook();

  // Create Particles (Weather/Magic)
  createParticles();

  // Resize Handler
  window.addEventListener('resize', onWindowResize);

  // Animation Loop
  renderer.setAnimationLoop(animate);

  // Start Sequence
  simulateLoading();
}

function createBook() {
  bookGroup = new THREE.Group();

  // Cover
  const coverGeometry = new THREE.BoxGeometry(10, 0.5, 14);
  const coverMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x3E2723, 
    roughness: 0.8,
    metalness: 0.2
  });
  coverMesh = new THREE.Mesh(coverGeometry, coverMaterial);
  coverMesh.castShadow = true;
  coverMesh.receiveShadow = true;
  bookGroup.add(coverMesh);

  // Pages (Thick block)
  const pagesGeometry = new THREE.BoxGeometry(9.5, 0.4, 13.5);
  const pagesMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xF3E5AB,
    roughness: 1.0 
  });
  pageMesh = new THREE.Mesh(pagesGeometry, pagesMaterial);
  pageMesh.position.y = 0.1;
  bookGroup.add(pageMesh);

  // Initial Book Position (Closed, floating)
  bookGroup.position.set(0, -2, 0);
  bookGroup.rotation.x = -Math.PI / 6;
  
  scene.add(bookGroup);
}

function createParticles() {
  const particleCount = 1000;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);

  for(let i = 0; i < particleCount * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 40;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  
  const material = new THREE.PointsMaterial({
    color: 0xd4af37,
    size: 0.1,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending
  });

  particlesSystem = new THREE.Points(geometry, material);
  scene.add(particlesSystem);
}

function simulateLoading() {
  let progress = 0;
  const bar = document.getElementById('loading-bar');
  const btn = document.getElementById('start-btn');
  const text = document.querySelector('#loading-screen p');

  const interval = setInterval(() => {
    progress += Math.random() * 15;
    if(progress >= 100) {
      progress = 100;
      clearInterval(interval);
      text.innerText = "L'univers est prêt.";
      bar.style.width = '100%';
      setTimeout(() => {
        btn.classList.remove('hidden');
        gsap.to(btn, { opacity: 1, duration: 1 });
      }, 500);
    }
    bar.style.width = `${progress}%`;
  }, 200);

  btn.addEventListener('click', () => {
    document.getElementById('loading-screen').style.opacity = '0';
    setTimeout(() => {
      document.getElementById('loading-screen').classList.add('hidden');
      startCinematic();
    }, 1000);
  });
}

function startCinematic() {
  // Cinematic Camera Fly-in & Book Float
  gsap.to(camera.position, {
    z: 12,
    y: 8,
    duration: 3,
    ease: "power2.inOut"
  });

  gsap.to(bookGroup.rotation, {
    x: 0,
    y: 0,
    z: 0,
    duration: 3,
    ease: "power2.inOut"
  });

  gsap.to(bookGroup.position, {
    y: 0,
    duration: 3,
    ease: "power2.inOut",
    onComplete: openBook
  });
}

function openBook() {
  isBookOpen = true;
  
  // Animate cover opening (Simulated via scaling / fading into UI for now)
  // Real 3D page bending requires complex shaders. 
  // We transition to HTML Overlay for crisp text and interaction.
  gsap.to(bookGroup.scale, {
    x: 1.5,
    y: 0.1, // Flatten book block
    z: 1.5,
    duration: 1.5,
    ease: "power3.inOut"
  });

  setTimeout(() => {
    // Show HTML UI Overlay on top of 3D Book
    const uiLayer = document.getElementById('book-ui-layer');
    uiLayer.classList.remove('hidden');
    
    // Animate UI Layer fading in
    gsap.fromTo(uiLayer, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 1 });
    
    // Show RPG HUD
    const hud = document.getElementById('rpg-hud');
    hud.style.opacity = '1';
    
    // Show Sage
    document.getElementById('sage-companion').classList.remove('hidden');

    initializeRPG();
  }, 1000);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate(time) {
  // Particles animation
  if (particlesSystem) {
    const positions = particlesSystem.geometry.attributes.position.array;
    for(let i = 1; i < positions.length; i += 3) {
      positions[i] -= 0.02; // Fall down
      if(positions[i] < -10) positions[i] = 10;
    }
    particlesSystem.geometry.attributes.position.needsUpdate = true;
    particlesSystem.rotation.y += 0.001;
  }

  // Floating book
  if (!isBookOpen && bookGroup) {
    bookGroup.position.y = -2 + Math.sin(time / 1000) * 0.2;
  }

  renderer.render(scene, camera);
}

// Start
initEngine();
