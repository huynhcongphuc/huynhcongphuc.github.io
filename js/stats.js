document.addEventListener('DOMContentLoaded',()=>{
  const nf=new Intl.NumberFormat('vi-VN');
  let stats=null,range='7d';
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function render(){
    if(!stats)return;
    const rt=stats.realtime||{};
    document.getElementById('realtime-users').textContent=nf.format(rt.active_users||0);
    document.getElementById('realtime-views').textContent=nf.format(rt.views||0);
    const d=stats.periods[range];
    document.getElementById('sessions').textContent=nf.format(d.sessions||0);
    document.getElementById('users').textContent=nf.format(d.users||0);

    const realtimeVietnam=(rt.countries||[]).find(x=>String(x.country).toLowerCase()==='vietnam')?.users||0;
    const vietnamValue=(d.vietnam||0)>0?(d.vietnam||0):realtimeVietnam;
    document.getElementById('vietnam').textContent=nf.format(vietnamValue);
    document.getElementById('downloads').textContent=nf.format(d.downloads||0);

    const countryData=(d.countries||[]).length?(d.countries||[]):(rt.countries||[]);
    const max=Math.max(1,...countryData.map(x=>x.users));
    document.getElementById('country-rows').innerHTML=countryData.length?countryData.map(x=>`<tr><td>${esc(x.country)}<div class="geo-bar"><i style="width:${Math.round(x.users*100/max)}%"></i></div></td><td>${nf.format(x.users)}</td></tr>`).join(''):'<tr><td>Chưa có dữ liệu</td><td>0</td></tr>';

    document.getElementById('software-rows').innerHTML=(d.software||[]).map(x=>`<tr><td>${esc(x.name)}</td><td>${nf.format(x.downloads)}</td></tr>`).join('');
    const updated=document.getElementById('updated-at');
    if(updated&&stats.updated_at)updated.textContent=`Cập nhật lúc ${new Date(stats.updated_at).toLocaleString('vi-VN')}`;
  }
  document.querySelectorAll('[data-range]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-range]').forEach(x=>x.classList.remove('active'));b.classList.add('active');range=b.dataset.range;render();}));
  fetch(`data/ga4-stats.json?t=${Date.now()}`,{cache:'no-store'}).then(r=>{if(!r.ok)throw Error();return r.json()}).then(d=>{stats=d;render()}).catch(()=>{document.getElementById('stats-error').style.display='block';['realtime-users','realtime-views','sessions','users','vietnam','downloads'].forEach(id=>document.getElementById(id).textContent='—');document.getElementById('country-rows').innerHTML='<tr><td>Đang chờ dữ liệu</td><td>—</td></tr>';document.getElementById('software-rows').innerHTML='<tr><td>Đang chờ dữ liệu</td><td>—</td></tr>';});
});
