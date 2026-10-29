(() => {
    'use strict';

    const pupilSearch =
        document.getElementById('pupilSearch');

    const searchBtn =
        document.getElementById('resultSearchBtn');

    const clearBtn =
        document.getElementById('resultClearBtn');

    const classFilter =
        document.getElementById('resultClassFilter');

    const subjectFilter =
        document.getElementById('resultSubjectFilter');

    const termFilter =
        document.getElementById('resultTermFilter');

    const examFilter =
        document.getElementById('resultExamFilter');

    const resultsContainer =
        document.getElementById('resultsContainer');

    const resultsLoading =
        document.getElementById('resultsLoading');

    const resultCount =
        document.getElementById('resultCount');

    const resultSubtitle =
        document.getElementById('resultSubtitle');

    const resultActions =
        document.getElementById('resultActions');

    const exportBtn =
        document.getElementById('exportResultsBtn');


    searchBtn?.addEventListener(
        'click',
        searchResults
    );

    clearBtn?.addEventListener(
        'click',
        clearSearch
    );

    pupilSearch?.addEventListener(
        'keydown',
        event => {
            if (event.key === 'Enter') {
                event.preventDefault();
                searchResults();
            }
        }
    );

    exportBtn?.addEventListener(
        'click',
        exportResults
    );


    async function searchResults() {
        const query =
            pupilSearch?.value?.trim() || '';

        const classId =
            classFilter?.value || '';

        const subjectCode =
            subjectFilter?.value || '';

        const termId =
            termFilter?.value || '';

        const examId =
            examFilter?.value || '';

        if (
            !query &&
            !classId &&
            !subjectCode &&
            !termId &&
            !examId
        ) {
            showEmpty(
                'Enter a search term or select a filter',
                'Please provide at least one search criterion.'
            );

            return;
        }

        setLoading(true);

        try {
            const params =
                new URLSearchParams();

            if (query)
                params.append('q', query);

            if (classId)
                params.append(
                    'classid',
                    classId
                );

            if (subjectCode)
                params.append(
                    'subjectcode',
                    subjectCode
                );

            if (termId)
                params.append(
                    'termid',
                    termId
                );

            if (examId)
                params.append(
                    'examid',
                    examId
                );

            const response =
                await fetch(
                    `/teacher/results/search?${params.toString()}`,
                    {
                        headers: {
                            Accept:
                                'application/json'
                        }
                    }
                );

            const result =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message ||
                    'Unable to search results.'
                );
            }

            renderResults(result);

        } catch (error) {
            console.error(
                'Search results error:',
                error
            );

            showEmpty(
                'Error searching results',
                error.message ||
                'Unable to complete the search.'
            );

        } finally {
            setLoading(false);
        }
    }


    function renderResults(results) {
        if (!resultsContainer) {
            return;
        }

        if (
            !Array.isArray(results) ||
            !results.length
        ) {
            showEmpty(
                'No results found',
                'Try adjusting your search criteria or filters.'
            );

            return;
        }

        const rows =
            results.map(
                (item, index) => {
                    const hasMark =
                        item.score !== null &&
                        item.score !== undefined;

                    const mark =
                        hasMark
                            ? Number(item.score)
                            : null;

                    const grade =
                        hasMark
                            ? calculateGrade(mark)
                            : '-';

                    const remark =
                        hasMark
                            ? calculateRemark(mark)
                            : '-';

                    const gradeClass =
                        grade !== '-'
                            ? `grade-${grade}`
                            : '';

                    const passClass =
                        hasMark
                            ? (
                                mark >= 40
                                    ? 'pass'
                                    : 'fail'
                            )
                            : '';

                    return `
                        <tr>
                            <td>
                                ${index + 1}
                            </td>

                            <td>
                                <span class="exam-number">
                                    ${escapeHtml(item.examno || '-')}
                                </span>
                            </td>

                            <td>
                                <span class="pupil-name">
                                    ${escapeHtml(item.fname || '')}
                                    ${escapeHtml(item.lname || '')}
                                </span>

                                ${
                                    item.middlename
                                        ? `
                                            <small class="text-muted d-block">
                                                ${escapeHtml(item.middlename)}
                                            </small>
                                        `
                                        : ''
                                }
                            </td>

                            <td>
                                ${escapeHtml(item.levelname || '')}
                                ${escapeHtml(item.class || '-')}
                            </td>

                            <td>
                                ${escapeHtml(item.subjectname || '-')}
                            </td>

                            <td class="mark-cell ${passClass}">
                                ${hasMark ? mark : '-'}
                            </td>

                            <td>
                                <span class="grade-cell ${gradeClass}">
                                    ${grade}
                                </span>
                            </td>

                            <td>
                                ${escapeHtml(remark)}
                            </td>

                            <td>
                                ${escapeHtml(item.termname || '-')}
                            </td>
                        </tr>
                    `;
                }
            )
            .join('');

        resultsContainer.innerHTML = `
            <div class="table-responsive">
                <table
                    class="table professional-table result-table">

                    <thead>
                        <tr>
                            <th>#</th>
                            <th>EXAM NO.</th>
                            <th>PUPIL</th>
                            <th>CLASS</th>
                            <th>SUBJECT</th>
                            <th>MARK</th>
                            <th>GRADE</th>
                            <th>REMARK</th>
                            <th>TERM</th>
                        </tr>
                    </thead>

                    <tbody>
                        ${rows}
                    </tbody>

                </table>
            </div>
        `;

        resultCount.textContent =
            `${results.length} result${results.length === 1 ? '' : 's'}`;

        resultSubtitle.textContent =
            `Showing ${results.length} result${results.length === 1 ? '' : 's'}`;

        resultActions?.classList.remove(
            'd-none'
        );
    }


    function clearSearch() {
        if (pupilSearch)
            pupilSearch.value = '';

        if (classFilter)
            classFilter.value = '';

        if (subjectFilter)
            subjectFilter.value = '';

        if (termFilter)
            termFilter.value = '';

        if (examFilter)
            examFilter.value = '';

        showEmpty(
            'Search for a pupil',
            'Enter an exam number or pupil name above, or use the filters to narrow your search.'
        );
    }


    function showEmpty(title, message) {
        if (!resultsContainer) {
            return;
        }

        resultsContainer.innerHTML = `
            <div class="empty-large">
                <i class="bi bi-search"></i>

                <h4>
                    ${escapeHtml(title)}
                </h4>

                <p>
                    ${escapeHtml(message)}
                </p>
            </div>
        `;

        if (resultCount)
            resultCount.textContent =
                '0 results';

        if (resultSubtitle)
            resultSubtitle.textContent =
                'No results to display';

        resultActions?.classList.add(
            'd-none'
        );
    }


    function setLoading(isLoading) {
        resultsLoading?.classList.toggle(
            'd-none',
            !isLoading
        );

        if (
            isLoading &&
            resultsContainer
        ) {
            resultsContainer.innerHTML = '';
        }
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


    function exportResults() {
        const rows =
            document.querySelectorAll(
                '.result-table tbody tr'
            );

        if (!rows.length) {
            window.alert(
                'No results to export.'
            );

            return;
        }

        const filenameParts =
            ['pupil_results'];

        addSelectedOption(
            filenameParts,
            subjectFilter
        );

        addSelectedOption(
            filenameParts,
            classFilter
        );

        addSelectedOption(
            filenameParts,
            termFilter
        );

        const date =
            new Date()
                .toISOString()
                .slice(0, 10);

        filenameParts.push(date);

        const filename =
            sanitizeFilename(
                `${filenameParts.join('_')}.csv`
            );

        const csvRows = [
            [
                'Exam No.',
                'Pupil',
                'Class',
                'Subject',
                'Mark',
                'Grade',
                'Remark',
                'Term'
            ]
        ];

        rows.forEach(row => {
            const cells =
                row.querySelectorAll('td');

            if (cells.length < 9) {
                return;
            }

            csvRows.push([
                cells[1].textContent.trim(),
                cells[2].textContent.trim(),
                cells[3].textContent.trim(),
                cells[4].textContent.trim(),
                cells[5].textContent.trim(),
                cells[6].textContent.trim(),
                cells[7].textContent.trim(),
                cells[8].textContent.trim()
            ]);
        });

        const csv =
            csvRows
                .map(row =>
                    row
                        .map(csvEscape)
                        .join(',')
                )
                .join('\n');

        const blob =
            new Blob(
                ['\uFEFF' + csv],
                {
                    type:
                        'text/csv;charset=utf-8;'
                }
            );

        const url =
            URL.createObjectURL(blob);

        const link =
            document.createElement('a');

        link.href = url;
        link.download = filename;

        document.body.appendChild(link);

        link.click();
        link.remove();

        URL.revokeObjectURL(url);
    }


    function addSelectedOption(
        parts,
        select
    ) {
        if (!select?.value) {
            return;
        }

        const value =
            select.selectedOptions[0]
                ?.textContent
                ?.trim();

        if (value) {
            parts.push(value);
        }
    }


    function csvEscape(value) {
        return `"${String(value ?? '')
            .replace(/"/g, '""')}"`;
    }


    function sanitizeFilename(value) {
        return value.replace(
            /[<>:"/\\|?*\x00-\x1F]/g,
            '-'
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
})();