document.addEventListener('DOMContentLoaded',()=>{
  const RAW_URL='https://raw.githubusercontent.com/huynhcongphuc/huynhcongphuc.github.io/main/data/ga4-stats.json';
  const RESEARCH_CATALOG=[
    {event:'download_research_ieee2030_5',vi:'IEEE 2030.11 & IEEE 2030.5 – Nghiên cứu DERMS',en:'IEEE 2030.11 & IEEE 2030.5 DERMS Research'},
    {event:'download_research_abess',vi:'Bài báo độ tin cậy ABESS',en:'ABESS Reliability Paper'},
    {event:'download_research_flisr_ieee',vi:'Bài báo IEEE FLISR với nguồn phân tán',en:'IEEE FLISR with DG Paper'},
    {event:'download_research_flisr_vn',vi:'Bài báo FLISR có nguồn phát phân tán',en:'FLISR with Distributed Generation Paper'}
  ];
  const SOFTWARE_NAMES={'SecureApp':{vi:'SecureApp',en:'SecureApp'},'Master Server Protocol':{vi:'Master Server Protocol',en:'Master Server Protocol'},'DER Simulator':{vi:'Giả lập nguồn phân tán (DER Simulator)',en:'DER Simulator'},'Microgrid Simulator':{vi:'Giả lập Microgrid',en:'Microgrid Simulator'}};
  const TEXT={
    vi:{noData:'Chưa có dữ liệu',updated:'Cập nhật lúc',unknown:'Không xác định',vietnam:'Việt Nam',users:'Người dùng',software:'Tải phần mềm',research:'Tải nghiên cứu',sessions:'Phiên truy cập',total:'Tổng',all:'Tất cả',countryTitle:'1. Phân bố truy cập theo quốc gia',activityTitle:'2. Tổng hợp lượt truy cập và tải xuống',countryNote:'Dữ liệu quốc gia được tổng hợp từ toàn bộ thời gian thống kê.',activityNote:'Bao gồm tổng phiên truy cập, lượt tải phần mềm và lượt tải bài nghiên cứu.',justNow:'vừa cập nhật',minuteAgo:'1 phút trước',minutesAgo:n=>`${n} phút trước`,hourAgo:'1 giờ trước',hoursAgo:n=>`${n} giờ trước`},
    en:{noData:'No data',updated:'Updated at',unknown:'Unknown',vietnam:'Vietnam',users:'Users',software:'Software downloads',research:'Research downloads',sessions:'Sessions',total:'Total',all:'All',countryTitle:'1. Access distribution by country',activityTitle:'2. Sessions and downloads summary',countryNote:'Country data is aggregated from the full statistics history.',activityNote:'Includes total sessions, software downloads and research downloads.',justNow:'just now',minuteAgo:'1 minute ago',minutesAgo:n=>`${n} minutes ago`,hourAgo:'1 hour ago',hoursAgo:n=>`${n} hours ago`}
  };
  const COLORS=['#1f6fae','#1da05c','#7a4fb0','#e0a000','#2da1b8','#d44b35','#8a9aaa','#5c6f82'];
  let stats=null,range='7d';
  const lang=()=>String(document.documentElement.lang||'vi').toLowerCase().startsWith('en')?'en':'vi';
  const nf=()=>new Intl.NumberFormat(lang()==='en'?'en-US':'vi-VN');
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const countryName=name=>{const l=lang(),n=String(name||'').trim();if(!n||n==='(not set)'||n==='Unknown')return TEXT[l].unknown;if(n==='Vietnam')return TEXT[l].vietnam;return n;};
  const softwareName=name=>SOFTWARE_NAMES[name]?.[lang()]||name;
  const mergeResearch=(standard=[],realtime=[])=>RESEARCH_CATALOG.map(base=>{const s=standard.find(x=>x.event===base.event),r=realtime.find(x=>x.event===base.event);return {event:base.event,name:base[lang()],downloads:(s?.downloads||0)>0?(s.downloads||0):(r?.downloads||0)};});
  const relativeAge=iso=>{const l=lang(),t=new Date(iso).getTime();if(!Number.isFinite(t))return '';const mins=Math.max(0,Math.floor((Date.now()-t)/60000));if(mins<1)return TEXT[l].justNow;if(mins===1)return TEXT[l].minuteAgo;if(mins<60)return TEXT[l].minutesAgo(mins);const hours=Math.floor(mins/60);return hours===1?TEXT[l].hourAgo:TEXT[l].hoursAgo(hours);};
  const renderUpdatedAt=()=>{const node=document.getElementById('updated-at');if(!node||!stats?.updated_at)return;const l=lang();node.textContent=`${TEXT[l].updated} ${new Date(stats.updated_at).toLocaleString(l==='en'?'en-US':'vi-VN')} · ${relativeAge(stats.updated_at)}`;};

  function buildDonut(el,items,total){
    if(!el)return;
    if(!total){el.style.background='conic-gradient(#e8edf2 0 100%)';return;}
    let cursor=0;const stops=[];
    items.forEach((x,i)=>{const pct=(x.value/total)*100;const end=cursor+pct;stops.push(`${COLORS[i%COLORS.length]} ${cursor.toFixed(3)}% ${end.toFixed(3)}%`);cursor=end;});
    if(cursor<100)stops.push(`#e8edf2 ${cursor}% 100%`);
    el.style.background=`conic-gradient(from -90deg, ${stops.join(',')})`;
  }

  function renderLegend(container,items,total){
    if(!container)return;const fmt=nf();
    container.innerHTML=items.length?items.map((x,i)=>{const pct=total?x.value*100/total:0;return `<div class="donut-legend-row"><i style="background:${COLORS[i%COLORS.length]}"></i><span>${esc(x.label)}</span><strong>${fmt.format(x.value)} <small>(${pct.toFixed(1)}%)</small></strong></div>`;}).join(''):`<div class="donut-empty">${TEXT[lang()].noData}</div>`;
  }

  function renderDonuts(){
    if(!stats)return;const l=lang(),fmt=nf(),all=stats.periods?.all||{},rt=stats.realtime||{};
    const countries=(all.countries||[]).filter(x=>Number(x.users||0)>0).slice(0,6).map(x=>({label:countryName(x.country),value:Number(x.users||0)}));
    const countryTotal=countries.reduce((s,x)=>s+x.value,0);
    buildDonut(document.getElementById('country-donut'),countries,countryTotal);
    renderLegend(document.getElementById('country-donut-legend'),countries,countryTotal);
    document.getElementById('country-donut-total').textContent=fmt.format(countryTotal);
    document.getElementById('country-donut-label').textContent=TEXT[l].total;
    document.getElementById('country-donut-unit').textContent=TEXT[l].users;
    document.getElementById('country-chart-title').textContent=TEXT[l].countryTitle;
    document.getElementById('country-chart-note').textContent=TEXT[l].countryNote;

    const researchAll=mergeResearch(all.research||[],rt.research||[]);
    const researchTotal=Math.max(Number(all.research_downloads||0),researchAll.reduce((s,x)=>s+Number(x.downloads||0),0));
    const activity=[
      {label:TEXT[l].sessions,value:Number(all.sessions||0)},
      {label:TEXT[l].software,value:Number(all.downloads||0)},
      {label:TEXT[l].research,value:researchTotal}
    ];
    const activityTotal=activity.reduce((s,x)=>s+x.value,0);
    buildDonut(document.getElementById('activity-donut'),activity,activityTotal);
    renderLegend(document.getElementById('activity-donut-legend'),activity,activityTotal);
    document.getElementById('activity-donut-total').textContent=fmt.format(activityTotal);
    document.getElementById('activity-donut-label').textContent=TEXT[l].total;
    document.getElementById('activity-donut-unit').textContent=TEXT[l].all;
    document.getElementById('activity-chart-title').textContent=TEXT[l].activityTitle;
    document.getElementById('activity-chart-note').textContent=TEXT[l].activityNote;
  }

  function render(){
    if(!stats)return;const l=lang(),fmt=nf(),rt=stats.realtime||{},d=stats.periods?.[range]||stats.periods?.['7d']||{};
    document.getElementById('realtime-users').textContent=fmt.format(rt.active_users||0);document.getElementById('realtime-views').textContent=fmt.format(rt.views||0);
    document.getElementById('sessions').textContent=fmt.format(d.sessions||0);document.getElementById('users').textContent=fmt.format(d.users||0);
    const realtimeVietnam=(rt.countries||[]).find(x=>String(x.country).toLowerCase()==='vietnam')?.users||0;document.getElementById('vietnam').textContent=fmt.format((d.vietnam||0)>0?(d.vietnam||0):realtimeVietnam);document.getElementById('downloads').textContent=fmt.format((d.downloads||0)>0?(d.downloads||0):(rt.downloads||0));
    const researchData=mergeResearch(d.research||[],rt.research||[]),calculatedResearchTotal=researchData.reduce((sum,x)=>sum+(x.downloads||0),0),researchTotal=Math.max(d.research_downloads||0,rt.research_downloads||0,calculatedResearchTotal);document.getElementById('research-downloads').textContent=fmt.format(researchTotal);
    const countryData=(d.countries||[]).length?(d.countries||[]):(rt.countries||[]),max=Math.max(1,...countryData.map(x=>x.users));document.getElementById('country-rows').innerHTML=countryData.length?countryData.map(x=>`<tr><td>${esc(countryName(x.country))}<div class="geo-bar"><i style="width:${Math.round(x.users*100/max)}%"></i></div></td><td>${fmt.format(x.users)}</td></tr>`).join(''):`<tr><td>${TEXT[l].noData}</td><td>0</td></tr>`;
    const realtimeSoftware=rt.software||[],standardSoftware=d.software||[],hasStandard=standardSoftware.some(x=>(x.downloads||0)>0),softwareData=hasStandard?standardSoftware:(realtimeSoftware.length?realtimeSoftware:standardSoftware);document.getElementById('software-rows').innerHTML=softwareData.length?softwareData.map(x=>`<tr><td>${esc(softwareName(x.name))}</td><td>${fmt.format(x.downloads||0)}</td></tr>`).join(''):`<tr><td>${TEXT[l].noData}</td><td>0</td></tr>`;
    document.getElementById('research-rows').innerHTML=researchData.map(x=>`<tr><td>${esc(x.name)}</td><td>${fmt.format(x.downloads||0)}</td></tr>`).join('');
    renderDonuts();renderUpdatedAt();const error=document.getElementById('stats-error');if(error)error.style.display='none';
  }

  async function loadStats(){const urls=[`${RAW_URL}?t=${Date.now()}`,`data/ga4-stats.json?t=${Date.now()}`];let lastError;for(const url of urls){try{const r=await fetch(url,{cache:'no-store'});if(!r.ok)throw new Error(`HTTP ${r.status}`);const d=await r.json();if(!d?.periods)throw new Error('Invalid stats payload');stats=d;render();return;}catch(err){lastError=err;}}console.warn('Stats refresh failed',lastError);if(!stats){document.getElementById('stats-error').style.display='block';}}
  document.querySelectorAll('[data-range]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-range]').forEach(x=>x.classList.remove('active'));b.classList.add('active');range=b.dataset.range;render();}));
  new MutationObserver(m=>{if(m.some(x=>x.type==='attributes'&&x.attributeName==='lang'))setTimeout(render,0);}).observe(document.documentElement,{attributes:true});
  loadStats();setInterval(loadStats,60000);setInterval(renderUpdatedAt,15000);document.addEventListener('visibilitychange',()=>{if(!document.hidden){loadStats();renderUpdatedAt();}});
});
