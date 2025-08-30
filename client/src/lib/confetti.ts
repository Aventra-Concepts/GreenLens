// Simple confetti animation utility
export function confetti() {
  // Create confetti particles
  const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
  const particleCount = 50;

  for (let i = 0; i < particleCount; i++) {
    createParticle(colors[Math.floor(Math.random() * colors.length)]);
  }
}

function createParticle(color: string) {
  const particle = document.createElement('div');
  particle.style.cssText = `
    position: fixed;
    width: 10px;
    height: 10px;
    background: ${color};
    pointer-events: none;
    z-index: 10000;
    border-radius: 50%;
    animation: confetti-fall 3s linear forwards;
    left: ${Math.random() * 100}vw;
    top: -10px;
    transform: rotate(${Math.random() * 360}deg);
  `;

  // Add CSS animation if not already present
  if (!document.getElementById('confetti-styles')) {
    const style = document.createElement('style');
    style.id = 'confetti-styles';
    style.textContent = `
      @keyframes confetti-fall {
        0% {
          transform: translateY(-10px) rotate(0deg);
          opacity: 1;
        }
        100% {
          transform: translateY(100vh) rotate(720deg);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(particle);

  // Remove particle after animation
  setTimeout(() => {
    if (particle.parentNode) {
      particle.parentNode.removeChild(particle);
    }
  }, 3000);
}