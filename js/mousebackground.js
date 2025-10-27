// js/mouseBackground.js

export function initMouseBackground() {
  // Crear canvas para las olas
  const canvas = document.createElement('canvas');
  canvas.className = 'wave-canvas';
  canvas.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
  `;
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let width, height;
  
  // Array para almacenar las ondas activas
  const waves = [];
  
  // Ajustar tamaño del canvas
  function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
  }
  
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Clase para cada onda
  class Wave {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.radius = 0;
      this.maxRadius = 300;
      this.opacity = 0.4;
      this.speed = .1;
      this.decay = 0.0005;
    }

    update() {
      this.radius += this.speed;
      this.opacity -= this.decay;
      
      return this.opacity <= 0 || this.radius >= this.maxRadius;
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = this.opacity;
      
      const gradient = ctx.createRadialGradient(
        this.x, this.y, this.radius * 0.5,
        this.x, this.y, this.radius
      );
      
      gradient.addColorStop(0, 'rgba(71, 184, 6, 0)');
      gradient.addColorStop(0.5, 'rgba(92, 214, 10, 0.3)');
      gradient.addColorStop(1, 'rgba(168, 235, 18, 0)');
      
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
      
      ctx.strokeStyle = `rgba(71, 184, 6, ${this.opacity * 0.5})`;
      ctx.lineWidth = 2;
      ctx.stroke();
      
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius * 0.7, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(92, 214, 10, ${this.opacity * 0.3})`;
      ctx.lineWidth = 1;
      ctx.stroke();
      
      ctx.restore();
    }
  }

  let lastWaveTime = 0;
  const waveInterval = 100;

  function createWave(x, y) {
    const now = Date.now();
    if (now - lastWaveTime > waveInterval) {
      waves.push(new Wave(x, y));
      lastWaveTime = now;
    }
  }

  document.addEventListener('mousemove', (e) => {
    createWave(e.clientX, e.clientY);
  });

  document.addEventListener('click', (e) => {
    const clickWave = new Wave(e.clientX, e.clientY);
    clickWave.maxRadius = 200;
    clickWave.speed = .3;
    clickWave.opacity = 0.6;
    waves.push(clickWave);
  });

  // Animación
  function animate() {
    // ⭐ FADE MÁS SUAVE para no ocultar contenido
    ctx.fillStyle = 'rgba(232, 245, 233, 0.05)'; // Reducido de 0.05 a 0.02
    ctx.fillRect(0, 0, width, height);

    for (let i = waves.length - 1; i >= 0; i--) {
      const wave = waves[i];
      
      if (wave.update()) {
        waves.splice(i, 1);
      } else {
        wave.draw();
      }
    }

    requestAnimationFrame(animate);
  }

  animate();

  canvas._removeHandler = () => {
    window.removeEventListener('resize', resizeCanvas);
  };
}

export function cleanupMouseBackground() {
  const canvas = document.querySelector('.wave-canvas');
  if (canvas) {
    if (canvas._removeHandler) {
      canvas._removeHandler();
    }
    canvas.remove();
  }
}
