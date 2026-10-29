(() => {
    'use strict';

    const performanceCanvas =
        document.getElementById('performanceChart');

    if (
        !performanceCanvas ||
        typeof Chart === 'undefined'
    ) {
        return;
    }

    new Chart(performanceCanvas, {
        type: 'bar',

        data: {
            labels: [
                'Form 1A',
                'Form 1B',
                'Form 1C',
                'Form 1D',
                'Form 2A'
            ],

            datasets: [{
                label: 'Average Mark',
                data: [72, 68, 76, 64, 81],
                borderRadius: 6,
                backgroundColor: '#2563eb'
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            plugins: {
                legend: {
                    display: false
                }
            },

            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
})();