document.addEventListener('DOMContentLoaded',()=>{
  const cards=[...document.querySelectorAll('[data-news-card]')];
  const filters=[...document.querySelectorAll('[data-news-filter]')];
  const search=document.getElementById('news-search');
  const empty=document.getElementById('news-empty');
  let category='all';

  const lang=()=>String(document.documentElement.lang||'vi').toLowerCase().startsWith('en')?'en':'vi';
  const syncText=()=>{
    const l=lang();
    document.querySelectorAll('[data-vi][data-en]').forEach(el=>{el.textContent=el.dataset[l];});
    if(search)search.placeholder=l==='en'?'Search articles, topics, sources…':'Tìm bài viết, chủ đề, nguồn…';
    apply();
  };
  const apply=()=>{
    const q=(search?.value||'').trim().toLowerCase();
    let shown=0;
    cards.forEach(card=>{
      const tags=(card.dataset.tags||'').split(',');
      const text=card.textContent.toLowerCase();
      const okCategory=category==='all'||tags.includes(category);
      const okSearch=!q||text.includes(q);
      const show=okCategory&&okSearch;
      card.hidden=!show;
      if(show)shown++;
    });
    if(empty)empty.style.display=shown?'none':'block';
  };
  filters.forEach(btn=>btn.addEventListener('click',()=>{
    filters.forEach(x=>x.classList.remove('active'));
    btn.classList.add('active');
    category=btn.dataset.newsFilter||'all';
    apply();
  }));
  search?.addEventListener('input',apply);
  new MutationObserver(m=>{if(m.some(x=>x.type==='attributes'&&x.attributeName==='lang'))syncText();}).observe(document.documentElement,{attributes:true});
  syncText();
});