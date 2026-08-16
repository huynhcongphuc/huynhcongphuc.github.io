document.addEventListener('DOMContentLoaded',()=>{
  if(window.lucide)window.lucide.createIcons();
  const button=document.querySelector('.menu-toggle');
  const nav=document.querySelector('#site-nav');
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

