  // Update display based on selected class and subject
document.getElementById('subjectcode').addEventListener('change', function () {
  const selectedOption = this.options[this.selectedIndex];
  const classid = selectedOption.getAttribute('data-classid');
  const grade = selectedOption.getAttribute('data-grade');
  const section = selectedOption.getAttribute('data-section');
  const subjectname = selectedOption.getAttribute('data-subjectname');

  document.getElementById('classid').value = classid;
  document.getElementById('selectedClassDisplay').textContent = `${subjectname} - ${grade}${section}`;
});

var data = []; // Global variable for form data
$(document).ready(function () {
  // Initialize DataTable with empty data
  var table = $('#studentSubjectTable').DataTable({
    data: [], // Start with an empty dataset
    columns: [
      { data: 'fname' }, // First Name
      { data: 'lname' }, // Last Name
      { data: 'examno' }, // Exam Number
      {
        data: null, // Select column
        render: function (data, type, row) {
          return `
            <input 
              type="checkbox" 
              class="select-checkbox" 
              name="selectedStudents" 
              value="${row.examno}" 
            />
          `;
        },
        orderable: false, // Disable ordering for this column
        searchable: false // Exclude from search
      }
    ]
  });

  // Utility Functions
  function showLoading(message = "Processing...") {
    $("#msg").html(`<span>${message}</span>`);
  }

  function showError(message) {
    $("#msg").html(`<span>${message}</span>`);
  }

  function showSuccess(message) {
    $("#msg").html(`<span>${message}</span>`);
  }

  // Handle Form Submission
  $("#studentSubjectDataFormBtn").click(function (e) {
    e.preventDefault();

    const formData = Object.fromEntries(new FormData($("#studentSubjectDataForm")[0]).entries());
    showLoading("Loading students...");

    $.ajax({
      url: "/studentSubject",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify(formData),
      success: function (data) {
        $("#studentSubjectDataForm").css('display', 'none');

        if (data.results && data.results.length > 0) {
          const title = `SUBJECT ENROLLMENT FORM - SUBJECT CODE: ${data.subjectcode}`;
          $("#title").html(title);
          table.clear().rows.add(data.results).draw();
          showSuccess("Students loaded successfully.");
          $("#subjectRegistration").css('display', 'block');
        } else {
          showError("No students found for this subject.");
          table.clear().draw(); // Clear the table to avoid residual data
        }
      },
      error: function (err) {
        showError("Failed to load students. Try again later.");
      }
    });
  });

  // Handle Enrollment
  $("#studentSubjectReg").click(function () {
    const selectedStudents = [];
    $('input[name="selectedStudents"]:checked').each(function () {
      const examno = $(this).val();
      const subjectcode = $("#subjectcode").val();

      selectedStudents.push({ examno, subjectcode });
    });

    if (selectedStudents.length === 0) {
      alert("No students selected for enrollment.");
      window.location.href = "/studentSubject";
    } else {
      // Submit selected students
      $.ajax({
        url: "/EnrollStudentSubject",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(selectedStudents),
        success: function (response) {
          alert("Enrollment successful!");
          showSuccess("Enrollment completed for selected students.");
          window.location.href = "/studentSubject";
        },
        error: function (err) {
          alert("Enrollment failed!");
          showError("Error during enrollment. Please try again.");
          window.location.href = "/studentSubject";
        }
      });
    }
  });
});