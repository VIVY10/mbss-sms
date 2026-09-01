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
                 * backend:
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





    /*
    |--------------------------------------------------------------------------
    | ELEMENTS
    |--------------------------------------------------------------------------
    */

    const classSelect =
        document.getElementById('marksClass');

    const examSelect =
        document.getElementById('marksExamType');

    const loadBtn =
        document.getElementById('loadMarksBtn');

    const tableContainer =
        document.getElementById('marksTableContainer');

    const tableBody =
        document.getElementById('marksTableBody');

    const emptyState =
        document.getElementById('marksEmptyState');

    const loading =
        document.getElementById('marksLoading');

    const footer =
        document.getElementById('marksFooter');

    const studentCount =
        document.getElementById('marksStudentCount');

    const scheduleTitle =
        document.getElementById('marksScheduleTitle');

    const scheduleSubtitle =
        document.getElementById('marksScheduleSubtitle');

    const statusBadge =
        document.getElementById('marksStatus');

    const lastSaved =
        document.getElementById('lastSaved');

    const saveDraftBtn =
        document.getElementById('saveDraftBtn');

    const submitMarksBtn =
        document.getElementById('submitMarksBtn');


    if (!classSelect || !examSelect || !loadBtn) {
        return;
    }



    /*
    |--------------------------------------------------------------------------
    | CURRENT STATE
    |--------------------------------------------------------------------------
    */

    let currentSchedule = {
        classSubjectId: null,
        classId: null,
        subjectCode: null,
        examId: null
    };



    /*
    |--------------------------------------------------------------------------
    | LOAD MARKS
    |--------------------------------------------------------------------------
    */

    loadBtn.addEventListener('click', loadMarks);


    async function loadMarks() {

        const selectedClass =
            classSelect.options[
                classSelect.selectedIndex
            ];

        const classSubjectId =
            classSelect.value;

        const examId =
            examSelect.value;


        /*
        |--------------------------------------------------------------------------
        | VALIDATION
        |--------------------------------------------------------------------------
        */

        if (!classSubjectId) {

            showAlert(
                'Please select a class and subject.',
                'warning'
            );

            classSelect.focus();

            return;
        }


        if (!examId) {

            showAlert(
                'Please select an assessment.',
                'warning'
            );

            examSelect.focus();

            return;
        }


        /*
        |--------------------------------------------------------------------------
        | STORE CURRENT SELECTION
        |--------------------------------------------------------------------------
        */

        currentSchedule = {

            classSubjectId,

            classId:
                selectedClass.dataset.classid,

            subjectCode:
                selectedClass.dataset.subjectcode,

            examId
        };


        setLoading(true);


        try {

            const params = new URLSearchParams({

                class_subject_id:
                    classSubjectId,

                examid:
                    examId
            });


            const response = await fetch(
                `/teacher/marks/students?${params.toString()}`,
                {
                    method: 'GET',

                    headers: {
                        'Accept': 'application/json'
                    }
                }
            );


            const result =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    result.message ||
                    'Unable to load students.'
                );
            }


            renderMarksSchedule(
                selectedClass,
                examId,
                result
            );


        } catch (error) {

            console.error(
                'Load marks error:',
                error
            );


            showAlert(
                error.message ||
                'Unable to load marks.',
                'danger'
            );


            showEmptyState();

        } finally {

            setLoading(false);

        }
    }



    /*
    |--------------------------------------------------------------------------
    | RENDER STUDENTS
    |--------------------------------------------------------------------------
    */

    function renderMarksSchedule(
        selectedClass,
        examId,
        result
    ) {


        if (!result.length) {

            showEmptyState();

            scheduleTitle.textContent =
                'Marks Schedule';

            scheduleSubtitle.textContent =
                'No pupils were found for this class.';

            return;
        }


        emptyState.classList.add('d-none');

        tableContainer.classList.remove('d-none');

        footer.classList.remove('d-none');


        /*
        |--------------------------------------------------------------------------
        | HEADER
        |--------------------------------------------------------------------------
        */

        const className =
            `${selectedClass.dataset.levelname}
             ${selectedClass.dataset.classname}`.trim();

        const subjectName =
            selectedClass.dataset.subjectname ||
            'Subject';


        scheduleTitle.textContent =
            `${className} — ${subjectName}`;


        scheduleSubtitle.textContent =
            `${examSelect.options[
                examSelect.selectedIndex
            ].text} • Enter marks from 0 to 100`;


        studentCount.textContent =
            `${result.length} pupil${result.length === 1 ? '' : 's'}`;


        /*
        |--------------------------------------------------------------------------
        | TABLE
        |--------------------------------------------------------------------------
        */

        tableBody.innerHTML = '';


        result.forEach((result, index) => {

            const row =
                document.createElement('tr');


            const mark =
                result.mark !== null &&
                result.mark !== undefined
                    ? result.mark
                    : '';


            const grade =
                mark === ''
                    ? '-'
                    : calculateGrade(Number(mark));


            const remark =
                mark === ''
                    ? '-'
                    : calculateRemark(Number(mark));


            row.innerHTML = `

                <td>
                    ${index + 1}
                </td>


                <td>
                    <span class="exam-number">
                        ${escapeHtml(result.examno)}
                    </span>
                </td>


                <td>

                    <div class="student-name">

                        ${escapeHtml(result.fname)}

                        ${
                            result.middlename
                                ? ` ${escapeHtml(result.middlename)}`
                                : ''
                        }

                        ${escapeHtml(result.lname)}

                    </div>

                </td>


                <td>

                    <input
                        type="number"
                        class="form-control mark-input"
                        min="0"
                        max="100"
                        step="0.01"
                        inputmode="decimal"
                        data-examno="${escapeHtml(result.examno)}"
                        data-studentclassid="${result.studentclassid}"
                        value="${mark}"
                        placeholder="0 - 100"
                    >

                </td>


                <td>

                    <span class="grade-display">
                        ${grade}
                    </span>

                </td>


                <td>

                    <span class="remark-display">
                        ${escapeHtml(remark)}
                    </span>

                </td>

            `;


            tableBody.appendChild(row);

        });


        /*
        |--------------------------------------------------------------------------
        | MARK INPUT EVENTS
        |--------------------------------------------------------------------------
        */

        tableBody
            .querySelectorAll('.mark-input')
            .forEach(input => {

                input.addEventListener(
                    'input',
                    () => {

                        updateMarkDisplay(input);

                    }
                );

            });


        /*
        |--------------------------------------------------------------------------
        | STATUS
        |--------------------------------------------------------------------------
        */

        statusBadge.textContent =
            result.status || 'Draft';


        lastSaved.textContent =
            result.lastSaved
                ? formatDate(result.lastSaved)
                : 'Not saved';

    }



    /*
    |--------------------------------------------------------------------------
    | UPDATE GRADE / REMARK
    |--------------------------------------------------------------------------
    */

    function updateMarkDisplay(input) {

        const row =
            input.closest('tr');

        const gradeDisplay =
            row.querySelector('.grade-display');

        const remarkDisplay =
            row.querySelector('.remark-display');


        const value =
            input.value.trim();


        if (value === '') {

            gradeDisplay.textContent = '-';

            remarkDisplay.textContent = '-';

            input.classList.remove(
                'is-invalid'
            );

            return;
        }


        const mark =
            Number(value);


        if (
            Number.isNaN(mark) ||
            mark < 0 ||
            mark > 100
        ) {

            input.classList.add(
                'is-invalid'
            );

            gradeDisplay.textContent = '-';

            remarkDisplay.textContent =
                'Invalid mark';

            return;
        }


        input.classList.remove(
            'is-invalid'
        );


        gradeDisplay.textContent =
            calculateGrade(mark);


        remarkDisplay.textContent =
            calculateRemark(mark);

    }



    /*
    |--------------------------------------------------------------------------
    | GRADE CALCULATION
    |--------------------------------------------------------------------------
    |
    | IMPORTANT:
    | Replace these ranges with the school's official grading scale.
    |
    */

    function calculateGrade(mark) {

        if (mark >= 75) return 'A';

        if (mark >= 65) return 'B';

        if (mark >= 55) return 'C';

        if (mark >= 40) return 'D';

        if (mark >= 0) return 'F';

        return '-';
    }



    /*
    |--------------------------------------------------------------------------
    | REMARK
    |--------------------------------------------------------------------------
    */

    function calculateRemark(mark) {

        if (mark >= 75) {
            return 'Distinction';
        }

        if (mark >= 65) {
            return 'Merit';
        }

        if (mark >= 55) {
            return 'Credit';
        }

        if (mark >= 45) {
            return 'Pass';
        }

        return 'Fail';
    }



    /*
    |--------------------------------------------------------------------------
    | SAVE DRAFT
    |--------------------------------------------------------------------------
    */

    saveDraftBtn?.addEventListener(
        'click',
        () => saveMarks('draft')
    );



    /*
    |--------------------------------------------------------------------------
    | SUBMIT MARKS
    |--------------------------------------------------------------------------
    */

    submitMarksBtn?.addEventListener(
        'click',
        () => saveMarks('submit')
    );



    /*
    |--------------------------------------------------------------------------
    | SAVE MARKS
    |--------------------------------------------------------------------------
    */

    async function saveMarks(mode) {

        if (!currentSchedule.classSubjectId) {

            showAlert(
                'Load a marks schedule first.',
                'warning'
            );

            return;
        }


        const markInputs =
            [
                ...tableBody.querySelectorAll(
                    '.mark-input'
                )
            ];


        const marks = [];


        for (const input of markInputs) {

            const value =
                input.value.trim();


            /*
            |--------------------------------------------------------------------------
            | EMPTY MARK
            |--------------------------------------------------------------------------
            */

            if (value === '') {
                continue;
            }


            const mark =
                Number(value);


            /*
            |--------------------------------------------------------------------------
            | VALIDATE MARK
            |--------------------------------------------------------------------------
            */

            if (
                Number.isNaN(mark) ||
                mark < 0 ||
                mark > 100
            ) {

                input.focus();

                showAlert(
                    'All marks must be between 0 and 100.',
                    'danger'
                );

                return;
            }


            marks.push({

                studentclassid:
                    input.dataset.studentclassid,

                subjectcode:
                    input.dataset.subjectcode,

                mark

            });

        }


        /*
        |--------------------------------------------------------------------------
        | REQUIRE MARKS
        |--------------------------------------------------------------------------
        */

        if (!marks.length) {

            showAlert(
                'Enter at least one mark before saving.',
                'warning'
            );

            return;
        }


        /*
        |--------------------------------------------------------------------------
        | CONFIRM SUBMISSION
        |--------------------------------------------------------------------------
        */

        if (mode === 'submit') {

            const confirmed =
                window.confirm(
                    'Submit these marks? Once submitted, editing may be restricted.'
                );


            if (!confirmed) {
                return;
            }

        }


        const button =
            mode === 'draft'
                ? saveDraftBtn
                : submitMarksBtn;


        const originalText =
            button.innerHTML;


        button.disabled = true;


        button.innerHTML = `

            <span
                class="spinner-border spinner-border-sm me-1">
            </span>

            ${
                mode === 'draft'
                    ? 'Saving...'
                    : 'Submitting...'
            }

        `;


        try {

            const response =
                await fetch(
                    mode === 'draft'
                        ? '/teacher/marks/draft'
                        : '/teacher/marks/submit',
                    {

                        method: 'POST',

                        headers: {

                            'Content-Type':
                                'application/json',

                            'Accept':
                                'application/json'

                        },

                        body: JSON.stringify({

                            class_subject_id:
                                currentSchedule.classSubjectId,

                            examid:
                                currentSchedule.examId,
                            
                            subjectCode: currentSchedule.subjectCode,

                            marks

                        })

                    }
                );


            const result =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    result.message ||
                    'Unable to save marks.'
                );

            }


            showAlert(
                result.message ||
                (
                    mode === 'draft'
                        ? 'Marks saved as draft.'
                        : 'Marks successfully submitted.'
                ),
                'success'
            );


            statusBadge.textContent =
                mode === 'draft'
                    ? 'Draft'
                    : 'Submitted';


            statusBadge.classList.remove(
                'warning',
                'success'
            );


            statusBadge.classList.add(
                mode === 'draft'
                    ? 'warning'
                    : 'success'
            );


            lastSaved.textContent =
                result.savedAt
                    ? formatDate(result.savedAt)
                    : 'Just now';


            /*
            |--------------------------------------------------------------------------
            | DISABLE EDITING AFTER SUBMISSION
            |--------------------------------------------------------------------------
            */

            if (mode === 'submit') {

                markInputsDisabled();

            }


        } catch (error) {

            console.error(
                'Save marks error:',
                error
            );


            showAlert(
                error.message ||
                'Unable to save marks.',
                'danger'
            );


        } finally {
            // disable submit button
            button.disabled = true;

            button.innerHTML =
                originalText;

        }

    }



    /*
    |--------------------------------------------------------------------------
    | DISABLE MARK INPUTS
    |--------------------------------------------------------------------------
    */

    function markInputsDisabled() {

        tableBody
            .querySelectorAll('.mark-input')
            .forEach(input => {

                input.disabled = true;

            });


        saveDraftBtn.disabled = true;

        submitMarksBtn.disabled = true;

    }



    /*
    |--------------------------------------------------------------------------
    | LOADING STATE
    |--------------------------------------------------------------------------
    */

    function setLoading(isLoading) {

        if (isLoading) {

            loading.classList.remove(
                'd-none'
            );

            emptyState.classList.add(
                'd-none'
            );

            tableContainer.classList.add(
                'd-none'
            );

            footer.classList.add(
                'd-none'
            );

            loadBtn.disabled = true;

            loadBtn.innerHTML = `

                <span
                    class="spinner-border spinner-border-sm me-1">
                </span>

                Loading...

            `;

        } else {

            loading.classList.add(
                'd-none'
            );

            loadBtn.disabled = false;

            loadBtn.innerHTML = `

                <i class="bi bi-arrow-repeat me-1"></i>

                Load Marks

            `;

        }

    }



    /*
    |--------------------------------------------------------------------------
    | EMPTY STATE
    |--------------------------------------------------------------------------
    */

    function showEmptyState() {

        emptyState.classList.remove(
            'd-none'
        );

        tableContainer.classList.add(
            'd-none'
        );

        footer.classList.add(
            'd-none'
        );

        tableBody.innerHTML = '';

        studentCount.textContent =
            '0 pupils';

    }



    /*
    |--------------------------------------------------------------------------
    | ALERT
    |--------------------------------------------------------------------------
    */

    function showAlert(message, type = 'info') {

        let container =
            document.getElementById(
                'marksAlertContainer'
            );


        if (!container) {

            container =
                document.createElement('div');

            container.id =
                'marksAlertContainer';

            container.className =
                'position-fixed top-0 end-0 p-3';

            container.style.zIndex =
                '1080';

            document.body.appendChild(
                container
            );

        }


        const alert =
            document.createElement('div');

        alert.className =
            `alert alert-${type} alert-dismissible fade show shadow`;


        alert.innerHTML = `

            ${escapeHtml(message)}

            <button
                type="button"
                class="btn-close"
                data-bs-dismiss="alert">
            </button>

        `;


        container.appendChild(alert);


        setTimeout(() => {

            alert.remove();

        }, 5000);

    }



    /*
    |--------------------------------------------------------------------------
    | ESCAPE HTML
    |--------------------------------------------------------------------------
    */

    function escapeHtml(value) {

        return String(value ?? '')
            .replace(
                /[&<>"']/g,
                character => ({

                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;',
                    "'": '&#039;'

                })[character]
            );

    }



    /*
    |--------------------------------------------------------------------------
    | FORMAT DATE
    |--------------------------------------------------------------------------
    */

    function formatDate(value) {

        if (!value) {
            return 'Not saved';
        }


        const date =
            new Date(value);


        if (Number.isNaN(
            date.getTime()
        )) {

            return String(value);

        }


        return date.toLocaleString();

    }













})();