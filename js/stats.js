document.addEventListener('DOMContentLoaded',()=>{
  const nf=new Intl.NumberFormat('vi-VN');
  const RAW_URL='https://raw.githubusercontent.com/huynhcongphuc/huynhcongphuc.github.io/main/data/ga4-stats.json';
  let stats=null,range='7d';
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

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
    const researchTotal=(d.research_downloads||0)>0?(d.research_downloads||0):(rt.research_downloads||0);
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

    const realtimeResearch=rt.research||[];
    const standardResearch=d.research||[];
    const hasResearchStandard=standardResearch.some(x=>(x.downloads||0)>0);
    const researchData=hasResearchStandard?standardResearch:(realtimeResearch.length?realtimeResearch:standardResearch);
    const researchRows=document.getElementById('research-rows');
    if(researchRows)researchRows.innerHTML=researchData.length?researchData.map(x=>`<tr><td>${esc(x.name)}</td><td>${nf.format(x.downloads||0)}</td></tr>`).join(''):'<tr><td>Chưa có dữ liệu</td><td>0</td></tr>';

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
