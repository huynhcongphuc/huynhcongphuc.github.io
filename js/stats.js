document.addEventListener('DOMContentLoaded',()=>{
  const BASE='https://api.counterapi.dev/v1/huynhcongphuc-site';
  const names=['visits-total','visits-vietnam','visits-abroad','downloads-total'];
  const number=new Intl.NumberFormat('vi-VN');

  async function getCounter(name){
    try{
      const r=await fetch(`${BASE}/${encodeURIComponent(name)}`,{mode:'cors',cache:'no-store'});
      if(!r.ok) return 0;
      const data=await r.json();
      return Number(data.count ?? data.value ?? 0) || 0;
    }catch{return 0;}
  }

  Promise.all(names.map(getCounter)).then(values=>{
    const data=Object.fromEntries(names.map((name,i)=>[name,values[i]]));
    names.forEach(name=>{
      const el=document.getElementById(name);
      if(el){el.textContent=number.format(data[name]);el.classList.remove('loading');}
    });

    const vn=data['visits-vietnam'];
    const abroad=data['visits-abroad'];
    const known=vn+abroad;
    const vnPct=known?Math.round(vn*1000/known)/10:0;
    const abroadPct=known?Math.round(abroad*1000/known)/10:0;
    const vnBar=document.getElementById('bar-vietnam');
    const abroadBar=document.getElementById('bar-abroad');
    const vnText=document.getElementById('pct-vietnam');
    const abroadText=document.getElementById('pct-abroad');
    if(vnBar)vnBar.style.width=`${vnPct}%`;
    if(abroadBar)abroadBar.style.width=`${abroadPct}%`;
    if(vnText)vnText.textContent=`${vnPct}%`;
    if(abroadText)abroadText.textContent=`${abroadPct}%`;
  });
});
