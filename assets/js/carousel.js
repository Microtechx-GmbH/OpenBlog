/**
 * OpenBlog Carousel Controller
 * Enables responsive, touch-friendly, cyclic carousel navigation for blog cards.
 */

(function () {
  function initCarousel() {
    const carousel = document.getElementById('posts-carousel');
    if (!carousel) return;

    const track = document.getElementById('carousel-track');
    const slides = Array.from(track.querySelectorAll('.carousel-slide'));
    const prevBtn = document.querySelector('.carousel-prev-btn');
    const nextBtn = document.querySelector('.carousel-next-btn');
    const pagination = document.getElementById('carousel-pagination');

    if (!track || slides.length === 0) return;

    let currentIndex = 0;
    let touchStartX = 0;
    let touchEndX = 0;

    function getVisibleCount() {
      const width = window.innerWidth;
      if (width >= 1024) return 3;
      if (width >= 680) return 2;
      return 1;
    }

    function getMaxIndex() {
      const visible = getVisibleCount();
      return Math.max(0, slides.length - visible);
    }

    function updateCarousel() {
      const visible = getVisibleCount();
      const maxIndex = getMaxIndex();

      if (currentIndex > maxIndex) {
        currentIndex = maxIndex;
      }
      if (currentIndex < 0) {
        currentIndex = 0;
      }

      // Calculate shift percentage or pixel distance
      if (slides.length > 0) {
        const slideWidth = slides[0].getBoundingClientRect().width;
        const gap = parseFloat(getComputedStyle(track).gap) || 32;
        const offset = currentIndex * (slideWidth + gap);
        track.style.transform = `translateX(-${offset}px)`;
      }

      // Update pagination dots
      renderPagination();
    }

    function renderPagination() {
      if (!pagination) return;
      const maxIndex = getMaxIndex();
      pagination.innerHTML = '';

      if (maxIndex === 0) {
        pagination.style.display = 'none';
        return;
      }
      pagination.style.display = 'flex';

      for (let i = 0; i <= maxIndex; i++) {
        const dot = document.createElement('button');
        dot.className = `carousel-dot ${i === currentIndex ? 'active' : ''}`;
        dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
        dot.setAttribute('type', 'button');
        dot.addEventListener('click', () => {
          currentIndex = i;
          updateCarousel();
        });
        pagination.appendChild(dot);
      }
    }

    function goNext() {
      const maxIndex = getMaxIndex();
      if (currentIndex >= maxIndex) {
        currentIndex = 0; // Cyclic loop for continuous rearranging
      } else {
        currentIndex++;
      }
      updateCarousel();
    }

    function goPrev() {
      const maxIndex = getMaxIndex();
      if (currentIndex <= 0) {
        currentIndex = maxIndex; // Cyclic loop
      } else {
        currentIndex--;
      }
      updateCarousel();
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', goNext);
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', goPrev);
    }

    // Touch & Mouse Drag Support
    let isDragging = false;

    carousel.addEventListener('mousedown', (e) => {
      // Don't drag if clicking buttons or links
      if (e.target.closest('a') || e.target.closest('button')) return;
      isDragging = true;
      touchStartX = e.clientX;
    });

    window.addEventListener('mouseup', (e) => {
      if (!isDragging) return;
      isDragging = false;
      touchEndX = e.clientX;
      handleSwipe();
    });

    carousel.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    carousel.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });

    function handleSwipe() {
      const threshold = 40;
      if (touchEndX < touchStartX - threshold) {
        goNext();
      } else if (touchEndX > touchStartX + threshold) {
        goPrev();
      }
    }

    // Keyboard navigation when carousel has focus
    carousel.setAttribute('tabindex', '0');
    carousel.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') {
        goNext();
      } else if (e.key === 'ArrowLeft') {
        goPrev();
      }
    });

    // Window resize handler with debounce
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        updateCarousel();
      }, 100);
    });

    // Initialize layout
    updateCarousel();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCarousel);
  } else {
    initCarousel();
  }
})();
