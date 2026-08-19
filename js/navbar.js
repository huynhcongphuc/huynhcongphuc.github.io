document.addEventListener('DOMContentLoaded',()=>{
  if(window.lucide)window.lucide.createIcons();

  const button=document.querySelector('.menu-toggle');
  const nav=document.querySelector('#site-nav');

  // Add the statistics tab consistently on every page.
  if(nav && !nav.querySelector('a[href="stats.html"]')){
    const statsLink=document.createElement('a');
    statsLink.href='stats.html';
    statsLink.textContent='Thống kê';
    if(location.pathname.endsWith('/stats.html') || location.pathname.endsWith('stats.html')){
      statsLink.classList.add('active');
    }
    const languageToggle=nav.querySelector('[data-language-toggle]');
    if(languageToggle) nav.insertBefore(statsLink,languageToggle);
    else nav.appendChild(statsLink);
  }

  if(button&&nav){
    button.addEventListener('click',()=>{
      const open=nav.classList.toggle('open');
      button.setAttribute('aria-expanded',String(open));
    });
    nav.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{
      nav.classList.remove('open');button.setAttribute('aria-expanded','false');
    }));
  }

  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}
  }),{threshold:.12});
  document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));

  const year=document.querySelector('#year');
  if(year)year.textContent=new Date().getFullYear();

  // Lightweight public counters for this static GitHub Pages site.
  // No IP address is stored. IP geolocation is used only to classify VN / abroad.
  const COUNTER_BASE='https://api.counterapi.dev/v1/huynhcongphuc-site';
  const counterUp=(name)=>fetch(`${COUNTER_BASE}/${encodeURIComponent(name)}/up`,{mode:'cors',cache:'no-store'}).catch(()=>null);

  // Count one visit per browser tab/session instead of every page navigation.
  if(!sessionStorage.getItem('hcp_visit_counted')){
    sessionStorage.setItem('hcp_visit_counted','1');
    counterUp('visits-total');

    fetch('https://ipwho.is/?fields=success,country_code',{mode:'cors',cache:'no-store'})
      .then(r=>r.ok?r.json():Promise.reject())
      .then(data=>{
        if(data && data.success){
          counterUp(data.country_code==='VN'?'visits-vietnam':'visits-abroad');
        }else{
          counterUp('visits-unknown');
        }
      })
      .catch(()=>counterUp('visits-unknown'));
  }

  // Track all current and future download buttons.
  document.querySelectorAll('.product-download,[data-track-download]').forEach((link,index)=>{
    link.addEventListener('click',()=>{
      const card=link.closest('.product-card,.research-card');
      const title=card?.querySelector('h2')?.textContent?.trim() || link.textContent.trim() || `download-${index+1}`;
      const slug=title.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
        .replace(/đ/g,'d')
        .replace(/[^a-z0-9]+/g,'-')
        .replace(/^-|-$/g,'')
        .slice(0,60) || `download-${index+1}`;
      counterUp('downloads-total');
      counterUp(`download-${slug}`);
    },{passive:true});
  });
});
