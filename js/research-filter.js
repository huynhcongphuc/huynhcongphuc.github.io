document.addEventListener('DOMContentLoaded',()=>{
  const cards=[...document.querySelectorAll('.research-card[data-research-item]')];
  const topic=document.getElementById('research-topic');
  const year=document.getElementById('research-year');
  const type=document.getElementById('research-type');
  const search=document.getElementById('research-search');
  const count=document.getElementById('research-result-count');
  const empty=document.getElementById('research-empty');
  if(!cards.length||!topic||!year||!type||!search)return;

  const normalize=s=>String(s||'').toLocaleLowerCase('vi-VN').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  const apply=()=>{
    const t=topic.value,y=year.value,ty=type.value,q=normalize(search.value.trim());
    let visible=0;
    cards.forEach(card=>{
      const tags=(card.dataset.tags||'').split(',').filter(Boolean);
      const hay=normalize(card.textContent);
      const ok=(!t||tags.includes(t))&&(!y||card.dataset.year===y)&&(!ty||card.dataset.type===ty)&&(!q||hay.includes(q));
      card.hidden=!ok;
      if(ok)visible++;
    });
    if(count)count.textContent=String(visible);
    if(empty)empty.hidden=visible!==0;
  };
  [topic,year,type].forEach(el=>el.addEventListener('change',apply));
  search.addEventListener('input',apply);
  document.getElementById('research-reset')?.addEventListener('click',()=>{topic.value='';year.value='';type.value='';search.value='';apply();});
  apply();
});
