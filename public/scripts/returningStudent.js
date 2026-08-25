document.addEventListener('DOMContentLoaded', () => {

    const searchButton =
        document.getElementById('searchStudent');

    const examnoInput =
        document.getElementById('examno');

    const resultCard =
        document.getElementById('studentResult');

    const enrollmentCard =
        document.getElementById('enrollmentCard');

    const yearLevel =
        document.getElementById('yearlevel');

    const classSelect =
        document.getElementById('classid');

    const formExamno =
        document.getElementById('formExamno');

    const clearButton =
        document.getElementById('clearStudent');


    /*
     * SEARCH STUDENT
     */

    searchButton.addEventListener(
        'click',
        async () => {

            const examno =
                examnoInput.value.trim();

            if (!examno) {

                alert(
                    'Please enter the student exam number.'
                );

                examnoInput.focus();

                return;
            }


            searchButton.disabled = true;

            searchButton.textContent =
                'Searching...';


            try {

                const response =
                    await fetch(
                        `/students/returning/search?examno=${encodeURIComponent(examno)}`,
                        {
                            headers: {
                                'Accept': 'application/json'
                            }
                        }
                    );


                const data =
                    await response.json();


                if (!data.success) {

                    alert(data.message);

                    hideStudent();

                    return;
                }


                displayStudent(data.student);

            } catch (error) {

                console.error(error);

                alert(
                    'Unable to search for the student.'
                );

            } finally {

                searchButton.disabled = false;

                searchButton.textContent =
                    'Search';
            }
        }
    );


    /*
     * DISPLAY STUDENT
     */

    function displayStudent(student) {

        const fullName =
            [
                student.fname,
                student.middlename,
                student.lname
            ]
            .filter(Boolean)
            .join(' ');


        document.getElementById(
            'studentName'
        ).textContent = fullName;


        document.getElementById(
            'studentExamno'
        ).textContent =
            `Exam No: ${student.examno}`;


        document.getElementById(
            'studentGender'
        ).textContent =
            student.gender || '-';


        document.getElementById(
            'studentDob'
        ).textContent =
            student.dob || '-';


        document.getElementById(
            'studentStatus'
        ).textContent =
            student.status || 'ACTIVE';


        formExamno.value =
            student.examno;


        resultCard.classList.remove(
            'hidden'
        );


        enrollmentCard.classList.remove(
            'hidden'
        );
    }


    /*
     * YEAR LEVEL → CLASS
     */

    yearLevel.addEventListener(
        'change',
        () => {

            const level =
                yearLevel.value;

            classSelect.value = '';

            classSelect.disabled =
                !level;


            [...classSelect.options]
                .forEach(option => {

                    if (!option.value) {
                        return;
                    }

                    option.hidden =
                        option.dataset.levelId !== level;
                });
        }
    );


    /*
     * CLEAR
     */

    clearButton.addEventListener(
        'click',
        hideStudent
    );


    function hideStudent() {

        resultCard.classList.add(
            'hidden'
        );

        enrollmentCard.classList.add(
            'hidden'
        );

        formExamno.value = '';

        examnoInput.value = '';

        yearLevel.value = '';

        classSelect.value = '';

        classSelect.disabled = true;

        examnoInput.focus();
    }

});