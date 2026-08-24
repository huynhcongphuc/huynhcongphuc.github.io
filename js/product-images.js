document.addEventListener('DOMContentLoaded',()=>{
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
