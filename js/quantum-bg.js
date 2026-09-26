/* ==========================================================================
   LAQUMO PARALLAX QUANTUM BACKGROUND & SCROLL TRACKER (js/quantum-bg.js)
   Multi-layered Parallax Orbits, Wave Grid & Reading Progress
   ========================================================================== */

(function() {
  const canvas = document.getElementById('quantum-bg-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  let mouse = { x: null, y: null, radius: 150 };
  let scrollY = 0;

  let isMobile = window.innerWidth <= 768;
  const PARTICLE_COUNT = isMobile ? 16 : 40;
  const CONNECT_DISTANCE = isMobile ? 90 : 140;
  let animFrameId = null;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    isMobile = width <= 768;
  }

  class ParallaxParticle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.baseY = this.y;
      this.depth = Math.random() * 0.6 + 0.4; // Parallax depth layer
      this.vx = (Math.random() - 0.5) * 0.3 * this.depth;
      this.vy = (Math.random() - 0.5) * 0.3 * this.depth;
      this.radius = Math.random() * 2.5 * this.depth + 1;
      this.isCrimson = Math.random() > 0.65;
      this.phase = Math.random() * Math.PI * 2;
      this.phaseSpeed = 0.015 + Math.random() * 0.015;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.phase += this.phaseSpeed;

      // Parallax scroll effect
      const currentY = this.y - scrollY * (this.depth * 0.15);

      if (this.x < 0) this.x = width;
      if (this.x > width) this.x = 0;
      if (this.y < 0) this.y = height;
      if (this.y > height) this.y = 0;

      if (!isMobile && mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - currentY;
        const dist = Math.hypot(dx, dy);
        if (dist < mouse.radius) {
          const force = (1 - dist / mouse.radius) * 0.7;
          this.x -= (dx / dist) * force;
          this.y -= (dy / dist) * force;
        }
      }
    }

    draw() {
      const glow = Math.sin(this.phase) * 0.2 + 0.8;
      const drawY = this.y - scrollY * (this.depth * 0.15);

      ctx.beginPath();
      ctx.arc(this.x, drawY, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.isCrimson 
        ? `rgba(225, 29, 72, ${0.45 * glow * this.depth})` 
        : `rgba(217, 119, 6, ${0.4 * glow * this.depth})`;
      ctx.fill();
    }
  }

  function init() {
    resize();
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new ParallaxParticle());
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const p1 = particles[i];
        const p2 = particles[j];
        const p1Y = p1.y - scrollY * (p1.depth * 0.15);
        const p2Y = p2.y - scrollY * (p2.depth * 0.15);

        const dx = p1.x - p2.x;
        const dy = p1Y - p2Y;
        const distSq = dx * dx + dy * dy;

        if (distSq < CONNECT_DISTANCE * CONNECT_DISTANCE) {
          const dist = Math.sqrt(distSq);
          const alpha = (1 - dist / CONNECT_DISTANCE) * 0.12 * Math.min(p1.depth, p2.depth);
          ctx.beginPath();
          ctx.moveTo(p1.x, p1Y);
          ctx.lineTo(p2.x, p2Y);
          ctx.strokeStyle = `rgba(15, 23, 42, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    particles.forEach(p => {
      p.update();
      p.draw();
    });

    if (!document.hidden) {
      animFrameId = requestAnimationFrame(animate);
    }
  }

  // Scroll and Parallax Handlers (Passive for 60 FPS mobile scrolling)
  window.addEventListener('scroll', () => {
    scrollY = window.scrollY || window.pageYOffset;

    // Update reading progress bar
    const bar = document.getElementById('reading-progress');
    if (bar) {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
      bar.style.width = `${progress}%`;
    }

    // Parallax Orbs (Only on desktop for performance)
    if (!isMobile) {
      const orb1 = document.querySelector('.orb-1');
      const orb2 = document.querySelector('.orb-2');
      const orb3 = document.querySelector('.orb-3');

      if (orb1) orb1.style.transform = `translateY(${scrollY * 0.12}px)`;
      if (orb2) orb2.style.transform = `translateY(${-scrollY * 0.08}px)`;
      if (orb3) orb3.style.transform = `translateY(${scrollY * 0.05}px)`;
    }
  }, { passive: true });

  window.addEventListener('resize', () => resize(), { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (animFrameId) cancelAnimationFrame(animFrameId);
    } else {
      animate();
    }
  });
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  init();
  animate();
})();
