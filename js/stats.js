document.addEventListener('DOMContentLoaded',()=>{
  const nf=new Intl.NumberFormat('vi-VN');
  const RAW_URL='https://raw.githubusercontent.com/huynhcongphuc/huynhcongphuc.github.io/main/data/ga4-stats.json';
  const RESEARCH_CATALOG=[
    {event:'download_research_ieee2030_5',name:'IEEE 2030.11 & IEEE 2030.5 DERMS Research'},
    {event:'download_research_abess',name:'ABESS Reliability Paper'},
    {event:'download_research_flisr_ieee',name:'IEEE FLISR with DG Paper'},
    {event:'download_research_flisr_vn',name:'FLISR with Distributed Generation Paper'}
  ];
  let stats=null,range='7d';
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[c]));

  const mergeResearch=(standard=[],realtime=[])=>RESEARCH_CATALOG.map(base=>{
    const s=standard.find(x=>x.event===base.event);
    const r=realtime.find(x=>x.event===base.event);
    return {...base,name:s?.name||r?.name||base.name,downloads:(s?.downloads||0)>0?(s.downloads||0):(r?.downloads||0)};
  });

  function render(){
    if(!stats)return;
    const rt=stats.realtime||{};
    document.getElementById('realtime-users').textContent=nf.format(rt.active_users||0);
    document.getElementById('realtime-views').textContent=nf.format(rt.views||0);
    const d=stats.periods?.[range]||stats.periods?.['7d']||{};
    document.getElementById('sessions').textContent=nf.format(d.sessions||0);
    document.getElementById('users').textContent=nf.format(d.users||0);

    const realtimeVietnam=(rt.countries||[]).find(x=>String(x.country).toLowerCase()==='vietnam')?.users||0;
    document.getElementById('vietnam').textContent=nf.format((d.vietnam||0)>0?(d.vietnam||0):realtimeVietnam);
    document.getElementById('downloads').textContent=nf.format((d.downloads||0)>0?(d.downloads||0):(rt.downloads||0));

    const researchData=mergeResearch(d.research||[],rt.research||[]);
    const calculatedResearchTotal=researchData.reduce((sum,x)=>sum+(x.downloads||0),0);
    const researchTotal=Math.max(d.research_downloads||0,rt.research_downloads||0,calculatedResearchTotal);
    const researchTotalNode=document.getElementById('research-downloads');
    if(researchTotalNode)researchTotalNode.textContent=nf.format(researchTotal);

    const countryData=(d.countries||[]).length?(d.countries||[]):(rt.countries||[]);
    const max=Math.max(1,...countryData.map(x=>x.users));
    document.getElementById('country-rows').innerHTML=countryData.length?countryData.map(x=>`<tr><td>${esc(x.country)}<div class="geo-bar"><i style="width:${Math.round(x.users*100/max)}%"></i></div></td><td>${nf.format(x.users)}</td></tr>`).join(''):'<tr><td>Chưa có dữ liệu</td><td>0</td></tr>';

    const realtimeSoftware=rt.software||[];
    const standardSoftware=d.software||[];
    const hasStandard=standardSoftware.some(x=>(x.downloads||0)>0);
    const softwareData=hasStandard?standardSoftware:(realtimeSoftware.length?realtimeSoftware:standardSoftware);
    document.getElementById('software-rows').innerHTML=softwareData.map(x=>`<tr><td>${esc(x.name)}</td><td>${nf.format(x.downloads||0)}</td></tr>`).join('');

    const researchRows=document.getElementById('research-rows');
    if(researchRows)researchRows.innerHTML=researchData.map(x=>`<tr><td>${esc(x.name)}</td><td>${nf.format(x.downloads||0)}</td></tr>`).join('');

    const updated=document.getElementById('updated-at');
    if(updated&&stats.updated_at)updated.textContent=`Cập nhật lúc ${new Date(stats.updated_at).toLocaleString('vi-VN')}`;
    const error=document.getElementById('stats-error');
    if(error)error.style.display='none';
  }

  async function loadStats(){
    const urls=[`${RAW_URL}?t=${Date.now()}`,`data/ga4-stats.json?t=${Date.now()}`];
    let lastError;
    for(const url of urls){
      try{
        const r=await fetch(url,{cache:'no-store'});
        if(!r.ok)throw new Error(`HTTP ${r.status}`);
        const d=await r.json();
        if(!d?.periods)throw new Error('Invalid stats payload');
        stats=d;render();return;
      }catch(err){lastError=err;}
    }
    console.warn('Stats refresh failed',lastError);
    if(!stats){
      document.getElementById('stats-error').style.display='block';
      ['realtime-users','realtime-views','sessions','users','vietnam','downloads','research-downloads'].forEach(id=>{const el=document.getElementById(id);if(el)el.textContent='—';});
    }
  }

  document.querySelectorAll('[data-range]').forEach(b=>b.addEventListener('click',()=>{
    document.querySelectorAll('[data-range]').forEach(x=>x.classList.remove('active'));
    b.classList.add('active');range=b.dataset.range;render();
  }));

  loadStats();
  setInterval(loadStats,60000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)loadStats();});
});
