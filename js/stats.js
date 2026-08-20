document.addEventListener('DOMContentLoaded',()=>{
  const RAW_URL='https://raw.githubusercontent.com/huynhcongphuc/huynhcongphuc.github.io/main/data/ga4-stats.json';
  const RESEARCH_CATALOG=[
    {event:'download_research_ieee2030_5',vi:'IEEE 2030.11 & IEEE 2030.5 – Nghiên cứu DERMS',en:'IEEE 2030.11 & IEEE 2030.5 DERMS Research'},
    {event:'download_research_abess',vi:'Bài báo độ tin cậy ABESS',en:'ABESS Reliability Paper'},
    {event:'download_research_flisr_ieee',vi:'Bài báo IEEE FLISR với nguồn phân tán',en:'IEEE FLISR with DG Paper'},
    {event:'download_research_flisr_vn',vi:'Bài báo FLISR có nguồn phát phân tán',en:'FLISR with Distributed Generation Paper'}
  ];
  const SOFTWARE_NAMES={
    'SecureApp':{vi:'SecureApp',en:'SecureApp'},
    'Master Server Protocol':{vi:'Master Server Protocol',en:'Master Server Protocol'},
    'DER Simulator':{vi:'Giả lập nguồn phân tán (DER Simulator)',en:'DER Simulator'},
    'Microgrid Simulator':{vi:'Giả lập Microgrid',en:'Microgrid Simulator'}
  };
  const TEXT={
    vi:{noData:'Chưa có dữ liệu',updated:'Cập nhật lúc',unknown:'Không xác định',vietnam:'Việt Nam',users:'Người dùng',views:'Lượt xem',software:'Tải phần mềm',research:'Tải nghiên cứu'},
    en:{noData:'No data',updated:'Updated at',unknown:'Unknown',vietnam:'Vietnam',users:'Users',views:'Views',software:'Software downloads',research:'Research downloads'}
  };
  let stats=null,range='7d',chartRange=7;
  const lang=()=>String(document.documentElement.lang||'vi').toLowerCase().startsWith('en')?'en':'vi';
  const nf=()=>new Intl.NumberFormat(lang()==='en'?'en-US':'vi-VN');
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const formatDay=s=>s&&s.length===8?`${s.slice(6,8)}/${s.slice(4,6)}`:'—';
  const countryName=name=>{
    const l=lang();
    const n=String(name||'').trim();
    if(!n||n==='(not set)'||n==='Unknown')return TEXT[l].unknown;
    if(n==='Vietnam')return TEXT[l].vietnam;
    return n;
  };
  const softwareName=name=>SOFTWARE_NAMES[name]?.[lang()]||name;

  const mergeResearch=(standard=[],realtime=[])=>RESEARCH_CATALOG.map(base=>{
    const s=standard.find(x=>x.event===base.event);
    const r=realtime.find(x=>x.event===base.event);
    return {event:base.event,name:base[lang()],downloads:(s?.downloads||0)>0?(s.downloads||0):(r?.downloads||0)};
  });

  function renderUnifiedChart(){
    const svg=document.getElementById('trend-combined'); if(!svg||!stats)return;
    const rows=(stats.daily||[]).slice(-chartRange);
    const metrics=[
      {key:'users',cls:'series-users',label:TEXT[lang()].users},
      {key:'views',cls:'series-views',label:TEXT[lang()].views},
      {key:'software_downloads',cls:'series-software',label:TEXT[lang()].software},
      {key:'research_downloads',cls:'series-research',label:TEXT[lang()].research}
    ];
    document.querySelectorAll('[data-trend-label]').forEach(node=>{
      const m=metrics.find(x=>x.key===node.dataset.trendLabel); if(m)node.textContent=m.label;
    });
    metrics.forEach(m=>{
      const total=rows.reduce((sum,row)=>sum+Number(row[m.key]||0),0);
      const node=document.querySelector(`[data-trend-total="${m.key}"]`); if(node)node.textContent=nf().format(total);
    });
    const start=document.getElementById('trend-start'),end=document.getElementById('trend-end');
    if(start)start.textContent=formatDay(rows[0]?.date); if(end)end.textContent=formatDay(rows.at(-1)?.date);
    if(!rows.length){svg.innerHTML='';return;}
    const W=760,H=220,padL=26,padR=16,padTop=16,padBottom=22,plotW=W-padL-padR,plotH=H-padTop-padBottom;
    const allValues=metrics.flatMap(m=>rows.map(r=>Number(r[m.key]||0)));
    const max=Math.max(1,...allValues);
    const grids=[0,.25,.5,.75,1].map(f=>{
      const y=padTop+plotH*f;
      const value=Math.round(max*(1-f));
      return `<line class="grid" x1="${padL}" y1="${y}" x2="${W-padR}" y2="${y}"/><text class="axis-label" x="2" y="${y+4}">${value}</text>`;
    }).join('');
    const series=metrics.map(m=>{
      const pts=rows.map((row,i)=>{
        const x=rows.length===1?padL+plotW/2:padL+i*(plotW/(rows.length-1));
        const v=Number(row[m.key]||0); const y=padTop+(1-v/max)*plotH; return [x,y,v];
      });
      const line=pts.map(p=>`${p[0]},${p[1]}`).join(' ');
      const dots=pts.map((p,i)=>(i===0||i===pts.length-1)?`<circle class="${m.cls} trend-dot" cx="${p[0]}" cy="${p[1]}" r="3.6"><title>${esc(m.label)}: ${p[2]}</title></circle>`:'').join('');
      return `<polyline class="trend-series ${m.cls}" points="${line}"/>${dots}`;
    }).join('');
    svg.innerHTML=`${grids}${series}`;
  }

  function render(){
    if(!stats)return;
    const l=lang(),fmt=nf(),rt=stats.realtime||{};
    document.getElementById('realtime-users').textContent=fmt.format(rt.active_users||0);
    document.getElementById('realtime-views').textContent=fmt.format(rt.views||0);
    const d=stats.periods?.[range]||stats.periods?.['7d']||{};
    document.getElementById('sessions').textContent=fmt.format(d.sessions||0);
    document.getElementById('users').textContent=fmt.format(d.users||0);
    const realtimeVietnam=(rt.countries||[]).find(x=>String(x.country).toLowerCase()==='vietnam')?.users||0;
    document.getElementById('vietnam').textContent=fmt.format((d.vietnam||0)>0?(d.vietnam||0):realtimeVietnam);
    document.getElementById('downloads').textContent=fmt.format((d.downloads||0)>0?(d.downloads||0):(rt.downloads||0));

    const researchData=mergeResearch(d.research||[],rt.research||[]);
    const calculatedResearchTotal=researchData.reduce((sum,x)=>sum+(x.downloads||0),0);
    const researchTotal=Math.max(d.research_downloads||0,rt.research_downloads||0,calculatedResearchTotal);
    const researchTotalNode=document.getElementById('research-downloads');
    if(researchTotalNode)researchTotalNode.textContent=fmt.format(researchTotal);

    const countryData=(d.countries||[]).length?(d.countries||[]):(rt.countries||[]);
    const max=Math.max(1,...countryData.map(x=>x.users));
    document.getElementById('country-rows').innerHTML=countryData.length?countryData.map(x=>`<tr><td>${esc(countryName(x.country))}<div class="geo-bar"><i style="width:${Math.round(x.users*100/max)}%"></i></div></td><td>${fmt.format(x.users)}</td></tr>`).join(''):`<tr><td>${TEXT[l].noData}</td><td>0</td></tr>`;

    const realtimeSoftware=rt.software||[];
    const standardSoftware=d.software||[];
    const hasStandard=standardSoftware.some(x=>(x.downloads||0)>0);
    const softwareData=hasStandard?standardSoftware:(realtimeSoftware.length?realtimeSoftware:standardSoftware);
    document.getElementById('software-rows').innerHTML=softwareData.length?softwareData.map(x=>`<tr><td>${esc(softwareName(x.name))}</td><td>${fmt.format(x.downloads||0)}</td></tr>`).join(''):`<tr><td>${TEXT[l].noData}</td><td>0</td></tr>`;

    const researchRows=document.getElementById('research-rows');
    if(researchRows)researchRows.innerHTML=researchData.map(x=>`<tr><td>${esc(x.name)}</td><td>${fmt.format(x.downloads||0)}</td></tr>`).join('');

    renderUnifiedChart();
    const updated=document.getElementById('updated-at');
    if(updated&&stats.updated_at)updated.textContent=`${TEXT[l].updated} ${new Date(stats.updated_at).toLocaleString(l==='en'?'en-US':'vi-VN')}`;
    const error=document.getElementById('stats-error'); if(error)error.style.display='none';
  }

  async function loadStats(){
    const urls=[`${RAW_URL}?t=${Date.now()}`,`data/ga4-stats.json?t=${Date.now()}`];
    let lastError;
    for(const url of urls){
      try{
        const r=await fetch(url,{cache:'no-store'}); if(!r.ok)throw new Error(`HTTP ${r.status}`);
        const d=await r.json(); if(!d?.periods)throw new Error('Invalid stats payload');
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
  document.querySelectorAll('[data-chart-range]').forEach(b=>b.addEventListener('click',()=>{
    document.querySelectorAll('[data-chart-range]').forEach(x=>x.classList.remove('active'));
    b.classList.add('active');chartRange=Number(b.dataset.chartRange)||7;renderUnifiedChart();
  }));

  new MutationObserver(m=>{if(m.some(x=>x.type==='attributes'&&x.attributeName==='lang'))setTimeout(render,0);}).observe(document.documentElement,{attributes:true});
  loadStats();
  setInterval(loadStats,60000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)loadStats();});
});
