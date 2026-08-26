(() => {
  const grid = document.querySelector('[data-featured-research]');
  if (!grid) return;

  const normalizeDate = (item) => {
    const published = item.dataset.published;
    if (published && !Number.isNaN(Date.parse(published))) return Date.parse(published);
    const year = Number(item.dataset.year || 0);
    return Date.UTC(year, 0, 1);
  };

  const makeCard = (item) => {
    const card = document.createElement('article');
    card.className = 'featured-card reveal visible';

    const sourceImage = item.querySelector('.research-cover img');
    const content = item.querySelector('.research-content');
    const title = content?.querySelector('h2');
    const summary = content?.querySelector(':scope > p:not(.research-authors)');
    const type = content?.querySelector('.research-topline span');
    const target = item.id ? `research.html#${item.id}` : 'research.html';

    if (sourceImage) {
      const image = document.createElement('img');
      image.src = sourceImage.getAttribute('src');
      image.alt = sourceImage.getAttribute('alt') || '';
      image.loading = 'lazy';
      card.append(image);
    }

    const body = document.createElement('div');
    body.className = 'featured-body';
    body.innerHTML = `
      <span class="featured-tag">${type?.textContent?.trim() || 'NGHIÊN CỨU'}</span>
      <h3>${title?.textContent?.trim() || ''}</h3>
      <p>${summary?.textContent?.trim() || ''}</p>
      <a class="featured-link" href="${target}">Xem chi tiết <i data-lucide="arrow-right"></i></a>
    `;
    card.append(body);
    return card;
  };

  fetch('research.html', { cache: 'no-cache' })
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.text();
    })
    .then((html) => {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const items = [...doc.querySelectorAll('[data-research-item]')];
      const newest = (types, count) => items
        .filter((item) => types.includes(item.dataset.type))
        .sort((a, b) => normalizeDate(b) - normalizeDate(a))
        .slice(0, count);

      const selected = [
        ...newest(['monograph'], 1),
        ...newest(['journal', 'conference'], 3)
      ];

      if (!selected.length) return;
      grid.replaceChildren(...selected.map(makeCard));
      window.lucide?.createIcons();
    })
    .catch(() => {
      // Giữ nội dung dự phòng có sẵn trong HTML khi không tải được research.html.
    });
})();