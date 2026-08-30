(() => {

    'use strict';


    /* =====================================================
       ELEMENTS
    ====================================================== */

    const sidebar = document.getElementById('sidebar');
    const menuBtn = document.getElementById('menuBtn');

    const navItems =
        document.querySelectorAll('[data-section-target]');


    /* =====================================================
       MOBILE SIDEBAR
    ====================================================== */

    menuBtn?.addEventListener('click', () => {

        sidebar?.classList.toggle('open');

    });


    /* =====================================================
       SECTION NAVIGATION
    ====================================================== */

    navItems.forEach(item => {

        item.addEventListener('click', event => {

            const targetId =
                item.dataset.sectionTarget;

            if (!targetId) return;

            const target =
                document.getElementById(targetId);

            if (!target) return;

            event.preventDefault();

            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });


            /* Update active sidebar item */

            document
                .querySelectorAll('.sidebar .nav-item')
                .forEach(nav => {

                    nav.classList.remove('active');

                });


            if (item.classList.contains('nav-item')) {

                item.classList.add('active');

            }


            sidebar?.classList.remove('open');

        });

    });


    /* =====================================================
       TEACHER SEARCH
    ====================================================== */

    const teacherSearch =
        document.getElementById('teacherSearch');

    const teacherStatusFilter =
        document.getElementById('teacherStatusFilter');

    const teacherTable =
        document.getElementById('teacherTable');


    function filterTeachers() {

        if (!teacherTable) return;

        const search =
            teacherSearch?.value
                .trim()
                .toLowerCase() || '';

        const status =
            teacherStatusFilter?.value
                .toLowerCase() || '';


        const rows =
            teacherTable.querySelectorAll('tbody tr');


        rows.forEach(row => {

            const text =
                row.textContent.toLowerCase();

            const matchesSearch =
                !search || text.includes(search);


            let matchesStatus = true;

            if (status) {

                const badge =
                    row.querySelector('.status-badge');

                const rowStatus =
                    badge?.textContent
                        .trim()
                        .toLowerCase() || '';

                matchesStatus =
                    rowStatus === status;

            }


            row.style.display =
                matchesSearch && matchesStatus
                    ? ''
                    : 'none';

        });

    }


    teacherSearch?.addEventListener(
        'input',
        filterTeachers
    );

    teacherStatusFilter?.addEventListener(
        'change',
        filterTeachers
    );


    /* =====================================================
       CLASS SEARCH
    ====================================================== */

    const classSearch =
        document.getElementById('classSearch');


    classSearch?.addEventListener('input', () => {

        const value =
            classSearch.value
                .trim()
                .toLowerCase();


        const table =
            classSearch.closest('.data-card')
                ?.querySelector('table');


        if (!table) return;


        table
            .querySelectorAll('tbody tr')
            .forEach(row => {

                const text =
                    row.textContent.toLowerCase();

                row.style.display =
                    !value || text.includes(value)
                        ? ''
                        : 'none';

            });

    });


    /* =====================================================
       RESULT SEARCH
    ====================================================== */

    const resultForm =
        document.getElementById(
            'resultSearchForm'
        );

    const resultContainer =
        document.getElementById(
            'resultContainer'
        );

    const resultMessage =
        document.getElementById(
            'resultSearchMessage'
        );


    function showResultMessage(
        message,
        type = 'success'
    ) {

        if (!resultMessage) return;

        resultMessage.textContent = message;

        resultMessage.className =
            `search-message ${type}`;

    }


    resultForm?.addEventListener(
        'submit',
        async event => {

            event.preventDefault();


            const examno =
                document
                    .getElementById('resultExamNo')
                    ?.value
                    .trim();


            const year =
                document
                    .getElementById('resultYear')
                    ?.value;


            const term =
                document
                    .getElementById('resultTerm')
                    ?.value;


            if (!examno) {

                showResultMessage(
                    'Enter a pupil exam number.',
                    'error'
                );

                return;

            }


            /*
             * Replace this endpoint with your
             * actual controller route.
             *
             * Example:
             *
             * /hod/results/search
             */

            try {

                showResultMessage(
                    'Searching results...',
                    'success'
                );


                /*
                const response = await fetch(
                    '/hod/results/search',
                    {
                        method: 'POST',

                        headers: {
                            'Content-Type':
                                'application/json'
                        },

                        body: JSON.stringify({
                            examno,
                            year,
                            term
                        })
                    }
                );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        'Unable to retrieve results.'
                    );

                }


                renderResults(data);
                */


                /*
                 * Temporary demonstration.
                 * Remove once your endpoint is connected.
                 */

                renderResults({

                    student: {
                        name: 'Pupil Result',
                        examno
                    },

                    results: []

                });


            } catch (error) {

                showResultMessage(
                    error.message ||
                    'Unable to search results.',
                    'error'
                );

            }

        }
    );


    function renderResults(data) {

        if (!resultContainer) return;

        resultContainer.classList.remove('d-none');

        const student =
            data.student || {};

        const results =
            data.results || [];


        if (!results.length) {

            resultContainer.innerHTML = `

                <div class="empty-state">

                    <i class="bi bi-file-earmark-x"></i>

                    <strong>
                        No results found
                    </strong>

                    <span>
                        No results were found for
                        ${escapeHtml(student.examno || '')}.
                    </span>

                </div>

            `;

            return;

        }


        resultContainer.innerHTML = `

            <div class="mb-3">

                <strong>
                    ${escapeHtml(student.name || '')}
                </strong>

                <span class="text-muted ms-2">
                    ${escapeHtml(student.examno || '')}
                </span>

            </div>


            <div class="table-responsive">

                <table class="table dashboard-table">

                    <thead>

                        <tr>

                            <th>Subject</th>
                            <th>Assessment</th>
                            <th>Mark</th>
                            <th>Grade</th>

                        </tr>

                    </thead>

                    <tbody>

                        ${results.map(result => `

                            <tr>

                                <td>
                                    ${escapeHtml(
                                        result.subjectname || ''
                                    )}
                                </td>

                                <td>
                                    ${escapeHtml(
                                        result.assessment || ''
                                    )}
                                </td>

                                <td>
                                    ${escapeHtml(
                                        result.mark ?? ''
                                    )}
                                </td>

                                <td>
                                    <span class="status-badge success">
                                        ${escapeHtml(
                                            result.grade || ''
                                        )}
                                    </span>
                                </td>

                            </tr>

                        `).join('')}

                    </tbody>

                </table>

            </div>

        `;

        showResultMessage(
            'Results found.',
            'success'
        );

    }


    /* =====================================================
       PROGRESS CHART
    ====================================================== */

    const loadProgress =
        document.getElementById(
            'loadProgress'
        );


    loadProgress?.addEventListener(
        'click',
        async () => {

            const student =
                document
                    .getElementById(
                        'progressStudent'
                    )
                    ?.value;


            const subject =
                document
                    .getElementById(
                        'progressSubject'
                    )
                    ?.value;


            if (!student || !subject) {

                alert(
                    'Select a student and subject.'
                );

                return;

            }


            /*
             * Replace this demo data with:
             *
             * GET /hod/results/progress
             *
             * Example response:
             *
             * {
             *   term1: 55,
             *   term2: 68,
             *   term3: 74,
             *   final: 78
             * }
             */

            drawProgressChart({

                term1: 55,
                term2: 68,
                term3: 74,
                final: 78

            });

        }
    );


    function drawProgressChart(data) {

        const values = [

            Number(data.term1 || 0),
            Number(data.term2 || 0),
            Number(data.term3 || 0),
            Number(data.final || 0)

        ];


        const line =
            document.getElementById(
                'progressLine'
            );

        const pointsGroup =
            document.getElementById(
                'progressPoints'
            );


        if (!line || !pointsGroup) return;


        const width = 900;

        const height = 280;


        const xPositions = [
            80,
            320,
            560,
            800
        ];


        const points =
            values.map(
                (value, index) => {

                    const safeValue =
                        Math.max(
                            0,
                            Math.min(100, value)
                        );


                    const y =
                        height -
                        (safeValue / 100) *
                        height;


                    return `${xPositions[index]},${y}`;

                }
            );


        line.setAttribute(
            'points',
            points.join(' ')
        );


        pointsGroup.innerHTML =
            points.map(
                (point, index) => {

                    const [
                        x,
                        y
                    ] = point.split(',');


                    return `

                        <circle
                            cx="${x}"
                            cy="${y}"
                            r="6"
                            fill="currentColor"
                        />

                    `;

                }
            ).join('');


        document.getElementById(
            'term1Score'
        ).textContent =
            `${values[0]}%`;


        document.getElementById(
            'term2Score'
        ).textContent =
            `${values[1]}%`;


        document.getElementById(
            'term3Score'
        ).textContent =
            `${values[2]}%`;


        document.getElementById(
            'finalScore'
        ).textContent =
            `${values[3]}%`;

    }


    /* =====================================================
       REPORT PREVIEW
    ====================================================== */

    const reportForm =
        document.getElementById(
            'reportForm'
        );


    const previewButton =
        document.getElementById(
            'previewReport'
        );


    function selectedText(id) {

        const select =
            document.getElementById(id);

        if (!select ||
            select.selectedIndex < 0) {

            return '—';

        }

        return select
            .options[
                select.selectedIndex
            ]
            .textContent
            .trim();

    }


    function updateReportPreview() {

        const reportType =
            selectedText('reportType');

        const year =
            selectedText('reportYear');

        const term =
            selectedText('reportTerm');

        const subject =
            selectedText('reportSubject');

        const className =
            selectedText('reportClass');


        const title =
            document.getElementById(
                'previewReportTitle'
            );


        const previewYear =
            document.getElementById(
                'previewYear'
            );


        const previewTerm =
            document.getElementById(
                'previewTerm'
            );


        const previewClass =
            document.getElementById(
                'previewClass'
            );


        const previewStatus =
            document.getElementById(
                'previewStatus'
            );


        title.textContent =
            reportType === '—'
                ? 'Report Preview'
                : reportType;


        previewYear.textContent =
            year || '—';


        previewTerm.textContent =
            term || 'All Terms';


        previewClass.textContent =
            className || 'All Classes';


        previewStatus.textContent =
            'Ready';

    }


    previewButton?.addEventListener(
        'click',
        updateReportPreview
    );


    reportForm?.addEventListener(
        'submit',
        event => {

            event.preventDefault();

            updateReportPreview();


            /*
             * Actual PDF endpoint can later be:
             *
             * POST /hod/reports/generate
             *
             * with:
             *
             * reportType
             * yearid
             * termid
             * subjectcode
             * classid
             */

            alert(
                'Report generation endpoint is ready to be connected.'
            );

        }
    );


    /* =====================================================
       REFRESH
    ====================================================== */

    document
        .getElementById(
            'refreshDashboard'
        )
        ?.addEventListener(
            'click',
            () => {

                window.location.reload();

            }
        );


    /* =====================================================
       ESCAPE HTML
    ====================================================== */

    function escapeHtml(value) {

        return String(value ?? '')
            .replace(
                /[&<>"']/g,
                character => {

                    const entities = {

                        '&': '&amp;',
                        '<': '&lt;',
                        '>': '&gt;',
                        '"': '&quot;',
                        "'": '&#039;'

                    };

                    return entities[character];

                }
            );

    }


    /* =====================================================
       INITIALIZATION
    ====================================================== */

    drawProgressChart({

        term1: 0,
        term2: 0,
        term3: 0,
        final: 0

    });

})();