function downloadIDPDF() {
    const element = document.getElementById('idCard');
    html2pdf(element, {
        margin: 10,
        filename: 'Profilecard.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    });
}