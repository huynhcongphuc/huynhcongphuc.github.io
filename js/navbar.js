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

  const params={
    item_name:itemName,
    software_name:itemName,
    link_url:href,
    link_text:link.textContent.trim(),
    page_path:location.pathname,
    page_title:document.title,
    transport_type:'beacon'
  };

  window.gtag('event',eventName,params);
  window.gtag('event','file_download_click',{...params,download_event:eventName});
},true);
