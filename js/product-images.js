document.addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('.product-preview img').forEach(image=>{
    const path=image.getAttribute('src');
    if(path?.startsWith('picture/products/')) image.src=`https://raw.githubusercontent.com/huynhcongphuc/huynhcongphuc.github.io/main/${path}`;
  });
});

