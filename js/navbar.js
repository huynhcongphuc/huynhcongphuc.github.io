// Progressive visual enhancement. Core content and navigation remain usable without JavaScript.
(()=>{
  if(!document.querySelector('link[data-dynamic-ui]')){
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href='Layout/dynamic.css?v=2';
    link.dataset.dynamicUi='v2';
    document.head.appendChild(link);
  }
})();

document.addEventListener('DOMContentLoaded',()=>{
  if(window.lucide)window.lucide.createIcons();
  document.documentElement.classList.add('motion-ready');

  const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer=window.matchMedia('(pointer:fine)').matches;
  const button=document.querySelector('.menu-toggle');
  const nav=document.querySelector('#site-nav');
  const header=document.querySelector('.site-header');

  if(nav && !nav.querySelector('a[href="stats.html"]')){
    const statsLink=document.createElement('a');
    statsLink.href='stats.html';
    statsLink.textContent='Thống kê';
    if(location.pathname.endsWith('/stats.html') || location.pathname.endsWith('stats.html')) statsLink.classList.add('active');
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
      nav.classList.remove('open');
      button.setAttribute('aria-expanded','false');
    }));
  }

  // Existing reveal behavior, now with a small stagger for groups of cards.
  const revealItems=[...document.querySelectorAll('.reveal')];
  revealItems.forEach((el,index)=>el.style.setProperty('--reveal-delay',`${Math.min((index%4)*55,165)}ms`));
  if('IntersectionObserver' in window && !reduceMotion){
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}
    }),{threshold:.12,rootMargin:'0px 0px -4% 0px'});
    revealItems.forEach(el=>observer.observe(el));
  }else revealItems.forEach(el=>el.classList.add('visible'));

  const year=document.querySelector('#year');
  if(year)year.textContent=new Date().getFullYear();

  // Scroll progress + compact header. Uses requestAnimationFrame to avoid scroll jank.
  let ticking=false;
  const updateScrollUI=()=>{
    ticking=false;
    const y=window.scrollY||document.documentElement.scrollTop;
    const max=Math.max(1,document.documentElement.scrollHeight-window.innerHeight);
    const pct=Math.min(100,Math.max(0,(y/max)*100));
    document.documentElement.style.setProperty('--scroll-progress',`${pct}%`);
    if(header)header.classList.toggle('is-scrolled',y>24);

    const timeline=document.querySelector('.timeline');
    if(timeline){
      const rect=timeline.getBoundingClientRect();
      const start=window.innerHeight*.72;
      const end=window.innerHeight*.22;
      const progress=Math.min(1,Math.max(0,(start-rect.top)/Math.max(1,rect.height+start-end)));
      timeline.style.setProperty('--timeline-progress',`${progress*100}%`);
      [...timeline.querySelectorAll('article')].forEach(article=>{
        const r=article.getBoundingClientRect();
        article.classList.toggle('is-active',r.top<window.innerHeight*.64&&r.bottom>window.innerHeight*.28);
        article.classList.toggle('is-past',r.top<window.innerHeight*.64);
      });
    }
  };
  const onScroll=()=>{if(!ticking){ticking=true;requestAnimationFrame(updateScrollUI)}};
  window.addEventListener('scroll',onScroll,{passive:true});
  window.addEventListener('resize',onScroll,{passive:true});
  updateScrollUI();

  // Highlight the homepage section currently in view without changing URL or crawlable links.
  if(nav && 'IntersectionObserver' in window){
    const hashLinks=[...nav.querySelectorAll('a[href^="#"],a[href^="index.html#"]')];
    const sectionMap=new Map();
    hashLinks.forEach(link=>{
      const hash=link.getAttribute('href').split('#')[1];
      const section=hash?document.getElementById(hash):null;
      if(section)sectionMap.set(section,link);
    });
    if(sectionMap.size){
      const activeObserver=new IntersectionObserver(entries=>{
        const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
        if(!visible)return;
        hashLinks.forEach(l=>l.classList.remove('is-current'));
        sectionMap.get(visible.target)?.classList.add('is-current');
      },{rootMargin:'-28% 0px -58% 0px',threshold:[0,.15,.35,.6]});
      sectionMap.forEach((_,section)=>activeObserver.observe(section));
    }
  }

  // Restrained card tilt for desktop pointer devices only.
  const motionCards=[...document.querySelectorAll('.expertise-card,.product-card,.research-card,.stat-card,.table-card')];
  motionCards.forEach(card=>card.classList.add('motion-card'));
  if(finePointer&&!reduceMotion){
    motionCards.forEach(card=>{
      card.addEventListener('pointermove',event=>{
        const rect=card.getBoundingClientRect();
        const x=(event.clientX-rect.left)/rect.width;
        const y=(event.clientY-rect.top)/rect.height;
        card.style.setProperty('--tilt-y',`${(x-.5)*3.2}deg`);
        card.style.setProperty('--tilt-x',`${(.5-y)*3.2}deg`);
        card.style.setProperty('--card-x',`${x*100}%`);
        card.style.setProperty('--card-y',`${y*100}%`);
      },{passive:true});
      card.addEventListener('pointerleave',()=>{
        card.style.setProperty('--tilt-y','0deg');
        card.style.setProperty('--tilt-x','0deg');
        card.style.setProperty('--card-x','50%');
        card.style.setProperty('--card-y','50%');
      },{passive:true});
    });

    const portrait=document.querySelector('.portrait-card');
    if(portrait){
      portrait.addEventListener('pointermove',event=>{
        const rect=portrait.getBoundingClientRect();
        const x=(event.clientX-rect.left)/rect.width-.5;
        const y=(event.clientY-rect.top)/rect.height-.5;
        portrait.style.setProperty('--portrait-x',`${x*5}px`);
        portrait.style.setProperty('--portrait-y',`${y*5}px`);
        portrait.style.setProperty('--portrait-ry',`${x*1.8}deg`);
        portrait.style.setProperty('--portrait-rx',`${-y*1.8}deg`);
      },{passive:true});
      portrait.addEventListener('pointerleave',()=>{
        ['--portrait-x','--portrait-y','--portrait-rx','--portrait-ry'].forEach(p=>portrait.style.removeProperty(p));
      },{passive:true});
    }
  }

  // Animate statistic cards when asynchronous GA values change; the final DOM value remains the real value.
  const statIds=['realtime-users','realtime-views','sessions','users','vietnam','downloads'];
  statIds.forEach(id=>{
    const node=document.getElementById(id);
    if(!node||!('MutationObserver' in window))return;
    new MutationObserver(()=>{
      const card=node.closest('.stat-card');
      if(!card||reduceMotion)return;
      card.classList.remove('is-updated');
      void card.offsetWidth;
      card.classList.add('is-updated');
      setTimeout(()=>card.classList.remove('is-updated'),450);
    }).observe(node,{childList:true,characterData:true,subtree:true});
  });
});

