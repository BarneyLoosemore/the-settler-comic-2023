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
        // TODO: add anchor to url
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
