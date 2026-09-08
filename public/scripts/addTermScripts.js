document.addEventListener("DOMContentLoaded", () => {

    const termNumber = document.getElementById("termnumber");
    const termName = document.getElementById("termname");

    if (!termNumber || !termName) {
        return;
    }

    termNumber.addEventListener("change", function () {

        const selectedOption = this.options[this.selectedIndex];

        if (!selectedOption) {
            termName.value = "";
            return;
        }

        termName.value = selectedOption.dataset.termname || "";

    });

});