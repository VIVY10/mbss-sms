document.addEventListener('DOMContentLoaded', function () {
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Set default dates
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    document.getElementById('startDate').valueAsDate = startDate;
    document.getElementById('endDate').valueAsDate = endDate;

    // Theme toggle functionality
    const themeToggle = document.getElementById('themeToggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    function updateThemeIcon() {
        const isDark = document.body.classList.contains('dark-theme') || 
                      (!document.body.classList.contains('light-theme') && prefersDarkScheme.matches);
        themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    }
    
    themeToggle.addEventListener('click', function() {
        if (document.body.classList.contains('dark-theme')) {
            document.body.classList.remove('dark-theme');
            document.body.classList.add('light-theme');
            localStorage.setItem('theme', 'light');
        } else if (document.body.classList.contains('light-theme')) {
            document.body.classList.remove('light-theme');
            localStorage.setItem('theme', 'system');
        } else {
            document.body.classList.add('dark-theme');
            localStorage.setItem('theme', 'dark');
        }
        updateThemeIcon();
    });
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
    } else if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
    }
    updateThemeIcon();

    // Print functionality
    document.getElementById('printDashboard').addEventListener('click', function() {
        window.print();
    });

    // Time period dropdown functionality
    document.querySelectorAll('.time-period').forEach(item => {
        item.addEventListener('click', function (e) {
            e.preventDefault();
            const period = this.getAttribute('data-value');
            document.getElementById('timePeriodDropdown').textContent = this.textContent;

            if (period === 'custom') {
                document.getElementById('customDateRange').style.display = 'block';
            } else {
                document.getElementById('customDateRange').style.display = 'none';
                updateCharts(period);
            }
        });
    });

    // Cancel custom date range
    document.getElementById('cancelCustomRange').addEventListener('click', function () {
        document.getElementById('customDateRange').style.display = 'none';
        document.getElementById('timePeriodDropdown').textContent = 'Last 30 Days';
    });

    // Apply custom date range
    document.getElementById('applyDateRange').addEventListener('click', function () {
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;

        if (startDate && endDate) {
            updateCharts('custom', startDate, endDate);
            document.getElementById('customDateRange').style.display = 'none';
            document.getElementById('timePeriodDropdown').textContent =
                `${formatDate(startDate)} to ${formatDate(endDate)}`;
        }
    });

    // Format date for display
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

    // View type buttons (daily, weekly, monthly)
    document.querySelectorAll('.view-type').forEach(button => {
        button.addEventListener('click', function () {
            document.querySelectorAll('.view-type').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            updateTimelineChart(this.getAttribute('data-type'));
        });
    });

    // Initialize charts
    initializeCharts();

    // Function to update all charts
    function updateCharts(period, startDate, endDate) {
        document.getElementById('timelineLoading').style.display = 'block';

        // In a real application, you would fetch data from an API here
        // For demo purposes, we'll use setTimeout to simulate network latency
        setTimeout(() => {
            document.getElementById('timelineLoading').style.display = 'none';
            updateUserGrowthChart();
            updateSchoolDistributionChart();
            updateReportTrendsChart();
            updateActivityTimelineChart();
            updateDistrictPerformanceChart();
            updateReportStatusChart();
            updateSparklines();
        }, 1000);
    }

    // Initialize all charts
    function initializeCharts() {
        // Register plugins
        Chart.register(ChartAnnotation);
        Chart.register(ChartAccessibility);

        // User Growth Chart
        const userGrowthCtx = document.getElementById('userGrowthChart').getContext('2d');
        window.userGrowthChart = new Chart(userGrowthCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Total Users',
                    data: [5000, 6000, 6500, 7200, 8000, 8742],
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleFont: {
                            size: 14,
                            weight: 'bold'
                        },
                        bodyFont: {
                            size: 12
                        },
                        padding: 12,
                        cornerRadius: 4,
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.parsed.y.toLocaleString()}`;
                            }
                        }
                    },
                    annotation: {
                        annotations: {
                            line1: {
                                type: 'line',
                                yMin: 8000,
                                yMax: 8000,
                                borderColor: 'rgb(75, 192, 192)',
                                borderWidth: 2,
                                borderDash: [6, 6],
                                label: {
                                    content: 'Target: 8,000',
                                    enabled: true,
                                    position: 'left'
                                }
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        grid: {
                            drawBorder: false,
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            callback: function (value) {
                                return value >= 1000 ? (value / 1000) + 'k' : value;
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });

        // School Distribution Chart
        const schoolDistributionCtx = document.getElementById('schoolDistributionChart').getContext('2d');
        window.schoolDistributionChart = new Chart(schoolDistributionCtx, {
            type: 'bar',
            data: {
                labels: ['Urban', 'Suburban', 'Rural', 'Remote'],
                datasets: [{
                    label: 'Schools',
                    data: [142, 98, 64, 23],
                    backgroundColor: [
                        'rgba(52, 152, 219, 0.7)',
                        'rgba(155, 89, 182, 0.7)',
                        'rgba(46, 204, 113, 0.7)',
                        'rgba(241, 196, 15, 0.7)'
                    ],
                    borderColor: [
                        'rgba(52, 152, 219, 1)',
                        'rgba(155, 89, 182, 1)',
                        'rgba(46, 204, 113, 1)',
                        'rgba(241, 196, 15, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleFont: {
                            size: 14,
                            weight: 'bold'
                        },
                        bodyFont: {
                            size: 12
                        },
                        padding: 12,
                        cornerRadius: 4,
                        callbacks: {
                            label: function(context) {
                                return `${context.label}: ${context.parsed.y}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            drawBorder: false,
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });

        // Report Trends Chart
        const reportTrendsCtx = document.getElementById('reportTrendsChart').getContext('2d');
        window.reportTrendsChart = new Chart(reportTrendsCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Reports Submitted',
                    data: [1200, 1350, 1420, 1580, 1720, 1842],
                    borderColor: '#e74c3c',
                    backgroundColor: 'rgba(231, 76, 60, 0.1)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleFont: {
                            size: 14,
                            weight: 'bold'
                        },
                        bodyFont: {
                            size: 12
                        },
                        padding: 12,
                        cornerRadius: 4,
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.parsed.y.toLocaleString()}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        grid: {
                            drawBorder: false,
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            callback: function (value) {
                                return value >= 1000 ? (value / 1000) + 'k' : value;
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });

        // Activity Timeline Chart
        updateActivityTimelineChart();

        // District Performance Chart
        const districtCtx = document.getElementById('districtPerformanceChart').getContext('2d');
        window.districtPerformanceChart = new Chart(districtCtx, {
            type: 'bar',
            data: {
                labels: ['District 1', 'District 2', 'District 3', 'District 4', 'District 5'],
                datasets: [{
                    label: 'Performance Score',
                    data: [85, 72, 90, 68, 78],
                    backgroundColor: 'rgba(52, 152, 219, 0.7)',
                    borderColor: 'rgba(52, 152, 219, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleFont: {
                            size: 14,
                            weight: 'bold'
                        },
                        bodyFont: {
                            size: 12
                        },
                        padding: 12,
                        cornerRadius: 4,
                        callbacks: {
                            label: function(context) {
                                return `Performance: ${context.raw}%`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: {
                            drawBorder: false,
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            callback: function (value) {
                                return value + '%';
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });

        // Report Status Chart
        updateReportStatusChart();

        // Sparklines for top schools
        updateSparklines();
    }

    // Update Activity Timeline Chart
    function updateActivityTimelineChart(type = 'daily') {
        const ctx = document.getElementById('activityTimelineChart').getContext('2d');

        if (window.activityTimelineChart instanceof Chart) {
            window.activityTimelineChart.destroy();
        }

        // Generate labels based on the selected type
        let labels = [];
        let dataPoints = 30; // Default for daily
        
        if (type === 'weekly') {
            dataPoints = 12;
            labels = Array.from({ length: dataPoints }, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - (dataPoints - i - 1) * 7);
                return `Week ${i + 1}`;
            });
        } else if (type === 'monthly') {
            dataPoints = 12;
            labels = Array.from({ length: dataPoints }, (_, i) => {
                const date = new Date();
                date.setMonth(date.getMonth() - (dataPoints - i - 1));
                return date.toLocaleDateString('en-US', { month: 'short' });
            });
        } else {
            // Daily
            labels = Array.from({ length: dataPoints }, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - (dataPoints - i - 1));
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            });
        }

        window.activityTimelineChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'User Logins',
                        data: generateRandomData(dataPoints, 200, 400),
                        borderColor: '#3498db',
                        backgroundColor: 'rgba(52, 152, 219, 0.1)',
                        borderWidth: 2,
                        tension: 0.3,
                        fill: true
                    },
                    {
                        label: 'Report Submissions',
                        data: generateRandomData(dataPoints, 50, 150),
                        borderColor: '#e74c3c',
                        backgroundColor: 'rgba(231, 76, 60, 0.1)',
                        borderWidth: 2,
                        tension: 0.3,
                        fill: true
                    },
                    {
                        label: 'Assignment Completions',
                        data: generateRandomData(dataPoints, 30, 100),
                        borderColor: '#2ecc71',
                        backgroundColor: 'rgba(46, 204, 113, 0.1)',
                        borderWidth: 2,
                        tension: 0.3,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        align: 'end',
                        labels: {
                            boxWidth: 12,
                            padding: 20,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleFont: {
                            size: 14,
                            weight: 'bold'
                        },
                        bodyFont: {
                            size: 12
                        },
                        padding: 12,
                        cornerRadius: 4,
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.parsed.y}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            drawBorder: false,
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    // Update Report Status Chart
    function updateReportStatusChart() {
        const ctx = document.getElementById('reportStatusChart').getContext('2d');
        
        if (window.reportStatusChart instanceof Chart) {
            window.reportStatusChart.destroy();
        }

        window.reportStatusChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Approved', 'Pending Review', 'Rejected', 'Draft'],
                datasets: [{
                    data: [65, 18, 12, 5],
                    backgroundColor: [
                        '#2ecc71',
                        '#f39c12',
                        '#e74c3c',
                        '#95a5a6'
                    ],
                    borderColor: '#fff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            boxWidth: 12,
                            padding: 16,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleFont: {
                            size: 14,
                            weight: 'bold'
                        },
                        bodyFont: {
                            size: 12
                        },
                        padding: 12,
                        cornerRadius: 4,
                        callbacks: {
                            label: function(context) {
                                return `${context.label}: ${context.raw}%`;
                            }
                        }
                    }
                }
            }
        });
    }

    // Update Sparklines for top schools
    function updateSparklines() {
        const sparklineOptions = {
            type: 'line',
            data: {
                datasets: [{
                    data: generateRandomData(5, 70, 100),
                    borderColor: '#3498db',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: false,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { display: false },
                    y: { display: false }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        };

        for (let i = 1; i <= 5; i++) {
            const ctx = document.getElementById(`sparkline${i}`).getContext('2d');
            new Chart(ctx, sparklineOptions);
        }
    }

    // Helper function to generate random data
    function generateRandomData(count, min, max) {
        // Generate random data with a slight upward trend
        return Array.from({ length: count }, (_, i) => {
            const baseValue = Math.floor(Math.random() * (max - min + 1)) + min;
            const trend = i * ((max - min) / count) * 0.3;
            return Math.min(max, Math.floor(baseValue + trend));
        });
    }

    // Update User Growth Chart
    function updateUserGrowthChart() {
        const newData = generateRandomData(6, 5000, 9000);
        document.getElementById('totalUsers').textContent = newData[newData.length - 1].toLocaleString();
        window.userGrowthChart.data.datasets[0].data = newData;
        window.userGrowthChart.update();
    }

    // Update School Distribution Chart
    function updateSchoolDistributionChart() {
        const newData = generateRandomData(4, 20, 150);
        document.getElementById('totalSchools').textContent = newData.reduce((a, b) => a + b, 0);
        window.schoolDistributionChart.data.datasets[0].data = newData;
        window.schoolDistributionChart.update();
    }

    // Update Report Trends Chart
    function updateReportTrendsChart() {
        const newData = generateRandomData(6, 1000, 2000);
        document.getElementById('totalReports').textContent = newData[newData.length - 1].toLocaleString();
        window.reportTrendsChart.data.datasets[0].data = newData;
        window.reportTrendsChart.update();
    }

    // Update District Performance Chart
    function updateDistrictPerformanceChart() {
        const newData = generateRandomData(5, 60, 95);
        window.districtPerformanceChart.data.datasets[0].data = newData;
        window.districtPerformanceChart.update();
    }

    // Download Report functionality
    document.getElementById('downloadReport').addEventListener('click', function() {        
        // Show loading state
        const originalText = this.innerHTML;
        this.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Generating...';
        this.disabled = true;
        
        // Simulate report generation
        setTimeout(() => {
            this.innerHTML = originalText;
            this.disabled = false;
            
            // Create a temporary link to trigger download
            const link = document.createElement('a');
            link.href = '#';
            link.download = 'Education_Platform_Analytics_Report.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Show success message
            showToast('Report downloaded successfully!', 'success');
        }, 1500);
    });

    // View All Assignments button
    document.getElementById('view-all-assignments').addEventListener('click', function() {
        showToast('Navigating to assignments page...', 'info');
        // In a real app, this would navigate to another page
    });

    // View All Schools button
    document.getElementById('viewAllSchools').addEventListener('click', function() {
        showToast('Navigating to schools directory...', 'info');
        // In a real app, this would navigate to another page
    });

    // Export Timeline button
    document.getElementById('exportTimeline').addEventListener('click', function() {        
        // Create a temporary link to trigger download
        const link = document.createElement('a');
        link.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(generateCSVData());
        link.download = 'Activity_Timeline_Data.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showToast('Timeline data exported successfully!', 'success');
    });

    // Helper function to generate CSV data
    function generateCSVData() {
        const headers = 'Date,User Logins,Report Submissions,Assignment Completions\n';
        const dates = Array.from({ length: 30 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (29 - i));
            return date.toLocaleDateString('en-US');
        });
        
        const data = dates.map((date, i) => {
            return `${date},${window.activityTimelineChart.data.datasets[0].data[i]},${window.activityTimelineChart.data.datasets[1].data[i]},${window.activityTimelineChart.data.datasets[2].data[i]}`;
        }).join('\n');
        
        return headers + data;
    }

    // Helper function to show toast messages
    function showToast(message, type = 'success') {
        const toastContainer = document.createElement('div');
        toastContainer.className = 'position-fixed bottom-0 end-0 p-3';
        toastContainer.style.zIndex = '11';
        
        const bgClass = type === 'success' ? 'bg-success' : 
                        type === 'error' ? 'bg-danger' : 
                        type === 'info' ? 'bg-info' : 'bg-primary';
        
        toastContainer.innerHTML = `
            <div class="toast show" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="toast-header ${bgClass} text-white">
                    <strong class="me-auto">${type.charAt(0).toUpperCase() + type.slice(1)}</strong>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
                <div class="toast-body">
                    ${message}
                </div>
            </div>
        `;
        document.body.appendChild(toastContainer);
        
        // Remove toast after 3 seconds
        setTimeout(() => {
            toastContainer.remove();
        }, 3000);
    }

    // Initialize everything when DOM is loaded
    initializeCharts();
});