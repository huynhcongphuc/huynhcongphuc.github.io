document.addEventListener('DOMContentLoaded',()=>{
  const RAW_URL='https://raw.githubusercontent.com/huynhcongphuc/huynhcongphuc.github.io/main/data/tech-news.json';
  const grid=document.querySelector('.news-grid');
  const filters=[...document.querySelectorAll('[data-news-filter]')];
  const search=document.getElementById('news-search');
  const empty=document.getElementById('news-empty');
  const note=document.querySelector('.news-note');
  let cards=[...document.querySelectorAll('[data-news-card]')];
  let category='all';
  let feed=null;

  const lang=()=>String(document.documentElement.lang||'vi').toLowerCase().startsWith('en')?'en':'vi';
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[c]));
  const sourceClass=source=>String(source||'').toLowerCase().includes('cnn')?'cnn':'ieee';
  const sourceTag=source=>String(source||'').toLowerCase().includes('cnn')?'CNN Tech':'IEEE Spectrum';
  const iconFor=item=>item.icon||(sourceClass(item.source)==='cnn'?'cpu':'radio-tower');
  const dateLabel=item=>item.published_label||'';

  const apply=()=>{
    const q=(search?.value||'').trim().toLowerCase();
    let shown=0;
    cards.forEach(card=>{
      const tags=(card.dataset.tags||'').split(',').filter(Boolean);
      const text=card.textContent.toLowerCase();
      const okCategory=category==='all'||tags.includes(category);
      const okSearch=!q||text.includes(q);
      const show=okCategory&&okSearch;
      card.hidden=!show;
      if(show)shown++;
    });
    if(empty)empty.style.display=shown?'none':'block';
  };

  const syncText=()=>{
    const l=lang();
    document.querySelectorAll('[data-vi][data-en]').forEach(el=>{el.textContent=el.dataset[l];});
    if(search)search.placeholder=l==='en'?'Search articles, topics, sources…':'Tìm bài viết, chủ đề, nguồn…';
    const status=document.getElementById('news-feed-status');
    if(status&&feed){
      const updated=feed.updated_at?new Date(feed.updated_at).toLocaleString(l==='en'?'en-US':'vi-VN'):'';
      const ieee=feed.source_status?.['IEEE Spectrum'];
      const cnn=feed.source_status?.['CNN Tech'];
      const sourceText=`IEEE Spectrum: ${ieee?.ok?'OK':'Fallback'} · CNN Tech: ${cnn?.ok?'OK':'Fallback'}`;
      status.textContent=l==='en'?`Auto-updated daily · ${sourceText}${updated?` · Updated ${updated}`:''}`:`Tự động cập nhật hằng ngày · ${sourceText}${updated?` · Cập nhật ${updated}`:''}`;
    }
    apply();
  };

  function renderFeed(data){
    if(!grid||!Array.isArray(data?.items)||!data.items.length)return false;
    feed=data;
    grid.innerHTML=data.items.slice(0,10).map(item=>{
      const tags=Array.isArray(item.tags)&&item.tags.length?item.tags:['engineering'];
      const src=sourceTag(item.source);
      const sourceType=sourceClass(item.source);
      const summary=item.summary||'';
      const image=item.image||'';
      return `<article class="news-card news-card-live source-${sourceType}" data-news-card data-tags="${esc(tags.join(','))}">
        ${image?`<figure class="news-image"><img src="${esc(image)}" alt="" loading="lazy" referrerpolicy="no-referrer"></figure>`:''}
        <div class="news-card-top"><div class="news-icon"><i data-lucide="${esc(iconFor(item))}"></i></div><span class="news-source">${esc(src)}</span></div>
        <span class="news-tag">${esc(tags[0].toUpperCase())}</span>
        <h2>${esc(item.title)}</h2>
        ${summary?`<p>${esc(summary)}</p>`:''}
        <div class="news-meta">${dateLabel(item)?`<span>${esc(dateLabel(item))}</span>`:''}<span>${esc(src)}</span></div>
        <a class="news-link" href="${esc(item.url)}" target="_blank" rel="noopener noreferrer"><span data-vi="Đọc bài gốc" data-en="Read original">Đọc bài gốc</span><i data-lucide="arrow-up-right"></i></a>
      </article>`;
    }).join('');
    cards=[...grid.querySelectorAll('[data-news-card]')];
    if(note&&!document.getElementById('news-feed-status')){
      const status=document.createElement('p');
      status.id='news-feed-status';
      status.className='news-feed-status';
      note.before(status);
    }
    if(window.lucide)window.lucide.createIcons();
    syncText();
    return true;
  }

  async function loadFeed(){
    const urls=[`${RAW_URL}?t=${Date.now()}`,`data/tech-news.json?t=${Date.now()}`];
    for(const url of urls){
      try{
        const response=await fetch(url,{cache:'no-store'});
        if(!response.ok)throw new Error(`HTTP ${response.status}`);
        const data=await response.json();
        if(renderFeed(data))return;
      }catch(err){console.warn('Technology news feed unavailable:',url,err);}
    }
    cards=[...document.querySelectorAll('[data-news-card]')];
    apply();
  }

  filters.forEach(btn=>btn.addEventListener('click',()=>{
    filters.forEach(x=>x.classList.remove('active'));
    btn.classList.add('active');
    category=btn.dataset.newsFilter||'all';
    apply();
  }));
  search?.addEventListener('input',apply);
  new MutationObserver(m=>{if(m.some(x=>x.type==='attributes'&&x.attributeName==='lang'))syncText();}).observe(document.documentElement,{attributes:true});
  syncText();
  loadFeed();
  setInterval(loadFeed,30*60*1000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)loadFeed();});
});