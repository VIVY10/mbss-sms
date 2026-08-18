document.addEventListener('DOMContentLoaded', function () {
    const marksCells = document.querySelectorAll('.marks');
    let totalMarks = 0;

    // Dynamically calculate maxMarks based on the number of subjects (rows)
    const numberOfSubjects = marksCells.length;
    const maxMarksPerSubject = 100; // Assuming each subject has 100 marks
    const maxMarks = maxMarksPerSubject * numberOfSubjects;


    marksCells.forEach(cell => {
        const marksText = cell.textContent.trim();
        let marks = 0;

        if (marksText !== "Absent") {
            marks = parseInt(marksText, 10);
        } 
        totalMarks += marks;
        
        updateComment(cell, marksText);
    });

    // Calculate percentage and determine grade
    const percentage = ((totalMarks / maxMarks) * 100).toFixed(2);
    const grade = getGrade(percentage);
    const student_status = setStatus(grade)

    

    // Update the DOM with calculated values
    document.querySelector('.alltot').textContent = totalMarks;
    document.querySelector('.numinwords').textContent = maxMarks;
    document.querySelector('.percentage-tot').textContent = `${percentage}%`;
    document.getElementById('grade').textContent = grade;
    document.getElementById('status').textContent = student_status;

    // Dynamically update the number of subjects offered
    document.querySelector('.num-subjects').textContent = numberOfSubjects;

    // Set the current date in the footer
    const dateobj = new Date();
    var date = dateobj.getDate()+"/"+(1+dateobj.getMonth())+"/"+dateobj.getFullYear();
    document.getElementById('current-date').textContent = date;
    // new Date().toLocaleDateString();

    // Function to update comments based on marks
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

    // Function to determine grade based on percentage
    function getGrade(percentage) {
        if (percentage >= 85) return 'A+';
        if (percentage >= 75) return 'A';
        if (percentage >= 60) return 'B+';
        if (percentage >= 50) return 'B';
        if (percentage >= 45) return 'C+';
        if (percentage >= 40) return 'C';
        return 'D';
    }

    function setStatus(grade) { // Take grade as a parameter
        return grade === 'D' ? 'FAIL' : 'PASS';
    }
});


$("#downloadPDF").click(function () { 
    // Select the HTML element that you want to convert to a PDF
    const element = document.getElementById("report-card");

    // Define the options for the PDF generation
    const options = {
        margin: 0,  // Set the margins to 0 inches
        filename: 'report_card.pdf',  // Specify the name of the output PDF file
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

    // Generate the PDF using the specified options and save it
    html2pdf().set(options).from(element).save();
});




