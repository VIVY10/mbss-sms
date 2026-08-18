  var countElems = document.getElementsByClassName("count");
  var intervals = [];
  var hasStartedCounting = Array(countElems.length).fill(false);

  function startCount(index) {
    let elem = countElems[index];
    let maxValue = parseInt(elem.getAttribute("max-data"));
    let currentValue = 0;

    intervals[index] = setInterval(function() {
      if (currentValue < maxValue) {
        currentValue++;
        elem.innerHTML = currentValue;
      } else {
        clearInterval(intervals[index]);
        intervals[index] = null; // Clear interval reference
      }
    }, 100); // Speed of counting
  }

  function resetCount() {
    for (let i = 0; i < countElems.length; i++) {
      if (intervals[i]) {
        clearInterval(intervals[i]);
        intervals[i] = null;
      }
      countElems[i].innerHTML = 0;
    }
    hasStartedCounting.fill(false); // Reset counting status
  }

  function checkScroll() {
    var main = document.getElementById("main");
    var mainTop = main.offsetTop;
    var mainBottom = mainTop + main.clientHeight;
    var screenTop = window.pageYOffset;
    var screenBottom = screenTop + window.innerHeight;

    for (let i = 0; i < countElems.length; i++) {
      let elem = countElems[i];
      let elemTop = elem.offsetTop;
      let elemBottom = elemTop + elem.clientHeight;

      if (screenBottom > elemTop && screenTop < elemBottom && !hasStartedCounting[i]) {
        startCount(i);
        hasStartedCounting[i] = true; // Mark as started
      }
    }
  }

  function debounce(func, wait) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  window.addEventListener('scroll', debounce(checkScroll, 200)); // Debounce scroll events

  // Initial check to handle cases where element is already in view on page load
  checkScroll();
  
  
  // Ensure ScrollReveal is initialized properly
window.sr = ScrollReveal({ 
    reset: true,
    distance: '60px',
    duration: 2000,
    delay: 400
  });
  
  // Customizing a reveal set
  sr.reveal('#card1', {delay: 80, origin:'left'});
  sr.reveal('#card2', {delay: 80, origin:'bottom'});
  sr.reveal('#card3', {delay: 80, origin:'right'});
  sr.reveal('.innerText', {delay: 80, origin:'bottom'});
  sr.reveal('.count-heading', {delay: 80, origin:'bottom'});
