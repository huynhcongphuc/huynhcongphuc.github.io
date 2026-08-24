document.addEventListener('DOMContentLoaded',()=>{
  // Lucide 0.468.0 does not render the old "solar-panel" icon name used by product 03.
  // Replace it with a supported icon, then re-render Lucide icons.
  document.querySelectorAll('.product-icon [data-lucide="solar-panel"]').forEach(icon=>{
    icon.setAttribute('data-lucide','sun');
  });
  if(window.lucide) window.lucide.createIcons();

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
