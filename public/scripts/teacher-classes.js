(() => {
    'use strict';

    const classSearch =
        document.getElementById('classSearch');

    const classLevelFilter =
        document.getElementById('classLevelFilter');

    const classItems =
        [...document.querySelectorAll('.class-item')];

    function filterClasses() {
        const search =
            classSearch?.value
                ?.toLowerCase()
                ?.trim() || '';

        const level =
            classLevelFilter?.value
                ?.toLowerCase()
                ?.trim() || '';

        classItems.forEach(item => {
            const text =
                item.textContent
                    .toLowerCase();

            const matchesSearch =
                !search ||
                text.includes(search);

            const matchesLevel =
                !level ||
                text.includes(level);

            item.classList.toggle(
                'd-none',
                !(matchesSearch && matchesLevel)
            );
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
})();