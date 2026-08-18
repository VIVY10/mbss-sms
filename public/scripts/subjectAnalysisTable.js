      document.getElementById('selectanalysisSubjectcode').addEventListener('change', function() {
        // Get the selected option
        var selectedOption = this.options[this.selectedIndex];
        // Get the classid, grade, and section from the data attributes
        var classid = selectedOption.getAttribute('data-classid');
        var grade = selectedOption.getAttribute('data-grade');
        var section = selectedOption.getAttribute('data-section');

        // Set the value of the hidden classid input field
        document.getElementById('selectanalysisClassid').value = classid; 

        // Set the value of the hidden grade input field
        document.getElementById('selectanalysisGrade').value = grade;

        // Display the selected class in the div
        document.getElementById('selectedanalysisClassDisplay').textContent = `Selected Class: ${grade}${section}`;
    });

      document.getElementById('term').addEventListener('change', function() {
          // Get the selected option
          var selectedOption = this.options[this.selectedIndex];
          // Get the classid, grade, and section from the data attributes
          var year = selectedOption.getAttribute('data-year');
          // Set the value of the hidden classid input field
          document.getElementById('selectYear').value = year;
      });


  $(document).ready(function() {
			$('#analysisTable').DataTable();
});



