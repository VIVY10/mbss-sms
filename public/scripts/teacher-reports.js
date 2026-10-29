(() => {
    'use strict';

    const forms =
        document.querySelectorAll(
            '.report-form'
        );

    forms.forEach(form => {
        const scopeSelect =
            form.querySelector(
                'select[name="scope"]'
            );

        scopeSelect?.addEventListener(
            'change',
            () => {
                const pupilField =
                    form.querySelector(
                        '.individual-pupil-field'
                    );

                pupilField?.classList.toggle(
                    'd-none',
                    scopeSelect.value !==
                    'individual'
                );
            }
        );

        form.addEventListener(
            'submit',
            event => {
                event.preventDefault();

                showPreview(form);
            }
        );
    });


    function showPreview(form) {
        const modalElement =
            document.getElementById(
                'reportPreviewModal'
            );

        if (
            !modalElement ||
            typeof bootstrap === 'undefined'
        ) {
            return;
        }

        const reportType =
            form.dataset.reportType;

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

        setText(
            'previewClass',
            selectedText(classSelect)
        );

        setText(
            'previewTerm',
            selectedText(termSelect) ||
            (
                reportType === 'annual'
                    ? 'Full Academic Year'
                    : '-'
            )
        );

        setText(
            'previewYear',
            selectedText(yearSelect)
        );

        bootstrap.Modal
            .getOrCreateInstance(
                modalElement
            )
            .show();
    }


    function selectedText(select) {
        return select
            ?.selectedOptions[0]
            ?.textContent
            ?.trim() || '-';
    }


    function setText(id, value) {
        const element =
            document.getElementById(id);

        if (element) {
            element.textContent =
                value || '-';
        }
    }


    const generateButton =
        document.getElementById(
            'generateReportBtn'
        );

    generateButton?.addEventListener(
        'click',
        async () => {
            /*
             * Connect your actual PDF endpoint here.
             *
             * Do not keep the setTimeout simulation
             * in production.
             */
        }
    );
})();