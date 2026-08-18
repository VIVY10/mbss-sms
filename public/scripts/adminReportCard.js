document.addEventListener('DOMContentLoaded', function () {
    const students = document.querySelectorAll('.report-card');

    students.forEach((student, i) => {
        generateReportCard(student, i);
    });

    function generateReportCard(student, index) {
        const marksCells = student.querySelectorAll('.marks');
        let totalMarks = 0;

        const numberOfSubjects = marksCells.length;
        const maxMarksPerSubject = 100;
        const maxMarks = maxMarksPerSubject * numberOfSubjects;

        // marksCells.forEach(cell => {
        //     const marks = parseInt(cell.textContent);
        //     if(marks === "Absent"){
        //         totalMarks += 0;
        //     }else{
        //         totalMarks += marks;
        //     }            
        //     updateComment(cell, marks);
        // });
        marksCells.forEach(cell => {
            const marksText = cell.textContent.trim();
            let marks = 0;
    
            if (marksText !== "Absent") {
                marks = parseInt(marksText, 10);
            } 
            totalMarks += marks;
            
            updateComment(cell, marksText);
        });

        const percentage = ((totalMarks / maxMarks) * 100).toFixed(2);
        const grade = getGrade(percentage);

        student.querySelector('.alltot').textContent = totalMarks;
        student.querySelector('.numinwords').textContent = maxMarks;
        student.querySelector('.percentage-tot').textContent = `${percentage}%`;
        student.querySelector('#grade').textContent = grade;

        student.querySelector('.num-subjects').textContent = numberOfSubjects;

        const dateobj = new Date();
        const date = dateobj.getDate() + "/" + (1 + dateobj.getMonth()) + "/" + dateobj.getFullYear();
        student.querySelector('#current-date').textContent = date;
    }

    function updateComment(cell, marks) {
        const commentCell = cell.closest('tr').querySelector('.comment');
        if (marks >= 75) {
            commentCell.textContent = 'Excellent';
            commentCell.style.color = 'green';
        } else if (marks >= 50) {
            commentCell.textContent = 'Good';
            commentCell.style.color = 'orange';
        } else {
            commentCell.textContent = 'Needs Improvement';
            commentCell.style.color = 'red';
        }
    }

    function getGrade(percentage) {
        if (percentage >= 90) return 'A+';
        if (percentage >= 75) return 'A';
        if (percentage >= 60) return 'B';
        if (percentage >= 45) return 'C';
        return 'D';
    }

    // Download all report cards as individual PDFs
    function downloadAllReportCards() {
        const downloadPromises = [];
        students.forEach((student, index) => {
            const opt = {
                margin: 0,  // Set the margins to 0 inches
                filename: `Report_Card_${index + 1}.pdf`,
                image: {
                    type: 'jpeg',  // Set the image type to JPEG
                    quality: 0.98  // Set the image quality to 98%
                },
                html2canvas: {
                    scale: 2,  // Increase the resolution by scaling the canvas
                    windowWidth: 1024  // Simulate a browser window width for responsive layouts
                },
                jsPDF: {
                    unit: 'in',  // Use inches as the unit of measurement
                    format: 'letter',  // Use letter-sized paper (8.5 x 11 inches)
                    orientation: 'portrait'  // Set the PDF orientation to portrait mode
                } 
            };
            downloadPromises.push(html2pdf().from(student).set(opt).save());
        });
        // Wait for all downloads to finish
        Promise.all(downloadPromises).then(() => {
            alert('All Report cards have been downloaded!');
        });
    }

    // Download all report cards as a single PDF
    // function downloadAllReportCardsAsSinglePDF() {
    //     const opt = {
    //         margin: 1,
    //         filename: 'All_Report_Cards.pdf',
    //         image: { type: 'jpeg', quality: 0.98 },
    //         html2canvas: { scale: 2 },
    //         jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    //     };

    //     let pdf = html2pdf().set(opt);

    //     students.forEach((student, index) => {
    //         if (index === 0) {
    //             pdf = pdf.from(student);
    //         } else {
    //             pdf = pdf.from(student).toContainer().toCanvas().toImg().toPdf();
    //         }
    //     });

    //     pdf.save().then(() => {
    //         alert('Report card saved');
    //     });
    // }

    // Attach the functions to the buttons
    document.querySelector('.download-btn button:nth-child(1)').addEventListener('click', downloadAllReportCards);
    // document.querySelector('.download-btn button:nth-child(2)').addEventListener('click', downloadAllReportCardsAsSinglePDF);
});
