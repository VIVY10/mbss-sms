(() => {
    'use strict';

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

    let currentSchedule = {
        classSubjectId: null,
        classId: null,
        subjectCode: null,
        examId: null
    };

    loadBtn.addEventListener('click', loadMarks);

    saveDraftBtn?.addEventListener(
        'click',
        () => saveMarks('draft')
    );

    submitMarksBtn?.addEventListener(
        'click',
        () => saveMarks('submit')
    );


    async function loadMarks() {
        const selectedClass =
            classSelect.options[
                classSelect.selectedIndex
            ];

        const classSubjectId =
            classSelect.value;

        const examId =
            examSelect.value;

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

        currentSchedule = {
            classSubjectId,
            classId: selectedClass.dataset.classid,
            subjectCode: selectedClass.dataset.subjectcode,
            examId
        };

        setLoading(true);

        try {
            const params =
                new URLSearchParams({
                    class_subject_id:
                        classSubjectId,

                    classId:
                        selectedClass.dataset.classid,

                    examid:
                        examId
                });

            const response =
                await fetch(
                    `/teacher/marks/students?${params.toString()}`,
                    {
                        method: 'GET',
                        headers: {
                            Accept: 'application/json'
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


    function renderMarksSchedule(
        selectedClass,
        result
    ) {
        /*
         * Your backend currently appears to return an array.
         * Keep that contract unless you intentionally change
         * the API to { students, status, lastSaved }.
         */

        const students =
            Array.isArray(result)
                ? result
                : result.students || [];

        if (!students.length) {
            showEmptyState();

            scheduleTitle.textContent =
                'Marks Schedule';

            scheduleSubtitle.textContent =
                'No pupils were found for this class.';

            return;
        }

        emptyState?.classList.add('d-none');
        tableContainer?.classList.remove('d-none');
        footer?.classList.remove('d-none');

        const className =
            `${selectedClass.dataset.levelname || ''}
             ${selectedClass.dataset.classname || ''}`.trim();

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
            `${students.length} pupil${students.length === 1 ? '' : 's'}`;

        tableBody.innerHTML = '';

        students.forEach((student, index) => {
            const row =
                document.createElement('tr');

            const mark =
                student.mark !== null &&
                student.mark !== undefined
                    ? student.mark
                    : '';

            const grade =
                mark === ''
                    ? '-'
                    : calculateGrade(
                        Number(mark)
                    );

            const remark =
                mark === ''
                    ? '-'
                    : calculateRemark(
                        Number(mark)
                    );

            row.innerHTML = `
                <td>${index + 1}</td>

                <td>
                    <span class="exam-number">
                        ${escapeHtml(student.examno)}
                    </span>
                </td>

                <td>
                    <div class="student-name">
                        ${escapeHtml(student.fname)}

                        ${
                            student.middlename
                                ? ` ${escapeHtml(student.middlename)}`
                                : ''
                        }

                        ${escapeHtml(student.lname)}
                    </div>
                </td>

                <td>
                    <input
                        type="number"
                        class="form-control mark-input"
                        min="0"
                        max="100"
                        step="1"
                        data-examno="${escapeHtml(student.examno)}"
                        data-studentclassid="${escapeHtml(student.studentclassid)}"
                        value="${escapeHtml(mark)}"
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

        tableBody
            .querySelectorAll('.mark-input')
            .forEach(input => {
                input.addEventListener(
                    'input',
                    () => updateMarkDisplay(input)
                );
            });

        statusBadge.textContent =
            result.status || 'Draft';

        lastSaved.textContent =
            result.lastSaved
                ? formatDate(result.lastSaved)
                : 'Not saved';
    }


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


    function calculateGrade(mark) {
        if (mark >= 75) return 'A';
        if (mark >= 65) return 'B';
        if (mark >= 55) return 'C';
        if (mark >= 40) return 'D';
        if (mark >= 0) return 'F';

        return '-';
    }


    function calculateRemark(mark) {
        if (mark >= 75) return 'Distinction';
        if (mark >= 65) return 'Merit';
        if (mark >= 55) return 'Credit';
        if (mark >= 40) return 'Pass';
        if (mark >= 0) return 'Fail';

        return '-';
    }


    async function saveMarks(mode) {
        if (!currentSchedule.classSubjectId) {
            showAlert(
                'Load a marks schedule first.',
                'warning'
            );

            return;
        }

        const markInputs = [
            ...tableBody.querySelectorAll(
                '.mark-input'
            )
        ];

        const marks = [];

        for (const input of markInputs) {
            const value =
                input.value.trim();

            if (value === '') {
                continue;
            }

            const mark =
                Number(value);

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

                /*
                 * Use the schedule subject.
                 * Your generated inputs do not currently set
                 * data-subjectcode.
                 */
                subjectcode:
                    currentSchedule.subjectCode,

                mark
            });
        }

        if (!marks.length) {
            showAlert(
                'Enter at least one mark before saving.',
                'warning'
            );

            return;
        }

        if (
            mode === 'submit' &&
            !window.confirm(
                'Submit these marks? Once submitted, editing may be restricted.'
            )
        ) {
            return;
        }

        const button =
            mode === 'draft'
                ? saveDraftBtn
                : submitMarksBtn;

        if (!button) {
            return;
        }

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

                            Accept:
                                'application/json'
                        },

                        body: JSON.stringify({
                            class_subject_id:
                                currentSchedule.classSubjectId,

                            examid:
                                currentSchedule.examId,

                            subjectCode:
                                currentSchedule.subjectCode,

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

            if (mode === 'submit') {
                disableMarkInputs();
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
            /*
             * Important:
             * Your original code always sets button.disabled = true
             * here, even after a failed draft save.
             */
            if (mode !== 'submit') {
                button.disabled = false;
            }

            button.innerHTML =
                originalText;
        }
    }


    function disableMarkInputs() {
        tableBody
            .querySelectorAll('.mark-input')
            .forEach(input => {
                input.disabled = true;
            });

        if (saveDraftBtn) {
            saveDraftBtn.disabled = true;
        }

        if (submitMarksBtn) {
            submitMarksBtn.disabled = true;
        }
    }


    function setLoading(isLoading) {
        if (isLoading) {
            loading?.classList.remove('d-none');
            emptyState?.classList.add('d-none');
            tableContainer?.classList.add('d-none');
            footer?.classList.add('d-none');

            loadBtn.disabled = true;

            loadBtn.innerHTML = `
                <span
                    class="spinner-border spinner-border-sm me-1">
                </span>
                Loading...
            `;

            return;
        }

        loading?.classList.add('d-none');

        loadBtn.disabled = false;

        loadBtn.innerHTML = `
            <i class="bi bi-arrow-repeat me-1"></i>
            Load Marks
        `;
    }


    function showEmptyState() {
        emptyState?.classList.remove('d-none');
        tableContainer?.classList.add('d-none');
        footer?.classList.add('d-none');

        tableBody.innerHTML = '';

        studentCount.textContent =
            '0 pupils';
    }


    function showAlert(
        message,
        type = 'info'
    ) {
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

            document.body.appendChild(
                container
            );
        }

        const alert =
            document.createElement('div');

        alert.className =
            `alert alert-${type} alert-dismissible fade show shadow`;

        alert.setAttribute(
            'role',
            'alert'
        );

        alert.innerHTML = `
            ${escapeHtml(message)}

            <button
                type="button"
                class="btn-close"
                data-bs-dismiss="alert"
                aria-label="Close">
            </button>
        `;

        container.appendChild(alert);

        window.setTimeout(
            () => alert.remove(),
            4000
        );
    }


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


    function formatDate(value) {
        if (!value) {
            return 'Not saved';
        }

        const date =
            new Date(value);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return String(value);
        }

        return date.toLocaleString(
            'en-GB'
        );
    }
})();