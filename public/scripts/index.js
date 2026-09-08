window.addEventListener('load', function() {
    document.body.classList.remove('is-preload');
  });
  
  window.addEventListener('touchmove', function(e) {
    e.preventDefault();
  }, { passive: false });
  
  window.addEventListener('orientationchange', function() {
    document.body.scrollTop = 0;
  });