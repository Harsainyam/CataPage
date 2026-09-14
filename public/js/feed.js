(function () {
  const feed = document.getElementById('feed');
  if (!feed) return;

  const params = new URLSearchParams(window.location.search);
  const q = params.get('q') || '';
  const tag = params.get('tag') || '';
  const category = params.get('category') || '';

  let skip = parseInt(feed.dataset.loaded, 10) || 0;
  let hasMore = feed.dataset.hasMore === 'true';
  let loading = false;

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  function renderReel(item) {
    const company = item.company || {};

    const specsHtml = (item.specs || [])
      .slice(0, 5)
      .map(
        (s) =>
          `<div class="spec-row"><span class="spec-label">${escapeHtml(s.label)}</span><span class="spec-value">${escapeHtml(s.value)}</span></div>`
      )
      .join('');

    const tagsHtml = (item.tags || [])
      .map((t) => `<a class="tag-chip" href="/?tag=${encodeURIComponent(t)}">${escapeHtml(t)}</a>`)
      .join('');

    const el = document.createElement('article');
    el.className = 'reel';
    el.innerHTML = `
      <div class="reel-media"><img src="${escapeHtml(item.mediaUrl)}" alt="${escapeHtml(item.title)}" loading="lazy" /></div>
      <span class="reel-category-badge">${escapeHtml(item.category)}</span>
      <div class="reel-panel">
        <div class="reel-company">
          <span>${escapeHtml(company.name || 'Unknown supplier')}</span>
          ${company.verified ? '<span class="verified">&#10003; Verified</span>' : ''}
        </div>
        <h2 class="reel-title">${escapeHtml(item.title)}</h2>
        <p class="reel-desc">${escapeHtml(item.description)}</p>
        ${item.price ? `<div class="reel-price">${escapeHtml(item.price)}</div>` : ''}
        ${specsHtml ? `<div class="reel-specs">${specsHtml}</div>` : ''}
        ${tagsHtml ? `<div class="reel-tags">${tagsHtml}</div>` : ''}
        <div class="reel-cta">
          <a class="btn btn-primary" href="/item/${item._id}">View details</a>
        </div>
      </div>
    `;
    return el;
  }

  async function loadMore() {
    if (loading || !hasMore) return;
    loading = true;

    const qs = new URLSearchParams({ skip: String(skip) });
    if (q) qs.set('q', q);
    if (tag) qs.set('tag', tag);
    if (category) qs.set('category', category);

    try {
      const res = await fetch(`/api/items?${qs.toString()}`);
      const data = await res.json();
      data.items.forEach((item) => feed.appendChild(renderReel(item)));
      skip += data.items.length;
      hasMore = data.hasMore;
    } catch (err) {
      console.error('Failed to load more items', err);
    } finally {
      loading = false;
    }
  }

  feed.addEventListener('scroll', () => {
    const nearBottom = feed.scrollTop + feed.clientHeight >= feed.scrollHeight - window.innerHeight * 1.5;
    if (nearBottom) loadMore();
  });
})();
