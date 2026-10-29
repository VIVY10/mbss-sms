(() => {
    'use strict';

    const canvas =
        document.getElementById(
            'progressChart'
        );

    if (
        !canvas ||
        typeof Chart === 'undefined'
    ) {
        return;
    }

    new Chart(canvas, {
        type: 'line',

        data: {
            labels: [
                'Term 1',
                'Assessment 1',
                'Assessment 2',
                'Mid-Term',
                'Assessment 3',
                'Final'
            ],

            datasets: [{
                label: 'Class Average',

                data: [
                    61,
                    64,
                    67,
                    69,
                    73,
                    76
                ],

                tension: 0.35,
                fill: false,
                borderColor: '#2563eb',
                pointRadius: 4
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            scales: {
                y: {
                    min: 0,
                    max: 100
                }
            }
        }
    });
})();