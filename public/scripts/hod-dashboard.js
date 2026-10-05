(() => {
  "use strict";

  const sidebar = document.getElementById("sidebar");
  const menuBtn = document.getElementById("menuBtn");
  const closeBtn = document.getElementById("sidebarClose");
  const overlay = document.getElementById("sidebarOverlay");
  const BREAKPOINT = 900;

  if (!sidebar || !menuBtn) return;

  const isMobile = () => window.innerWidth <= BREAKPOINT;

  function setIcon(open) {
    const icon = menuBtn.querySelector("i");
    if (!icon) return;
    icon.classList.toggle("bi-list", !open);
    icon.classList.toggle("bi-x-lg", open);
  }

  function openSidebar() {
    if (!isMobile()) return;
    sidebar.classList.add("open");
    overlay?.classList.add("visible");
    document.body.classList.add("sidebar-open");
    menuBtn.setAttribute("aria-expanded", "true");
    overlay?.setAttribute("aria-hidden", "false");
    setIcon(true);
  }

  function closeSidebar() {
    sidebar.classList.remove("open");
    overlay?.classList.remove("visible");
    document.body.classList.remove("sidebar-open");
    menuBtn.setAttribute("aria-expanded", "false");
    overlay?.setAttribute("aria-hidden", "true");
    setIcon(false);
  }

  menuBtn.addEventListener("click", () =>
    sidebar.classList.contains("open") ? closeSidebar() : openSidebar(),
  );
  closeBtn?.addEventListener("click", closeSidebar);
  overlay?.addEventListener("click", closeSidebar);

  sidebar.querySelectorAll("a.nav-item").forEach((link) => {
    link.addEventListener("click", () => {
      if (isMobile()) closeSidebar();
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && sidebar.classList.contains("open"))
      closeSidebar();
  });

  window.addEventListener("resize", () => {
    if (!isMobile()) closeSidebar();
  });

  /* =====================================================
       TEACHER SEARCH
    ====================================================== */

  const teacherSearch = document.getElementById("teacherSearch");

  const teacherStatusFilter = document.getElementById("teacherStatusFilter");

  const teacherTable = document.getElementById("teacherTable");

  function filterTeachers() {
    if (!teacherTable) return;

    const search = teacherSearch?.value.trim().toLowerCase() || "";

    const status = teacherStatusFilter?.value.toLowerCase() || "";

    const rows = teacherTable.querySelectorAll("tbody tr");

    rows.forEach((row) => {
      const text = row.textContent.toLowerCase();

      const matchesSearch = !search || text.includes(search);

      let matchesStatus = true;

      if (status) {
        const badge = row.querySelector(".status-badge");

        const rowStatus = badge?.textContent.trim().toLowerCase() || "";

        matchesStatus = rowStatus === status;
      }

      row.style.display = matchesSearch && matchesStatus ? "" : "none";
    });
  }

  teacherSearch?.addEventListener("input", filterTeachers);

  teacherStatusFilter?.addEventListener("change", filterTeachers);

  /* =====================================================
       CLASS SEARCH
    ====================================================== */

  const classSearch = document.getElementById("classSearch");

  classSearch?.addEventListener("input", () => {
    const value = classSearch.value.trim().toLowerCase();

    const table = classSearch.closest(".data-card")?.querySelector("table");

    if (!table) return;

    table.querySelectorAll("tbody tr").forEach((row) => {
      const text = row.textContent.toLowerCase();

      row.style.display = !value || text.includes(value) ? "" : "none";
    });
  });

  /* =====================================================
       RESULT SEARCH
    ====================================================== */

  const resultForm = document.getElementById("resultSearchForm");

  const resultContainer = document.getElementById("resultContainer");

  const resultMessage = document.getElementById("resultSearchMessage");

  const resultClearBtn = document.getElementById("resultClearBtn");

  // Clear button click
  resultClearBtn?.addEventListener("click", clearSearch);

  /* =========================================================
   EVENT LISTENERS
========================================================= */

  function validate(payload) {
    if (
      !payload.schoolyear ||
      !payload.termid ||
      !payload.classid ||
      !payload.subjectcode ||
      !payload.examid
    ) {
      showResultMessage(
        "Please select school year, term, class, subject and exam.",
        "error",
      );
      return false;
    }
    return true;
  }

  /* =========================================================
   CLEAR SEARCH
========================================================= */

  function clearSearch() {
    // Clear filters
    if (resultYearFilter) {
      resultYearFilter.value = "";
    }

    if (resultTermFilter) {
      resultTermFilter.value = "";
    }

    if (resultClassFilter) {
      resultClassFilter.value = "";
    }

    if (resultSubjectFilter) {
      resultSubjectFilter.value = "";
    }

    if (resultExamFilter) {
      resultExamFilter.value = "";
    }

    // Clear results
    if (resultContainer) {
      resultContainer.innerHTML = "";
      resultContainer.classList.add("d-none");
    }

    // Clear result/status message
    if (typeof showResultMessage === "function") {
      showResultMessage("", "");
    }

    // Reset validation styling
    if (resultForm) {
      resultForm.querySelectorAll(".is-invalid").forEach((element) => {
        element.classList.remove("is-invalid");
      });
    }

    // Reset any validation messages
    if (resultForm) {
      resultForm.querySelectorAll(".invalid-feedback").forEach((element) => {
        element.remove();
      });
    }
  }

  const GRADE_TABLE = [
    { min: 85, grade: "A+", remark: "Excellent" },
    { min: 75, grade: "A", remark: "Excellent" },
    { min: 65, grade: "B+", remark: "Very Good" },
    { min: 60, grade: "B", remark: "Good" },
    { min: 50, grade: "C+", remark: "Fair" },
    { min: 40, grade: "C", remark: "Fair" },
    { min: 0, grade: "F", remark: "Work Hard" },
  ];

  function gradeFor(score) {
    const num = Number(score);
    if (!Number.isFinite(num)) {
      return { grade: "—", remark: "Absent", passed: false };
    }
    const row = GRADE_TABLE.find((g) => num >= g.min);
    return { ...row, passed: num >= 40 };
  }

  function showResultMessage(message, type = "success") {
    if (!resultMessage) return;

    resultMessage.textContent = message;

    resultMessage.className = `search-message ${type}`;
  }

  resultForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const payload = {
      examno: document.getElementById("resultExamNo")?.value.trim(),

      schoolyear: document.getElementById("resultYearFilter")?.value,

      termid: document.getElementById("resultTermFilter")?.value,

      classid: document.getElementById("resultClassFilter")?.value,

      subjectcode: document.getElementById("resultSubjectFilter")?.value,

      examid: document.getElementById("resultExamFilter")?.value,
    };

    try {
      if (!validate(payload)) return;

      const params = new URLSearchParams(payload);

      showResultMessage("Searching results...", "success");

      const response = await fetch(`/hod/results?${params.toString()}`, {
        method: "POST",

        headers: {
          Accept: "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to retrieve results.");
      }

      renderResults(data);
    } catch (error) {
      showResultMessage(error.message || "Unable to search results.", "error");
    }
  });

  function renderResults(data) {
    if (!resultContainer) return;

    resultContainer.classList.remove("d-none");

    const results = Array.isArray(data)
      ? data
      : Array.isArray(data?.results)
        ? data.results
        : [];

    if (!results.length) {
      resultContainer.innerHTML = `
        <div class="empty-state">
          <i class="bi bi-file-earmark-x"></i>
          <strong>
            No results found
          </strong>
        </div>
      `;

      return;
    }

    resultContainer.innerHTML = `
  <div id="resultActions" class="d-flex justify-content-end mb-3">
    <button
      type="button"
      class="btn btn-sm btn-outline-secondary"
      id="exportResultsBtn"
    >
      <i class="bi bi-download me-1"></i>
      Export
    </button>
  </div>

  <div class="table-responsive">
    <table class="table professional-table result-table">

      <thead>
        <tr>
          <th>Name</th>
          <th>Exam No.</th>
          <th>Subject</th>
          <th>Assessment</th>
          <th>Mark</th>
          <th>Grade</th>
        </tr>
      </thead>

      <tbody>

        ${results
          .map((result) => {
            const fullName = [result.fname, result.middlename, result.lname]
              .filter(Boolean)
              .join(" ");

            let grade = gradeFor(result.score).grade;

            return `
              <tr>

                <td>
                  ${escapeHtml(fullName)}
                </td>

                <td>
                  ${escapeHtml(result.examno || "")}
                </td>

                <td>
                  ${escapeHtml(result.subjectname || "")}
                </td>

                <td>
                  ${escapeHtml(result.exam_title || result.examntype || "")}
                </td>

                <td>
                  ${
                    result.score
                      ? escapeHtml(String(result.score))
                      : `<span class="text-muted">Not recorded</span>`
                  }
                </td>

                <td>
                  ${
                    grade
                      ? `
                        <span class="status-badge success">
                          ${escapeHtml(grade)}
                        </span>
                      `
                      : `
                        <span class="status-badge">
                          Not graded
                        </span>
                      `
                  }
                </td>

              </tr>
            `;
          })
          .join("")}

      </tbody>

    </table>
  </div>
`;

  const exportBtn = document.getElementById("exportResultsBtn");

    exportBtn?.addEventListener("click", () => {
      exportResults(results);
    });

    showResultMessage("Results found.", "success");
  }

  function exportResults(results) {
    if (!Array.isArray(results) || results.length === 0) {
      showResultMessage("No results to export.", "warning");
      return;
    }

    const classFilter = document.getElementById("resultClassFilter");
    const subjectFilter = document.getElementById("resultSubjectFilter");
    const termFilter = document.getElementById("resultTermFilter");

    const getSelectedText = (element) => {
      if (!element || !element.value) return "";

      return element.options[element.selectedIndex]?.textContent?.trim() || "";
    };

    const subjectName = getSelectedText(subjectFilter);
    const className = getSelectedText(classFilter);
    const termName = getSelectedText(termFilter);

    // Build filename
    const filenameParts = ["pupil_results"];

    if (subjectName) filenameParts.push(subjectName);
    if (className) filenameParts.push(className);
    if (termName) filenameParts.push(termName);

    const dateStr = new Date().toISOString().slice(0, 10);

    const filename = `${filenameParts.join("_")}_${dateStr}.csv`;

    // CSV headers
    const headers = [
      "Name",
      "Exam No.",
      "Class",
      "Subject",
      "Assessment",
      "Mark",
      "Grade",
      "Term",
    ];

    const csvRows = [headers];

    results.forEach((result) => {
      const fullName = [result.fname, result.middlename, result.lname]
        .filter(Boolean)
        .join(" ");

      const hasScore =
        result.score !== null &&
        result.score !== undefined &&
        result.score !== "";

      const numericScore = hasScore ? Number(result.score) : null;

      const grade =
        hasScore && Number.isFinite(numericScore)
          ? gradeFor(numericScore)?.grade || ""
          : "";

      csvRows.push([
        fullName,
        result.examno || "",
        `${result.levelname || ""}${result.class || ""}`,
        result.subjectname || "",
        result.exam_title || result.examntype || "",
        hasScore ? result.score : "",
        grade,
        result.termname || termName || "",
      ]);
    });

    // Convert rows to CSV
    const csv = csvRows
      .map((row) =>
        row
          .map((field) => {
            const value = String(field ?? "");

            // Escape quotes and wrap every field
            return `"${value.replace(/"/g, '""')}"`;
          })
          .join(","),
      )
      .join("\r\n");

    // UTF-8 BOM helps Excel display characters correctly
    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = filename;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    showResultMessage(
      `Exported ${results.length} result${
        results.length === 1 ? "" : "s"
      } to ${filename}`,
      "success",
    );
  }

  /* =====================================================
       PROGRESS CHART
    ====================================================== */

  const loadProgress = document.getElementById("loadProgress");

  loadProgress?.addEventListener("click", async () => {
    const student = document.getElementById("progressStudent")?.value;

    const subject = document.getElementById("progressSubject")?.value;

    if (!student || !subject) {
      alert("Select a student and subject.");

      return;
    }

    /*
     * Replace this demo data with:
     *
     * GET /hod/results/progress
     *
     * Example response:
     *
     * {
     *   term1: 55,
     *   term2: 68,
     *   term3: 74,
     *   final: 78
     * }
     */

    drawProgressChart({
      term1: 55,
      term2: 68,
      term3: 74,
      final: 78,
    });
  });

  function drawProgressChart(data) {
    const values = [
      Number(data.term1 || 0),
      Number(data.term2 || 0),
      Number(data.term3 || 0),
      Number(data.final || 0),
    ];

    const line = document.getElementById("progressLine");

    const pointsGroup = document.getElementById("progressPoints");

    if (!line || !pointsGroup) return;

    const width = 900;

    const height = 280;

    const xPositions = [80, 320, 560, 800];

    const points = values.map((value, index) => {
      const safeValue = Math.max(0, Math.min(100, value));

      const y = height - (safeValue / 100) * height;

      return `${xPositions[index]},${y}`;
    });

    line.setAttribute("points", points.join(" "));

    pointsGroup.innerHTML = points
      .map((point, index) => {
        const [x, y] = point.split(",");

        return `

                        <circle
                            cx="${x}"
                            cy="${y}"
                            r="6"
                            fill="currentColor"
                        />

                    `;
      })
      .join("");

    document.getElementById("term1Score").textContent = `${values[0]}%`;

    document.getElementById("term2Score").textContent = `${values[1]}%`;

    document.getElementById("term3Score").textContent = `${values[2]}%`;

    document.getElementById("finalScore").textContent = `${values[3]}%`;
  }

  /* =====================================================
       REPORT PREVIEW
    ====================================================== */

  const reportForm = document.getElementById("reportForm");

  const previewButton = document.getElementById("previewReport");

  function selectedText(id) {
    const select = document.getElementById(id);

    if (!select || select.selectedIndex < 0) {
      return "—";
    }

    return select.options[select.selectedIndex].textContent.trim();
  }

  function updateReportPreview() {
    const reportType = selectedText("reportType");

    const year = selectedText("reportYear");

    const term = selectedText("reportTerm");

    const subject = selectedText("reportSubject");

    const className = selectedText("reportClass");

    const title = document.getElementById("previewReportTitle");

    const previewYear = document.getElementById("previewYear");

    const previewTerm = document.getElementById("previewTerm");

    const previewClass = document.getElementById("previewClass");

    const previewStatus = document.getElementById("previewStatus");

    title.textContent = reportType === "—" ? "Report Preview" : reportType;

    previewYear.textContent = year || "—";

    previewTerm.textContent = term || "All Terms";

    previewClass.textContent = className || "All Classes";

    previewStatus.textContent = "Ready";
  }

  previewButton?.addEventListener("click", updateReportPreview);

  reportForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    updateReportPreview();

    /*
     * Actual PDF endpoint can later be:
     *
     * POST /hod/reports/generate
     *
     * with:
     *
     * reportType
     * yearid
     * termid
     * subjectcode
     * classid
     */

    alert("Report generation endpoint is ready to be connected.");
  });

  /* =====================================================
       REFRESH
    ====================================================== */

  document.getElementById("refreshDashboard")?.addEventListener("click", () => {
    window.location.reload();
  });

  /* =====================================================
       ESCAPE HTML
    ====================================================== */

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => {
      const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      };

      return entities[character];
    });
  }

  /* =====================================================
       INITIALIZATION
    ====================================================== */

  drawProgressChart({
    term1: 0,
    term2: 0,
    term3: 0,
    final: 0,
  });

  document.querySelectorAll(".performance-fill").forEach((bar) => {
    const percentage = Number(bar.dataset.percentage) || 0;

    bar.style.width = `${Math.min(Math.max(percentage, 0), 100)}%`;
  });

  document.querySelectorAll(".donut-chart").forEach((chart) => {
    const percentage = Number(chart.dataset.percentage) || 0;

    chart.style.setProperty(
      "--percentage",
      `${Math.min(Math.max(percentage, 0), 100)}%`,
    );
  });
})();
