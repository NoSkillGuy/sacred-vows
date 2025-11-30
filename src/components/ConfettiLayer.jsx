import { useEffect } from 'react';

function ConfettiLayer() {
  useEffect(() => {
    const colors = ["#d4af37", "#c27d88", "#9bb69d", "#f6c1c7", "#f5d48a"];
    const flowers = ["🌸", "🌺", "🌼", "💮"];

    function clearAllConfetti() {
      const layer = document.getElementById("confettiLayer");
      if (layer) {
        while (layer.firstChild) {
          layer.firstChild.remove();
        }
      }
    }

    function launchConfetti() {
      const layer = document.getElementById("confettiLayer");
      if (!layer) return;

      const pieces = 70;
      const maxDuration = 4800;

      const { startTop, fallDistance } = (() => {
        const previewContainer = layer.closest('[data-preview-scroll-container]');
        if (previewContainer) {
          const containerRect = previewContainer.getBoundingClientRect();
          const layerRect = layer.getBoundingClientRect();
          const relativeTop = previewContainer.scrollTop + (containerRect.top - layerRect.top);
          return {
            startTop: Math.max(relativeTop, 0),
            fallDistance: previewContainer.clientHeight + 200,
          };
        }
        return {
          startTop: 0,
          fallDistance: window.innerHeight + 200,
        };
      })();

      const launchTop = Math.max(startTop - 40, 0);
      const burstLayer = document.createElement("div");
      burstLayer.className = "confetti-burst";
      layer.appendChild(burstLayer);

      for (let i = 0; i < pieces; i++) {
        const piece = document.createElement("div");
        piece.className = "confetti-piece";
        const startX = Math.random() * 100;
        const endX = startX + (Math.random() * 20 - 10);
        piece.style.left = startX + "vw";
        piece.style.top = `${launchTop}px`;
        piece.style.setProperty("--x", "0vw");
        piece.style.setProperty("--xEnd", endX + "vw");
        piece.style.setProperty("--fall-distance", `${fallDistance}px`);
        piece.style.background = colors[Math.floor(Math.random() * colors.length)];
        const animDuration = 2 + Math.random() * 1.2;
        const delay = Math.random() * 0.4;
        piece.style.animationDuration = animDuration + "s";
        piece.style.animationDelay = delay + "s";
        piece.setAttribute(
          "data-end-time",
          (Date.now() + (animDuration + delay) * 1000).toString()
        );

        piece.addEventListener("animationend", () => {
          if (piece.parentNode) {
            piece.remove();
          }
        }, { once: true });

        burstLayer.appendChild(piece);
      }

      for (let i = 0; i < 20; i++) {
        const flower = document.createElement("div");
        flower.className = "flower-piece";
        const startX = Math.random() * 100;
        const endX = startX + (Math.random() * 15 - 7);
        flower.style.left = startX + "vw";
        flower.style.top = `${launchTop}px`;
        flower.style.setProperty("--x", "0vw");
        flower.style.setProperty("--xEnd", endX + "vw");
        flower.style.setProperty("--fall-distance", `${fallDistance + 80}px`);
        flower.textContent = flowers[Math.floor(Math.random() * flowers.length)];
        const fDuration = 3 + Math.random() * 1.5;
        const fDelay = Math.random() * 0.4;
        flower.style.animationDuration = fDuration + "s";
        flower.style.animationDelay = fDelay + "s";
        flower.setAttribute(
          "data-end-time",
          (Date.now() + (fDuration + fDelay) * 1000).toString()
        );

        flower.addEventListener("animationend", () => {
          if (flower.parentNode) {
            flower.remove();
          }
        }, { once: true });

        burstLayer.appendChild(flower);
      }

      setTimeout(() => {
        burstLayer.remove();
      }, maxDuration);
    }

    window.launchCelebration = launchConfetti;

    const cleanupInterval = setInterval(() => {
      const layer = document.getElementById("confettiLayer");
      if (layer && layer.children.length > 0) {
        const now = Date.now();
        Array.from(layer.children).forEach((node) => {
          const endTime = node.getAttribute("data-end-time");
          if (endTime && parseInt(endTime, 10) < now) {
            node.remove();
          }
        });
      }
    }, 3000);

    setTimeout(launchConfetti, 1500);

    window.addEventListener("guestNameUpdated", launchConfetti);

    return () => {
      window.removeEventListener("guestNameUpdated", launchConfetti);
      clearInterval(cleanupInterval);
      clearAllConfetti();
    };
  }, []);

  return <div id="confettiLayer" className="confetti-layer" aria-hidden="true"></div>;
}

export default ConfettiLayer;

