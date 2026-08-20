document.addEventListener('DOMContentLoaded',()=>{
  const grid=document.querySelector('.product-grid');
  if(!grid)return;

  const cards=[...grid.querySelectorAll('.product-card')];
  const detailsList=cards.map(card=>card.querySelector('details')).filter(Boolean);

  const measureClosedHeight=()=>{
    // Measure the common closed-card baseline without changing visible content.
    const previouslyOpen=detailsList.filter(d=>d.open);
    detailsList.forEach(d=>d.open=false);
    cards.forEach(card=>{card.style.removeProperty('--closed-card-height');card.classList.remove('is-open');});
    const maxHeight=Math.ceil(Math.max(...cards.map(card=>card.getBoundingClientRect().height)));
    cards.forEach(card=>card.style.setProperty('--closed-card-height',`${maxHeight}px`));
    previouslyOpen.forEach(d=>{d.open=true;d.closest('.product-card')?.classList.add('is-open');});
  };

  measureClosedHeight();
  window.addEventListener('resize',()=>{
    clearTimeout(window.__productResizeTimer);
    window.__productResizeTimer=setTimeout(measureClosedHeight,150);
  },{passive:true});

  detailsList.forEach(details=>{
    details.addEventListener('toggle',()=>{
      const card=details.closest('.product-card');
      if(!card)return;
      if(details.open){
        // Keep the interaction focused: only one product expands at a time.
        detailsList.forEach(other=>{
          if(other!==details && other.open)other.open=false;
        });
        card.classList.add('is-open');
      }else{
        card.classList.remove('is-open');
      }
    });
  });
});
