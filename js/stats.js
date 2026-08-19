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
    document.getElementById('vietnam').textContent=nf.format(d.vietnam||0);
    document.getElementById('downloads').textContent=nf.format(d.downloads||0);
    const max=Math.max(1,...(d.countries||[]).map(x=>x.users));
    document.getElementById('country-rows').innerHTML=(d.countries||[]).length?(d.countries||[]).map(x=>`<tr><td>${esc(x.country)}<div class="geo-bar"><i style="width:${Math.round(x.users*100/max)}%"></i></div></td><td>${nf.format(x.users)}</td></tr>`).join(''):'<tr><td>Chưa có dữ liệu chuẩn</td><td>0</td></tr>';
    document.getElementById('software-rows').innerHTML=(d.software||[]).map(x=>`<tr><td>${esc(x.name)}</td><td>${nf.format(x.downloads)}</td></tr>`).join('');
    document.getElementById('updated-at').textContent=`Nguồn: Google Analytics 4 · Property ${stats.property_id||'287327003'} · cập nhật ${new Date(stats.updated_at).toLocaleString('vi-VN')}`;
  }
  document.querySelectorAll('[data-range]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-range]').forEach(x=>x.classList.remove('active'));b.classList.add('active');range=b.dataset.range;render();}));
  fetch(`data/ga4-stats.json?t=${Date.now()}`,{cache:'no-store'}).then(r=>{if(!r.ok)throw Error();return r.json()}).then(d=>{stats=d;render()}).catch(()=>{document.getElementById('stats-error').style.display='block';['realtime-users','realtime-views','sessions','users','vietnam','downloads'].forEach(id=>document.getElementById(id).textContent='—');document.getElementById('country-rows').innerHTML='<tr><td>Đang chờ dữ liệu GA4</td><td>—</td></tr>';document.getElementById('software-rows').innerHTML='<tr><td>Đang chờ dữ liệu GA4</td><td>—</td></tr>';});
});
