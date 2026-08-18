  google.charts.load('current', {'packages':['corechart', 'bar']});
  google.charts.setOnLoadCallback(drawChart);

  function drawChart() {
    var button = document.getElementById('change-chart');
    var chartDiv = document.getElementById('chart_div');

    if (!button || !chartDiv) {
      console.error("Required elements (button or chartDiv) not found");
      return;
    }

    var grade9 = google.visualization.arrayToDataTable([
      ['Year', 'Grade 9'],
      ['2019', 80],
      ['2020', 70],
      ['2021', 65],
      ['2022', 74],
      ['2023', 90]
    ]);

    var grade12 = google.visualization.arrayToDataTable([
      ['Year', 'Grade 12'],
      ['2019', 80],
      ['2020', 89],
      ['2021', 96],
      ['2022', 74],
      ['2023', 90]
    ]);

    var grade9Options = {
      width: '100%',
      height: '100%',
      title: 'Grade 9 Academic Performance',
      vAxes: { 0: { title: 'Pass Percentage' } }
    };

    var grade12Options = {
      width: '100%',
      height: '100%',
      title: 'Grade 12 Academic Performance',
      vAxes: { 0: { title: 'Pass Percentage' } }
    };

    function drawGrade9Chart() {
      var classicChart = new google.visualization.ColumnChart(chartDiv);
      classicChart.draw(grade9, grade9Options);
      button.innerText = 'See Grade 12';
      button.onclick = drawGrade12Chart;
    }

    function drawGrade12Chart() {
      var classicChart = new google.visualization.ColumnChart(chartDiv);
      classicChart.draw(grade12, grade12Options);
      button.innerText = 'See Grade 9';
      button.onclick = drawGrade9Chart;
    }

    drawGrade9Chart();
  }

  // Debounced resize function
  let resizeTimeout;
 window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(drawChart, 250); // Delay to optimize performance
  });
  document.addEventListener('DOMContentLoaded', function() {
    const carouselItem = document.querySelector('.carousel-inner');
    if (carouselItem) {
      // Safely add images or other elements
      const newImage = document.createElement('img');
      newImage.src = '/images/carousel/img2.jpg';
      carouselItem.appendChild(newImage);
    } else {
      console.error("Carousel element not found");
    }
  });
