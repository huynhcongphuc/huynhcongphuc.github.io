document.addEventListener('DOMContentLoaded',()=>{
  if(window.lucide)window.lucide.createIcons();

  const button=document.querySelector('.menu-toggle');
  const nav=document.querySelector('#site-nav');

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
      nav.classList.remove('open');button.setAttribute('aria-expanded','false');
    }));
  }

  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}
  }),{threshold:.12});
  document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));

  const year=document.querySelector('#year');
  if(year)year.textContent=new Date().getFullYear();

  // Generic tracking remains available for document links on other pages.
  document.querySelectorAll('[data-track-download]').forEach((link,index)=>{
    if(link.hasAttribute('data-inline-track')) return;
    link.addEventListener('click',()=>{
      if(typeof window.gtag!=='function') return;
      const card=link.closest('.product-card,.research-card');
      const title=card?.querySelector('h2')?.textContent?.trim()||link.textContent.trim()||`Download ${index+1}`;
      window.gtag('event','download_document',{
        document_name:title,
        link_url:link.href||'',
        link_text:link.textContent.trim(),
        page_path:location.pathname,
        transport_type:'beacon'
      });
    });
  });
});
