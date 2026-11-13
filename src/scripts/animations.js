const style = document.createElement("style");
style.textContent = `
  #scroll-progress {
    position: fixed;
    inset: 0 auto auto 0;
    z-index: 9999;
    width: 100%;
    height: 4px;
    background: #8b5cf6;
    transform: scaleX(0);
    transform-origin: left;
    pointer-events: none;
  }

  .animate-on-scroll {
    opacity: 0;
    transform: translateY(24px);
    transition: opacity 700ms ease, transform 700ms ease;
  }

  .animate-on-scroll.is-visible {
    opacity: 1;
    transform: translateY(0);
  }

  @media (prefers-reduced-motion: reduce) {
    .animate-on-scroll {
      opacity: 1;
      transform: none;
      transition: none;
    }
  }
`;
document.head.appendChild(style);


const progressBar = document.createElement("div");
progressBar.id = "scroll-progress";
progressBar.setAttribute("aria-hidden", "true");
document.body.prepend(progressBar);

function updateProgress() {
  const maxScroll =
    document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
  progressBar.style.transform = `scaleX(${progress})`;
}

let frameRequested = false;

window.addEventListener(
  "scroll",
  () => {
    if (frameRequested) return;
    frameRequested = true;
    window.requestAnimationFrame(() => {
      updateProgress();
      frameRequested = false;
    });
  },
  { passive: true }
);

window.addEventListener("resize", updateProgress);
updateProgress();

const items = document.querySelectorAll(
  ".hero h1, .hero p, .hero .text-link, .content-section, footer"
);

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

if (prefersReducedMotion) {
  items.forEach((item) => item.classList.add("is-visible"));
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  items.forEach((item) => {
    item.classList.add("animate-on-scroll");
    observer.observe(item);
  });
}