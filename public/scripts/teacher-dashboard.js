(() => {

    'use strict';


    /* =========================================================
       ELEMENTS
    ========================================================= */

    const sidebar =
        document.getElementById('teacherSidebar');

    const sidebarToggle =
        document.getElementById('sidebarToggle');

    const sidebarClose =
        document.getElementById('sidebarClose');

    const sidebarOverlay =
        document.getElementById('sidebarOverlay');

    const links =
        [...document.querySelectorAll('.sidebar-link')];

    const sections =
        [...document.querySelectorAll('.dashboard-section')];

    const pageTitle =
        document.getElementById('pageTitle');

    const pageSubtitle =
        document.getElementById('pageSubtitle');


    /* =========================================================
       SECTION CONFIGURATION
    ========================================================= */

    const sectionInfo = {

        dashboard: {
            title: 'Teacher Dashboard',
            subtitle: 'Academic overview and teaching activities'
        },

        classes: {
            title: 'My Classes',
            subtitle: 'Classes assigned to you'
        },

        allocations: {
            title: 'My Teaching Allocations',
            subtitle: 'Classes and subjects assigned to you'
        },

        marks: {
            title: 'Marks Schedule',
            subtitle: 'Enter and manage pupil marks'
        },

        results: {
            title: 'Pupil Results',
            subtitle: 'Search and review academic results'
        },

        progress: {
            title: 'Progress Analysis',
            subtitle: 'Analyse academic performance'
        },

        midterm: {
            title: 'Mid-Term Reports',
            subtitle: 'Generate mid-term academic reports'
        },

        termreports: {
            title: 'Termly Reports',
            subtitle: 'Generate term academic reports'
        },

        annualreports: {
            title: 'End-of-Year Reports',
            subtitle: 'Generate annual academic reports'
        },

        history: {
            title: 'Report History',
            subtitle: 'Previously generated reports'
        },

        profile: {
            title: 'My Profile',
            subtitle: 'Teacher account information'
        }

    };


    /* =========================================================
       SHOW SECTION
    ========================================================= */

    function showSection(sectionName) {

        sections.forEach(section => {

            section.classList.toggle(
                'active-section',
                section.id === `section-${sectionName}`
            );

        });


        links.forEach(link => {

            link.classList.toggle(
                'active',
                link.dataset.section === sectionName
            );

        });


        const info =
            sectionInfo[sectionName];

        if (info) {

            pageTitle.textContent =
                info.title;

            pageSubtitle.textContent =
                info.subtitle;

        }


        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });


        closeSidebar();


        if (history.replaceState) {

            history.replaceState(
                null,
                '',
                `#${sectionName}`
            );

        }

    }


    /* =========================================================
       SIDEBAR
    ========================================================= */

    function openSidebar() {

        sidebar.classList.add('open');

        sidebarOverlay.classList.add('show');

    }


    function closeSidebar() {

        sidebar.classList.remove('open');

        sidebarOverlay.classList.remove('show');

    }


    sidebarToggle?.addEventListener(
        'click',
        openSidebar
    );


    sidebarClose?.addEventListener(
        'click',
        closeSidebar
    );


    sidebarOverlay?.addEventListener(
        'click',
        closeSidebar
    );


    /* =========================================================
       NAVIGATION
    ========================================================= */

    links.forEach(link => {

        link.addEventListener(
            'click',
            event => {

                event.preventDefault();

                showSection(
                    link.dataset.section
                );

            }
        );

    });


    document
        .querySelectorAll('[data-section-target]')
        .forEach(button => {

            button.addEventListener(
                'click',
                () => {

                    showSection(
                        button.dataset.sectionTarget
                    );

                }
            );

        });


    /* =========================================================
       INITIAL SECTION
    ========================================================= */

    const initialSection =
        window.location.hash
            ? window.location.hash.substring(1)
            : 'dashboard';


    if (sectionInfo[initialSection]) {

        showSection(initialSection);

    } else {

        showSection('dashboard');

    }


    /* =========================================================
       CURRENT DATE
    ========================================================= */

    const currentDate =
        document.getElementById('currentDate');


    if (currentDate) {

        currentDate.textContent =
            new Intl.DateTimeFormat(
                'en-GB',
                {
                    weekday: 'long',
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                }
            ).format(new Date());

    }


    /* =========================================================
       CLASS SEARCH
    ========================================================= */

    const classSearch =
        document.getElementById('classSearch');

    const classLevelFilter =
        document.getElementById('classLevelFilter');


    function filterClasses() {

        const search =
            classSearch?.value
                .toLowerCase()
                .trim() || '';

        const level =
            classLevelFilter?.value
                .toLowerCase() || '';


        document
            .querySelectorAll('.class-item')
            .forEach(item => {

                const text =
                    item.textContent
                        .toLowerCase();

                const matchesSearch =
                    !search ||
                    text.includes(search);

                const matchesLevel =
                    !level ||
                    text.includes(level);

                item.style.display =
                    matchesSearch && matchesLevel
                        ? ''
                        : 'none';

            });

    }


    classSearch?.addEventListener(
        'input',
        filterClasses
    );


    classLevelFilter?.addEventListener(
        'change',
        filterClasses
    );


    /* =========================================================
       ALLOCATION SEARCH
    ========================================================= */

    const allocationSearch =
        document.getElementById('allocationSearch');


    allocationSearch?.addEventListener(
        'input',
        () => {

            const query =
                allocationSearch.value
                    .toLowerCase()
                    .trim();


            document
                .querySelectorAll(
                    '#allocationTable tbody tr'
                )
                .forEach(row => {

                    row.style.display =
                        row.textContent
                            .toLowerCase()
                            .includes(query)
                            ? ''
                            : 'none';

                });

        }
    );


    /* =========================================================
       MARK CALCULATION
    ========================================================= */

    function calculateGrade(mark) {

        if (mark === '') {

            return {
                grade: '-',
                remark: '-'
            };

        }


        const value =
            Number(mark);


        if (Number.isNaN(value))
            return {
                grade: '-',
                remark: '-'
            };


        if (value >= 80)
            return {
                grade: 'A',
                remark: 'Excellent'
            };


        if (value >= 70)
            return {
                grade: 'B',
                remark: 'Very Good'
            };


        if (value >= 60)
            return {
                grade: 'C',
                remark: 'Good'
            };


        if (value >= 50)
            return {
                grade: 'D',
                remark: 'Satisfactory'
            };


        if (value >= 40)
            return {
                grade: 'E',
                remark: 'Pass'
            };


        return {
            grade: 'F',
            remark: 'Needs Improvement'
        };

    }


    document
        .querySelectorAll('.mark-input')
        .forEach(input => {

            input.addEventListener(
                'input',
                () => {

                    const row =
                        input.closest('tr');

                    const result =
                        calculateGrade(
                            input.value
                        );


                    const grade =
                        row.querySelector(
                            '.grade-display'
                        );

                    const remark =
                        row.querySelector(
                            '.remark-display'
                        );


                    if (grade)
                        grade.textContent =
                            result.grade;


                    if (remark)
                        remark.textContent =
                            result.remark;

                }
            );

        });


    /* =========================================================
       PERFORMANCE CHART
    ========================================================= */

    const performanceCanvas =
        document.getElementById(
            'performanceChart'
        );


    if (performanceCanvas &&
        typeof Chart !== 'undefined') {

        new Chart(
            performanceCanvas,
            {

                type: 'bar',

                data: {

                    labels: [
                        'Grade 8A',
                        'Grade 8B',
                        'Grade 9A',
                        'Grade 9B',
                        'Grade 10A'
                    ],

                    datasets: [

                        {

                            label: 'Average Mark',

                            data: [
                                72,
                                68,
                                76,
                                64,
                                81
                            ],

                            borderRadius: 6,

                            backgroundColor:
                                '#2563eb'

                        }

                    ]

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

            }
        );

    }


    /* =========================================================
       PROGRESS CHART
    ========================================================= */

    const progressCanvas =
        document.getElementById(
            'progressChart'
        );


    if (progressCanvas &&
        typeof Chart !== 'undefined') {

        new Chart(
            progressCanvas,
            {

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

                    datasets: [

                        {

                            label:
                                'Class Average',

                            data: [
                                61,
                                64,
                                67,
                                69,
                                73,
                                76
                            ],

                            tension: .35,

                            fill: false,

                            borderColor:
                                '#2563eb',

                            pointRadius: 4

                        }

                    ]

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

            }
        );

    }


    /* =========================================================
       REPORT SCOPE
    ========================================================= */

    document
        .querySelectorAll(
            '.report-form select[name="scope"]'
        )
        .forEach(select => {

            select.addEventListener(
                'change',
                () => {

                    const form =
                        select.closest(
                            '.report-form'
                        );

                    const pupilField =
                        form.querySelector(
                            '.individual-pupil-field'
                        );


                    if (!pupilField)
                        return;


                    pupilField.classList.toggle(
                        'd-none',
                        select.value !== 'individual'
                    );

                }
            );

        });


    /* =========================================================
       REPORT FORM
    ========================================================= */

    document
        .querySelectorAll('.report-form')
        .forEach(form => {

            form.addEventListener(
                'submit',
                event => {

                    event.preventDefault();


                    const reportType =
                        form.dataset.reportType;


                    const modalElement =
                        document.getElementById(
                            'reportPreviewModal'
                        );


                    const modal =
                        bootstrap.Modal.getOrCreateInstance(
                            modalElement
                        );


                    const classSelect =
                        form.querySelector(
                            '[name="classid"]'
                        );

                    const termSelect =
                        form.querySelector(
                            '[name="termid"]'
                        );

                    const yearSelect =
                        form.querySelector(
                            '[name="yearid"]'
                        );


                    document.getElementById(
                        'previewClass'
                    ).textContent =
                        classSelect
                            ?.selectedOptions[0]
                            ?.textContent
                            ?.trim() || '-';


                    document.getElementById(
                        'previewTerm'
                    ).textContent =
                        termSelect
                            ?.selectedOptions[0]
                            ?.textContent
                            ?.trim() ||
                        (
                            reportType === 'annual'
                                ? 'Full Academic Year'
                                : '-'
                        );


                    document.getElementById(
                        'previewYear'
                    ).textContent =
                        yearSelect
                            ?.selectedOptions[0]
                            ?.textContent
                            ?.trim() || '-';


                    modal.show();

                }
            );

        });


    /* =========================================================
       GENERATE REPORT
    ========================================================= */

    document
        .getElementById('generateReportBtn')
        ?.addEventListener(
            'click',
            async function () {

                const button = this;

                button.disabled = true;

                button.innerHTML =
                    '<span class="spinner-border spinner-border-sm me-2"></span>' +
                    'Generating...';


                /*
                 * Later connect this to your backend:
                 *
                 * POST /teacher/reports/generate
                 *
                 * The server should verify:
                 *
                 * teacherid
                 * classid
                 * subject/class allocation
                 * termid
                 * yearid
                 *
                 * before generating the report.
                 */


                setTimeout(() => {

                    button.disabled = false;

                    button.innerHTML =
                        '<i class="bi bi-file-earmark-pdf"></i> Generate PDF';


                    alert(
                        'Report generation endpoint is ready to connect.'
                    );

                }, 1000);

            }
        );


    /* =========================================================
       PUPIL RESULTS SEARCH
    ========================================================= */

    const pupilSearch =
        document.getElementById(
            'pupilSearch'
        );


    pupilSearch?.addEventListener(
        'keydown',
        event => {

            if (event.key !== 'Enter')
                return;

            event.preventDefault();

            const query =
                pupilSearch.value.trim();


            if (!query)
                return;


            /*
             * Later:
             *
             * GET /teacher/results/search?q=
             * ${encodeURIComponent(query)}
             *
             */


            console.log(
                'Search pupil:',
                query
            );

        }
    );


})();