"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("adminResultsForm");
  if (!form) return;

  /* =========================================================
       ELEMENTS
       ========================================================= */
  const subjectSelect = document.getElementById("selectSubjectcode");
  const examSelect = document.getElementById("examtype");
  const termSelect = document.getElementById("term");
  const classInput = document.getElementById("classid");
  const yearInput = document.getElementById("selectYear");
  const submitButton = document.getElementById("adminResults");
  const selectedContext = document.getElementById("selectedResultContext");
  const selectedClassDisplay = document.getElementById("selectedClassDisplay");
  const selectedTeacherDisplay = document.getElementById(
    "selectedTeacherDisplay",
  );
  const selectedSubjectDisplay = document.getElementById(
    "selectedSubjectDisplay",
  );
  const selectedTermDisplay = document.getElementById("selectedTermDisplay");
  const selectedYearDisplay = document.getElementById("selectedYearDisplay");
  const resultsStatus = document.getElementById("resultsStatus");
  const resultsCount = document.getElementById("resultsCount");
  const resultsTableSubtitle = document.getElementById("resultsTableSubtitle");
  const resultsEmptyState = document.getElementById("resultsEmptyState");
  const buttonContent = submitButton.querySelector(".button-content");
  const buttonLoading = submitButton.querySelector(".button-loading");

  let currentResults = [];

  /* =========================================================
       DATATABLE
       ========================================================= */
  const table = $("#resultsTable").DataTable({
    dom:
      "<'row align-items-center mb-2'<'col-md-6'B><'col-md-6'f>>" +
      "<'table-responsive'tr>" +
      "<'row align-items-center mt-3'<'col-md-5'i><'col-md-7'p>>",
    data: [],
    pageLength: 25,
    lengthMenu: [
      [10, 25, 50, 100],
      [10, 25, 50, 100],
    ],
    order: [[2, "asc"]],
    buttons: [
      {
        extend: "copyHtml5",
        text: '<i class="bi bi-copy"></i> Copy',
        title: () => getExportTitle(),
        filename: () => getExportFilename(),
        exportOptions: { columns: ":visible" },
      },
      {
        extend: "excelHtml5",
        text: '<i class="bi bi-file-earmark-excel"></i> Excel',
        title: () => getExportTitle(),
        filename: () => getExportFilename(),
        exportOptions: { columns: ":visible" },
      },
      {
        extend: "pdfHtml5",
        text: '<i class="bi bi-file-earmark-pdf"></i> PDF',
        title: () => getExportTitle(),
        filename: () => getExportFilename(),
        orientation: "landscape",
        pageSize: "A4",
        exportOptions: { columns: ":visible" },
      },
      {
        extend: "print",
        text: '<i class="bi bi-printer"></i> Print',
        title: () => getExportTitle(),
        exportOptions: { columns: ":visible" },
      },
    ],
    columns: [
      {
        data: null,
        orderable: false,
        searchable: false,
        width: "45px",
        render: (data, type, row, meta) => {
          return meta.row + meta.settings._iDisplayStart + 1;
        },
      },
      {
        data: "examno",
        render: (data) =>
          `<span class="exam-number">${escapeHtml(data ?? "—")}</span>`,
      },
      {
        data: null,
        render: (data) => {
          const name = `${data.fname ?? ""} ${data.lname ?? ""}`.trim();
          return `<span class="student-name">${escapeHtml(name || "—")}</span>`;
        },
      },
      {
        data: "gender",
        render: (data) => escapeHtml(data ?? "—"),
      },
      {
        data: null,
        render: (data) => {
          const className = `${data.levelname ?? ""}${data.class ?? ""}`.trim();
          return `<span class="student-name">${escapeHtml(className || "—")}</span>`;
        },
      },
      {
        data: "termname",
        render: (data) => (data ? `Term ${escapeHtml(data)}` : "—"),
      },
      {
        data: "score",
        className: "text-end",
        render: (data) => {
          if (data === null || data === undefined || data === "") {
            return `<span class="score-value score-absent">Absent</span>`;
          }
          if (typeof data === "string" && data.toLowerCase() === "absent") {
            return `<span class="score-value score-absent">Absent</span>`;
          }
          return `<span class="score-value">${escapeHtml(data)}</span>`;
        },
      },
      {
        data: "score",
        // render: (data) => escapeHtml(data ?? "—"),
        render: (data) => {
          if (data === null || data === undefined || data === "") {
            return `<span class="score-value score-absent">-</span>`;
          }
          return `<span class="score-value">${generateRemark(data)}</span>`;
        },
      },
    ],
    language: {
      emptyTable: "No results available.",
      zeroRecords: "No matching students found.",
      search: "Search students:",
    },
  });

  /* =========================================================
       SUBJECT / CLASS CHANGE
       ========================================================= */
  subjectSelect.addEventListener("change", () => {
    const option = subjectSelect.options[subjectSelect.selectedIndex];
    if (!option || !option.value) return;

    const classid = option.dataset.classid || "";
    const grade = option.dataset.grade || "";
    const section = option.dataset.section || "";
    const subjectname = option.dataset.subjectname || "";
    const fname = option.dataset.fname || "";
    const lname = option.dataset.lname || "";

    classInput.value = classid;
    selectedClassDisplay.textContent = `${grade}${section}`;
    selectedSubjectDisplay.textContent = subjectname || "—";

    const teacherName = `${fname} ${lname}`.trim();
    selectedTeacherDisplay.textContent = teacherName
      ? `Teacher: ${teacherName}`
      : "Teacher not allocated";

    updateContextVisibility();
  });

  /* =========================================================
       TERM CHANGE
       ========================================================= */
  termSelect.addEventListener("change", () => {
    const option = termSelect.options[termSelect.selectedIndex];
    if (!option || !option.value) return;

    const year = option.dataset.year || "";
    const yearName = option.dataset.yearname || "";
    const termNumber = option.dataset.termnumber || "";

    yearInput.value = year;
    selectedTermDisplay.textContent = termNumber ? `Term ${termNumber}` : "—";
    selectedYearDisplay.textContent = yearName || "—";

    updateContextVisibility();
  });

  /* =========================================================
       FORM SUBMISSION
       ========================================================= */
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearStatus();

    if (!validateForm()) return;

    const formData = Object.fromEntries(new FormData(form).entries());
    setLoading(true);

    try {
      const results = await fetch("/adminCheckResults", {
        method: "post",
        body: JSON.stringify(formData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      await new Promise((resolve) => setTimeout(resolve, 650));

      const payload = await results.json();

      if (!results.ok) {
        throw new Error(response.message || "Unable to load students results.");
      }

      currentResults = Array.isArray(payload.data) ? payload.data : [];
      renderResults(currentResults);
      showStatus(
        `${currentResults.length} student result${currentResults.length === 1 ? "" : "s"} loaded successfully.`,
        "success",
      );
    } catch (error) {
      console.error("Admin results request failed:", error);
      currentResults = [];
      table.clear().draw();
      resultsCount.textContent = "0";
      resultsEmptyState.classList.remove("d-none");
      showStatus(
        error.message || "Unable to retrieve student results.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  });

  /* =========================================================
       HELPERS
       ========================================================= */
  function validateForm() {
    if (!subjectSelect.value) {
      showStatus("Please select a class and subject.", "error");
      subjectSelect.focus();
      return false;
    }
    if (!classInput.value) {
      showStatus("The selected class could not be identified.", "error");
      return false;
    }
    if (!examSelect.value) {
      showStatus("Please select an examination.", "error");
      examSelect.focus();
      return false;
    }
    if (!termSelect.value) {
      showStatus("Please select an academic term.", "error");
      termSelect.focus();
      return false;
    }
    if (!yearInput.value) {
      showStatus("The school year could not be identified.", "error");
      return false;
    }
    return true;
  }

  function renderResults(results) {
    // const mark =
    //   item.score !== null && item.score !== undefined ? item.score : "-";
    // const grade = mark !== "-" ? calculateGradeForResults(Number(mark)) : "-";
    // const gradeClass = grade !== "-" ? `grade-${grade}` : "";
    // const passClass =
    //   mark !== "-" && Number(mark) >= 50 ? "pass" : mark !== "-" ? "fail" : "";
    // const remark = mark !== "-" ? generateRemark(Number(mark)) : "";

    table.clear();
    table.rows.add(results);
    table.draw();

    resultsCount.textContent = results.length;

    if (results.length === 0) {
      resultsEmptyState.classList.remove("d-none");
      resultsTableSubtitle.textContent =
        "No results were found for the selected criteria.";
      return;
    }

    resultsEmptyState.classList.add("d-none");

    const subject =
      subjectSelect.options[subjectSelect.selectedIndex]?.dataset.subjectname ||
      "Subject";
    const exam =
      examSelect.options[examSelect.selectedIndex]?.textContent.trim() ||
      "Examination";
    const className = selectedClassDisplay.textContent || "Class";

    resultsTableSubtitle.textContent = `${className} • ${subject} • ${exam}`;
  }

  function calculateGradeForResults(mark) {
    if (mark >= 75) return "A";
    if (mark >= 65) return "B";
    if (mark >= 55) return "C";
    if (mark >= 45) return "D";
    if (mark >= 0) return "F";
    return "-";
  }

  function generateRemark(mark) {
    if (mark >= 75) return "Distinction";
    if (mark >= 65) return "Merit";
    if (mark >= 55) return "Credit";
    if (mark >= 40) return "Pass";
    if (mark >= 0) return "Fail";
    return "-";
  }

  function updateContextVisibility() {
    const hasClass = Boolean(classInput.value);
    const hasTerm = Boolean(termSelect.value);
    if (hasClass || hasTerm) {
      selectedContext.classList.remove("d-none");
    }
  }

  function setLoading(isLoading) {
    submitButton.disabled = isLoading;
    if (isLoading) {
      buttonContent.classList.add("d-none");
      buttonLoading.classList.remove("d-none");
    } else {
      buttonContent.classList.remove("d-none");
      buttonLoading.classList.add("d-none");
    }
  }

  function showStatus(message, type) {
    resultsStatus.textContent = message;
    resultsStatus.className = "results-status";
    resultsStatus.classList.add(
      type === "success" ? "status-success" : "status-error",
    );
  }

  function clearStatus() {
    resultsStatus.textContent = "";
    resultsStatus.className = "results-status d-none";
  }

  function getExportTitle() {
    if (!currentResults.length) return "Student Results";
    const first = currentResults[0];
    const subject = first.subjectname || "Subject";
    const exam = first.exam_title || "Examination";
    const grade = first.grade || "";
    const section = first.section || "";
    return `${grade}${section} — ${subject} — ${exam}`;
  }

  function getExportFilename() {
    return getExportTitle()
      .replace(/[\\/:*?"<>|]/g, "")
      .replace(/\s+/g, "_");
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
});