// Delegated tracking survives language/content DOM updates and catches every download click.
const DOWNLOAD_MAP=[
  {match:'IgBq6U7hVxl5RJuDTA6EJ_ahAXFAtLfmY8CHGajxg9ZjMy0',event:'download_secureapp',name:'SecureApp'},
  {match:'IgCWzBpvcoqLT4XENDOsrvIUAU-Cq-ESSLyOE2bAD3Pwq2s',event:'download_master_server',name:'Master Server Protocol'},
  {match:'IgApTsr0fURrQ5VzGEA222H4AZa4rPLGAMoSnHB6vAfKTdM',event:'download_der_simulator',name:'DER Simulator'},
  {match:'IgD3GSNESb9yRphUKp21307vAbuuXWulCUgH3GJR2e8iTis',event:'download_microgrid_simulator',name:'Microgrid Simulator'}
];

document.addEventListener('click',event=>{
  const link=event.target.closest?.('.product-download,[data-track-download]');
  if(!link || typeof window.gtag!=='function')return;

  const href=link.href||'';
  const known=DOWNLOAD_MAP.find(item=>href.includes(item.match));
  const card=link.closest('.product-card,.research-card');
  const title=card?.querySelector('h2')?.textContent?.trim()||link.textContent.trim()||'Download';
  const eventName=known?.event||'download_document';
  const itemName=known?.name||title;
  const params={item_name:itemName,software_name:itemName,link_url:href,link_text:link.textContent.trim(),page_path:location.pathname,page_title:document.title,transport_type:'beacon'};
  window.gtag('event',eventName,params);
  window.gtag('event','file_download_click',{...params,download_event:eventName});
},true);
