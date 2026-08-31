document.addEventListener("DOMContentLoaded", () => {
  /*
   * Prevent allocating a class without
   * selecting a class subject.
   */

  const allocationForm = document.getElementById("allocationForm");

  if (!allocationForm) return;

  allocationForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const subject = allocationForm.querySelector(
      '[name="class_subject_id"]',
    )?.value;

    if (!subject) {
      return alert("Please select both the class and class subject.");
    }

    try {
      const formData = new FormData(allocationForm);
      const response = await fetch("/teacher/class/allocation", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(formData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        alert(result.message);
        return;
      }

      alert(result.message);

      // Redirect after successful allocation
      setTimeout(() => {
        window.location.href =
          window.location.href = `/dashboard`;
      }, 1000);
    } catch (error) {
      console.error("Allocation error:", error);
      alert("Something went wrong. Please try again.");
    }
  });

  const assignSubjectForm = document.getElementById("assignSubject");
  assignSubjectForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData(assignSubjectForm);
      const response = await fetch("/allocateSubject", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(formData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        alert(result.message);
        return;
      }

      console.log(result.redirect);

      alert(result.message);

      // Redirect after successful allocation
      setTimeout(() => {
        window.location.href =
          window.location.href = `/teachers/${result.teacherid}`;
      }, 1000);
    } catch (error) {
      console.error("Allocation error:", error);
      showError("Something went wrong. Please try again.");
    }
  });
});
