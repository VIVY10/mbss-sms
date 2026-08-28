(() => {

    'use strict';


    const tableBody =
        document.getElementById('studentsTableBody');

    if (!tableBody) return;


    const searchInput =
        document.getElementById('studentSearch');

    const yearSelect =
        document.getElementById('academicYear');

    const termSelect =
        document.getElementById('termSelect');

    const classSelect =
        document.getElementById('classFilter');

    const statusSelect =
        document.getElementById('statusFilter');

    const resetButton =
        document.getElementById('resetFilters');

    const resultCount =
        document.getElementById('resultCount');

    const filterToggle =
        document.getElementById('filterToggle');

    const filterPanel =
        document.getElementById('filterPanel');

    const menuBtn =
        document.getElementById('menuBtn');

    const sidebar =
        document.getElementById('sidebar');


    const rows = [
        ...tableBody.querySelectorAll(
            '[data-student-row]'
        )
    ];


    function filterStudents() {

        const search =
            searchInput?.value
                .trim()
                .toLowerCase() || '';


        const classId =
            classSelect?.value || '';


        const status =
            statusSelect?.value || '';


        let visible = 0;


        rows.forEach(row => {

            const name =
                row.dataset.name || '';


            const examno =
                row.dataset.examno || '';


            const rowClass =
                row.dataset.classid || '';


            const rowStatus =
                row.dataset.status || '';


            const matchesSearch =
                !search ||
                name.includes(search) ||
                examno.toLowerCase().includes(search);


            const matchesClass =
                !classId ||
                rowClass === classId;


            const matchesStatus =
                !status ||
                rowStatus === status;


            const show =
                matchesSearch &&
                matchesClass &&
                matchesStatus;


            row.style.display =
                show ? '' : 'none';


            if (show) {
                visible++;
            }

        });


        updateResultCount(visible);

        updateEmptyState(visible);

    }


    function updateResultCount(count) {

        if (!resultCount) return;


        if (count === 0) {

            resultCount.textContent =
                'No students found';

            return;
        }


        resultCount.textContent =
            `Showing ${count} student${count === 1 ? '' : 's'}`;

    }


    function updateEmptyState(count) {

        let empty =
            document.getElementById(
                'filteredEmpty'
            );


        if (count > 0) {

            if (empty) {
                empty.remove();
            }

            return;
        }


        if (empty) return;


        empty =
            document.createElement('tr');


        empty.id =
            'filteredEmpty';


        empty.innerHTML = `
            <td colspan="7" class="empty-state">

                <div>

                    <i class="bi bi-search"></i>

                    <h3>No students found</h3>

                    <p>
                        Try changing your search or filters.
                    </p>

                </div>

            </td>
        `;


        tableBody.appendChild(empty);

    }


    function resetFilters() {

        if (searchInput) {
            searchInput.value = '';
        }


        if (classSelect) {
            classSelect.value = '';
        }


        if (statusSelect) {
            statusSelect.value = 'active';
        }


        filterStudents();

    }


    searchInput?.addEventListener(
        'input',
        filterStudents
    );


    classSelect?.addEventListener(
        'change',
        filterStudents
    );


    statusSelect?.addEventListener(
        'change',
        filterStudents
    );


    /*
     * Academic year and term determine
     * which studentclass record the backend
     * should retrieve.
     *
     * They are therefore submitted to the
     * server rather than filtered only in JS.
     */

    function changeAcademicPeriod() {

        const year =
            yearSelect?.value || '';


        const term =
            termSelect?.value || '';


        if (!year || !term) {
            return;
        }


        const url =
            new URL(
                window.location.href
            );


        url.searchParams.set(
            'yearid',
            year
        );


        url.searchParams.set(
            'termid',
            term
        );


        window.location.href =
            url.toString();

    }


    yearSelect?.addEventListener(
        'change',
        changeAcademicPeriod
    );


    termSelect?.addEventListener(
        'change',
        changeAcademicPeriod
    );


    resetButton?.addEventListener(
        'click',
        resetFilters
    );


    filterToggle?.addEventListener(
        'click',
        () => {

            filterPanel?.classList.toggle(
                'd-none'
            );

        }
    );


    menuBtn?.addEventListener(
        'click',
        () => {

            sidebar?.classList.toggle(
                'open'
            );

        }
    );


    /*
     * Initial filtering.
     */

    filterStudents();

})();