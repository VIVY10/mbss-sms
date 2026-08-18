      document.getElementById('subjectcode').addEventListener('change', function() {
          // Get the selected option
          var selectedOption = this.options[this.selectedIndex];
          // Get the classid, grade, and section from the data attributes
          var classid = selectedOption.getAttribute('data-classid');
          var grade = selectedOption.getAttribute('data-grade');
          var year = selectedOption.getAttribute('data-schoolyearid');
          var term = selectedOption.getAttribute('data-termid');
          var section = selectedOption.getAttribute('data-section');
  
          // Set the value of the hidden classid, schoolyearid, termid input field
          document.getElementById('classid').value = classid;
          document.getElementById('schoolyearid').value = year;
          document.getElementById('termid').value = term;
  
          // Display the selected class in the div
          document.getElementById('selectedClassDisplay').textContent = `Selected Class: ${grade}${section}`;
      });