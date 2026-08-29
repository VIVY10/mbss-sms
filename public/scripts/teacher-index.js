(() => {

    'use strict';


    /* ========================================================
       ELEMENTS
    ======================================================== */

    const searchInput =
        document.getElementById('teacherSearch');

    const departmentFilter =
        document.getElementById('departmentFilter');

    const roleFilter =
        document.getElementById('roleFilter');

    const statusFilter =
        document.getElementById('statusFilter');

    const resetButton =
        document.getElementById('resetFilters');

    const rows =
        [...document.querySelectorAll('.teacher-row')];

    const resultsCount =
        document.getElementById('resultsCount');

    const menuButton =
        document.getElementById('menuBtn');

    const sidebar =
        document.getElementById('sidebar');


    /* ========================================================
       SIDEBAR
    ======================================================== */

    menuButton?.addEventListener('click', () => {

        sidebar?.classList.toggle('open');

    });


    /* ========================================================
       FILTER TEACHERS
    ======================================================== */

    function filterTeachers() {

        const search =
            searchInput.value
                .trim()
                .toLowerCase();

        const department =
            departmentFilter.value;

        const role =
            roleFilter.value
                .toLowerCase();

        const status =
            statusFilter.value
                .toLowerCase();


        let visible = 0;


        rows.forEach(row => {

            const name =
                row.dataset.name || '';

            const id =
                row.dataset.id || '';

            const email =
                row.dataset.email || '';

            const rowRole =
                row.dataset.role || '';

            const rowStatus =
                row.dataset.status || '';

            const rowDepartment =
                row.dataset.department || '';


            const matchesSearch =
                !search ||
                name.includes(search) ||
                id.includes(search) ||
                email.includes(search);


            const matchesDepartment =
                !department ||
                rowDepartment === department;


            const matchesRole =
                !role ||
                rowRole === role;


            const matchesStatus =
                !status ||
                rowStatus === status;


            const show =
                matchesSearch &&
                matchesDepartment &&
                matchesRole &&
                matchesStatus;


            row.style.display =
                show ? '' : 'none';


            if (show) {
                visible++;
            }

        });


        resultsCount.innerHTML =
            `Showing <strong>${visible}</strong> teacher${visible === 1 ? '' : 's'}`;

    }


    /* ========================================================
       EVENTS
    ======================================================== */

    searchInput?.addEventListener(
        'input',
        filterTeachers
    );

    departmentFilter?.addEventListener(
        'change',
        filterTeachers
    );

    roleFilter?.addEventListener(
        'change',
        filterTeachers
    );

    statusFilter?.addEventListener(
        'change',
        filterTeachers
    );


    resetButton?.addEventListener(
        'click',
        () => {

            searchInput.value = '';

            departmentFilter.value = '';

            roleFilter.value = '';

            statusFilter.value = '';

            filterTeachers();

        }
    );


})();