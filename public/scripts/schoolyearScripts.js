  $('#downloadSchoolYearsDetails').on('click', function downloadSchoolYears() {

    console.log("clicked")
    const element = document.getElementById("pupils-info");
  
    // Temporarily hide the last three columns
    const lastColumns = document.querySelectorAll("#schoolYearsTable td:nth-last-child(-n+1), #schoolYearsTable th:nth-last-child(-n+1)");
    lastColumns.forEach(col => {
      col.style.display = "none";
    });
  
    // Temporarily adjust styles to expand the scrollable content
    const originalStyle = element.style.height;
    element.style.height = "auto"; // Set height to auto to reveal all content
    element.style.overflow = "visible"; // Ensure no content is hidden
  
    const options = {
      margin: [0.5, 0.5, 0.5, 0.5],
      filename: 'terms.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, windowWidth: 1024 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' },
    };
  
    html2pdf()
      .set(options)
      .from(element)
      .save()
      .then(() => {
        // Restore the original styles after the PDF is saved
        lastColumns.forEach(col => {
          col.style.display = ""; // Revert the display style
        });
        element.style.height = originalStyle;
        element.style.overflow = "auto";
      });
  }
);
