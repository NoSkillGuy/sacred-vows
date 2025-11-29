import { useEffect } from 'react';

function ConfettiLayer() {
  useEffect(() => {
    const colors = ["#d4af37", "#c27d88", "#9bb69d", "#f6c1c7", "#f5d48a"];
    const flowers = ["🌸", "🌺", "🌼", "💮"];

    function launchConfetti() {
      const layer = document.getElementById("confettiLayer");
      if (!layer) return;

      const pieces = 70;
      const duration = 2800;

      for (let i = 0; i < pieces; i++) {
        const piece = document.createElement("div");
        piece.className = "confetti-piece";
        const startX = Math.random() * 100;
        const endX = startX + (Math.random() * 20 - 10);
        piece.style.left = startX + "vw";
        piece.style.setProperty("--x", "0vw");
        piece.style.setProperty("--xEnd", endX + "vw");
        piece.style.background = colors[Math.floor(Math.random() * colors.length)];
        piece.style.animationDuration = (2 + Math.random() * 1.2) + "s";
        const delay = Math.random() * 0.4;
        piece.style.animationDelay = delay + "s";
        piece.setAttribute(
          "data-end-time",
          (Date.now() + (parseFloat(piece.style.animationDuration) + delay) * 1000).toString()
        );
        layer.appendChild(piece);
      }

      for (let i = 0; i < 20; i++) {
        const flower = document.createElement("div");
        flower.className = "flower-piece";
        const startX = Math.random() * 100;
        const endX = startX + (Math.random() * 15 - 7);
        flower.style.left = startX + "vw";
        flower.style.setProperty("--x", "0vw");
        flower.style.setProperty("--xEnd", endX + "vw");
        flower.textContent = flowers[Math.floor(Math.random() * flowers.length)];
        const fDuration = 3 + Math.random() * 1.5;
        const fDelay = Math.random() * 0.4;
        flower.style.animationDuration = fDuration + "s";
        flower.style.animationDelay = fDelay + "s";
        flower.setAttribute(
          "data-end-time",
          (Date.now() + (fDuration + fDelay) * 1000).toString()
        );
        layer.appendChild(flower);
      }

      setTimeout(() => {
        const now = Date.now();
        Array.from(layer.children).forEach((node) => {
          const endTime = parseInt(node.getAttribute("data-end-time") || "0", 10);
          if (endTime && endTime < now) {
            node.remove();
          }
        });
      }, duration + 1000);
    }

    window.launchCelebration = launchConfetti;

    setTimeout(launchConfetti, 1500);

    window.addEventListener("guestNameUpdated", launchConfetti);

    return () => {
      window.removeEventListener("guestNameUpdated", launchConfetti);
    };
  }, []);

  return <div id="confettiLayer" className="confetti-layer" aria-hidden="true"></div>;
}

export default ConfettiLayer;

