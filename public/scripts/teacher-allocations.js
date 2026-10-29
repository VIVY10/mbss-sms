(() => {
    'use strict';

    const allocationSearch =
        document.getElementById('allocationSearch');

    const rows =
        document.querySelectorAll(
            '#allocationTable tbody tr'
        );

    allocationSearch?.addEventListener(
        'input',
        () => {
            const query =
                allocationSearch.value
                    .toLowerCase()
                    .trim();

            rows.forEach(row => {
                const matches =
                    row.textContent
                        .toLowerCase()
                        .includes(query);

                row.classList.toggle(
                    'd-none',
                    !matches
                );
            });
        }
    );
})();