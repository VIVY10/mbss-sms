$("#downloadIDasPDF").click(async function () {
    const element = document.getElementById('idCard');

    // Convert the HTML element to a canvas
    const canvas = await html2canvas(element, {
        scale: 2, // Adjust scale for higher quality
        useCORS: true, // Enable cross-origin support for images
    });

    // Get the canvas as an image
    const imgData = canvas.toDataURL('image/jpeg', 0.98);

    // Initialize jsPDF
    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
    });

    // Calculate dimensions
    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Add the image to the PDF
    pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);

    // Save the PDF
    pdf.save('Profilecard.pdf');
});




    $('#termsDownloadDetails').on('click', function () {
        const element = document.getElementById("pupils-info");

        // Temporarily hide the last columns
        const lastColumns = document.querySelectorAll("#termsTable td:nth-last-child(-n+1), #termsTable th:nth-last-child(-n+1)");
        lastColumns.forEach(col => {
            col.style.display = "none";
        });

        // Temporarily adjust styles to expand the scrollable content
        const originalHeight = element.style.height;
        const originalOverflow = element.style.overflow;
        element.style.height = "auto";
        element.style.overflow = "visible";

        // Use html2canvas to capture the element as an image
        html2canvas(element, {
            scale: 2,
            logging: true,
            useCORS: true, // Allows cross-origin image loading
            scrollX: 0,
            scrollY: -window.scrollY // Account for any scroll position
        }).then(function (canvas) {
            // Create a new jsPDF instance
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });

            // Convert canvas to image and add it to the PDF
            const imgData = canvas.toDataURL('image/jpeg');
            doc.addImage(imgData, 'JPEG', 10, 10, 280, 190); // Adjust size and position

            // Save the generated PDF
            doc.save('terms.pdf');

            // Restore the original styles after the PDF is saved
            lastColumns.forEach(col => {
                col.style.display = "";
            });
            element.style.height = originalHeight;
            element.style.overflow = originalOverflow;
        }).catch(function (error) {
            console.error("Error generating PDF: ", error);
        });
    });

