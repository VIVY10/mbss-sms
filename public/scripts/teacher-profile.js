document.addEventListener('DOMContentLoaded', () => {

    /*
     * Prevent allocating a class without
     * selecting a class subject.
     */

    const allocationForm =
        document.getElementById('allocationForm');

    if (!allocationForm) return;

    allocationForm.addEventListener('submit', event => {

        const classId =
            document.getElementById('allocationClass')?.value;

        const subject =
            allocationForm.querySelector(
                '[name="class_subject_id"]'
            )?.value;

        if (!classId || !subject) {

            event.preventDefault();

            alert(
                'Please select both the class and class subject.'
            );

        }

    });

});