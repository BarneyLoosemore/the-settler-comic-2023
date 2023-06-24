const controls = `<div class="controls">
    <button class="prev" aria-label="Previous page">
      <svg
        stroke="currentColor"
        fill="currentColor"
        stroke-width="0"
        viewBox="0 0 256 512"
        size="40"
        height="40"
        width="40">
        <path
          d="M31.7 239l136-136c9.4-9.4 24.6-9.4 33.9 0l22.6 22.6c9.4 9.4 9.4 24.6 0 33.9L127.9 256l96.4 96.4c9.4 9.4 9.4 24.6 0 33.9L201.7 409c-9.4 9.4-24.6 9.4-33.9 0l-136-136c-9.5-9.4-9.5-24.6-.1-34z"></path>
      </svg>
    </button>
    <p class="page-number">0</p>
    <button class="next" aria-label="Next page">
      <svg
        stroke="currentColor"
        fill="currentColor"
        stroke-width="0"
        viewBox="0 0 256 512"
        size="40"
        height="40"
        width="40">
        <path
          d="M224.3 273l-136 136c-9.4 9.4-24.6 9.4-33.9 0l-22.6-22.6c-9.4-9.4-9.4-24.6 0-33.9l96.4-96.4-96.4-96.4c-9.4-9.4-9.4-24.6 0-33.9L54.3 103c9.4-9.4 24.6-9.4 33.9 0l136 136c9.5 9.4 9.5 24.6.1 34z"></path>
      </svg>
    </button>
  </div>`;

document.body.insertAdjacentHTML("beforeend", controls);

const images = Array.from(document.querySelectorAll("main img"));
const pageNumber = document.querySelector(".page-number");

let activeImage = 0;

const imageObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        const activeImageIndex = images.indexOf(img);
        pageNumber.textContent = activeImageIndex + 1;
        activeImage = activeImageIndex;
      }
    });
  },
  {
    threshold: 0.5,
  }
);

images.forEach((img) => {
  imageObserver.observe(img);
});

const nextButton = document.querySelector(".next");
const prevButton = document.querySelector(".prev");

nextButton.addEventListener("click", () => {
  const nextImage = images[activeImage + 1];
  if (nextImage) {
    nextImage.scrollIntoView({ behavior: "smooth" });
  }
});

prevButton.addEventListener("click", () => {
  const prevImage = images[activeImage - 1];
  if (prevImage) {
    prevImage.scrollIntoView({ behavior: "smooth" });
  }
});
