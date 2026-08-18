  document.getElementById('selectSubjectcode').addEventListener('change', function() {
      // Get the selected option
      var selectedOption = this.options[this.selectedIndex];
      // Get the classid, grade, and section from the data attributes
      var classid = selectedOption.getAttribute('data-classid');
      var grade = selectedOption.getAttribute('data-grade');
      var section = selectedOption.getAttribute('data-section');
      var fname = selectedOption.getAttribute('data-fname')
      var lname = selectedOption.getAttribute('data-lname')
      var subjectname = selectedOption.getAttribute('data-subjectname')
      var teacherid = selectedOption.getAttribute('data-teacherid')

      // Set the value of the hidden classid input field
      document.getElementById('classid').value = classid;

      // Display the selected class in the div
      document.getElementById('selectedClassDisplay').textContent = `TR: ${lname} ${fname} - ${grade}${section}`;
  });

  document.getElementById('term').addEventListener('change', function() {
        // Get the selected option
        var selectedOption = this.options[this.selectedIndex];
        // Get the classid, grade, and section from the data attributes
        var year = selectedOption.getAttribute('data-year');
        // Set the value of the hidden classid input field
        document.getElementById('selectYear').value = year;
    });



  // let formData = {}; // Global variable for form data
  var data = []; // Global variable for form data
  $(document).ready(function() {
  // Initial DataTable setup if needed
  var table = $('#resultsTable').DataTable({
              dom: 'Bfrtip',
              buttons: [
                  {
                      extend: 'copy',
                      title: function() {
                          return `Grade ${data[0].grade}${data[0].section}_${data[0].subjectname || 'Subject'}_${data[0].exam_title || 'Exam'}_Results`;
                      },
                      filename: function() {
                          return `Grade ${data[0].grade} ${data[0].section}_${data[0].subjectname || 'Subject'}_${data[0].exam_title || 'Exam'}_Results`;
                      },
                      exportOptions: {
                          columns: ':not(:nth-last-child(-n+2))' // Exclude the last two columns (Edit and Delete buttons)
                      }
                  },
                  {
                      extend: 'excel',
                      title: function() {
                          return `Grade ${data[0].grade} ${data[0].section} ${data[0].subjectname || 'Subject'}`;
                      },
                      filename: function() {
                          return `Grade ${data[0].grade} ${data[0].section}_${data[0].subjectname || 'Subject'}_${data[0].exam_title || 'Exam'}_Results`;
                      },
                      exportOptions: {
                          columns: ':not(:nth-last-child(-n+2))'
                      }
                  },
                  {
                      extend: 'pdf',
                      title: function() {
                          return `Grade ${data[0].grade} ${data[0].section} ${data[0].subjectname || 'Subject'}`;
                      },
                      filename: function() {
                          return `Grade ${data[0].grade} ${data[0].section}_${data[0].subjectname || 'Subject'}_${data[0].exam_title || 'Exam'}_Results`;
                      },                      
                      exportOptions: {
                          columns: ':not(:nth-last-child(-n+2))'
                      }
                  },
                  {
                      extend: 'print',
                      title: function() {
                          return `Grade ${data[0].grade} ${data[0].section} ${data[0].subjectname || 'Subject'}`;
                      },
                      exportOptions: {
                          columns: ':not(:nth-last-child(-n+2))'
                      }
                  }
              ],
              // data: [], // Initialize with empty data
              columns: [
                  { data: 'fname' },
                  { data: 'lname' },
                  { data: 'gender' },
                  { data: 'id' },
                  { data: 'grade' },
                  { data: 'section' },
                  { data: 'term' },
                  { data: 'score' }
              ]
          });


  // Handle form submission
  $("#adminResults").click(function(e) {
      e.preventDefault();
      
      const classData = $("#adminResultsForm")[0];
      const formData = Object.fromEntries(new FormData(classData).entries());

      var xmlhttp = new XMLHttpRequest();
      var url = "/adminCheckResults";
      xmlhttp.open("post", url, true);
      xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
      xmlhttp.send(JSON.stringify(formData));
      
      xmlhttp.onreadystatechange = function() {
          if (this.readyState == 4 && this.status == 200) {
              data = JSON.parse(this.responseText);
              // Clear the existing data and add new data
              table.clear().rows.add(data).draw();
          }
      }
  });
});