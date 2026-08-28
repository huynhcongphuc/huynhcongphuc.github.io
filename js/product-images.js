document.addEventListener('DOMContentLoaded',()=>{
  // Lucide 0.468.0 does not render the old "solar-panel" icon name used by product 03.
  // Replace it with a supported icon, then re-render Lucide icons.
  document.querySelectorAll('.product-icon [data-lucide="solar-panel"]').forEach(icon=>{
    icon.setAttribute('data-lucide','sun');
  });
  if(window.lucide) window.lucide.createIcons();

  // Keep product download targets current without changing the card markup/layout.
  const downloadUpdates=[
    {
      match:'IgBq6U7hVxl5RJuDTA6EJ_ah',
      href:'https://hcmpccomvn-my.sharepoint.com/:f:/g/personal/phuchc_hcmpc_com_vn/IgBq6U7hVxl5RJuDTA6EJ_ahAfbhEU0wWJ0EOfyd2pf-ZV8?e=rOUDDB',
      event:'download_secureapp',
      name:'SecureInfoManager',
      type:'software'
    },
    {
      match:'IgD3GSNESb9yRphUKp21307vAbuuXWulCUgH3GJR2e8iTis',
      href:'https://hcmpccomvn-my.sharepoint.com/:f:/g/personal/phuchc_hcmpc_com_vn/IgD3GSNESb9yRphUKp21307vAbuuXWulCUgH3GJR2e8iTis?e=jfo6lo',
      event:'download_microgrid_simulator',
      name:'Microgrid Simulator',
      type:'software'
    },
    {
      match:'IgBn96EFRKNWRaxYJNGeGRkSAbJA4WzgwSRgTV3U-jCUBIk',
      href:'https://hcmpccomvn-my.sharepoint.com/:f:/g/personal/phuchc_hcmpc_com_vn/IgBn96EFRKNWRaxYJNGeGRkSAbJA4WzgwSRgTV3U-jCUBIk?e=WVEF5C',
      event:'download_vpp_platform',
      name:'VPP Platform',
      type:'software'
    }
  ];

  document.querySelectorAll('a.product-download,[data-track-download]').forEach(link=>{
    const current=link.getAttribute('href')||'';
    const update=downloadUpdates.find(item=>current.includes(item.match));
    if(!update) return;
    link.setAttribute('href',update.href);
    link.dataset.downloadEvent=update.event;
    link.dataset.downloadName=update.name;
    link.dataset.downloadType=update.type;
  });

  document.querySelectorAll('.product-preview img').forEach(image=>{
    let path=image.getAttribute('src');
    // Product 05 must use the original user-provided screenshot uploaded to the repository.
    if(path==='picture/products/product-05.svg'){
      path='picture/products/product-05.png';
      image.setAttribute('src',path);
    }
    if(path?.startsWith('picture/products/')) image.src=`https://raw.githubusercontent.com/huynhcongphuc/huynhcongphuc.github.io/main/${path}`;
  });
});
