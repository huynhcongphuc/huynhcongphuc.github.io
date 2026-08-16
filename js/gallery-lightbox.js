(() => {
  const galleryImages = [...document.querySelectorAll('main img')];
  if (!galleryImages.length) return;

  const lightbox = document.createElement('div');
  lightbox.className = 'image-lightbox';
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-modal', 'true');
  lightbox.setAttribute('aria-label', 'Xem ảnh phóng lớn');
  lightbox.hidden = true;
  lightbox.innerHTML = `
    <button class="lightbox-close" type="button" aria-label="Đóng ảnh">&times;</button>
    <button class="lightbox-nav lightbox-prev" type="button" aria-label="Ảnh trước">&#8249;</button>
    <img class="lightbox-image" alt="">
    <button class="lightbox-nav lightbox-next" type="button" aria-label="Ảnh tiếp theo">&#8250;</button>
    <span class="lightbox-counter" aria-live="polite"></span>`;
  document.body.append(lightbox);

  const largeImage = lightbox.querySelector('.lightbox-image');
  const counter = lightbox.querySelector('.lightbox-counter');
  const closeButton = lightbox.querySelector('.lightbox-close');
  let currentIndex = 0;
  let lastFocused = null;

  const showImage = (index) => {
    currentIndex = (index + galleryImages.length) % galleryImages.length;
    const source = galleryImages[currentIndex];
    largeImage.src = source.currentSrc || source.src;
    largeImage.alt = source.alt || '';
    counter.textContent = `${currentIndex + 1} / ${galleryImages.length}`;
  };

  const openLightbox = (index) => {
    lastFocused = document.activeElement;
    showImage(index);
    lightbox.hidden = false;
    document.body.classList.add('lightbox-open');
    requestAnimationFrame(() => lightbox.classList.add('is-open'));
    closeButton.focus();
  };

  const closeLightbox = () => {
    lightbox.classList.remove('is-open');
    document.body.classList.remove('lightbox-open');
    window.setTimeout(() => {
      lightbox.hidden = true;
      largeImage.removeAttribute('src');
      lastFocused?.focus();
    }, 180);
  };

  galleryImages.forEach((image, index) => {
    image.classList.add('zoomable-image');
    image.tabIndex = 0;
    image.setAttribute('role', 'button');
    image.setAttribute('aria-label', `Phóng lớn ${image.alt || `ảnh ${index + 1}`}`);
    image.addEventListener('click', () => openLightbox(index));
    image.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openLightbox(index);
      }
    });
  });

  closeButton.addEventListener('click', closeLightbox);
  lightbox.querySelector('.lightbox-prev').addEventListener('click', () => showImage(currentIndex - 1));
  lightbox.querySelector('.lightbox-next').addEventListener('click', () => showImage(currentIndex + 1));
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (event) => {
    if (lightbox.hidden) return;
    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowLeft') showImage(currentIndex - 1);
    if (event.key === 'ArrowRight') showImage(currentIndex + 1);
  });
})();

