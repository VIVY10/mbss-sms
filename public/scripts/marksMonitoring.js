(() => {
  "use strict";

  /* ============================================================
     MARKS MONITORING DASHBOARD
     ============================================================ */

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];

  const state = {
    selected: null,
    rows: [],
    loading: false,
    initialized: false
  };

  /* ============================================================
     API
     ============================================================ */

  async function api(url, options = {}) {
    const response = await fetch(url, {
      credentials: "same-origin",
      ...options,
      headers: {
        Accept: "application/json",
        ...(options.body
          ? { "Content-Type": "application/json" }
          : {}),
        ...(options.headers || {})
      }
    });

    let data = null;

    try {
      data = await response.json();
    } catch (_) {
      // Response was not JSON
    }

    if (!response.ok || !data?.success) {
      throw new Error(
        data?.message ||
        `Request failed (${response.status})`
      );
    }

    return data;
  }

  /* ============================================================
     ELEMENT HELPERS
     ============================================================ */

  function element(id) {
    return document.getElementById(id);
  }

  function value(id) {
    return element(id)?.value?.trim() || "";
  }

  function selectedText(id) {
    const select = element(id);

    if (!select || select.selectedIndex < 0) {
      return "";
    }

    return (
      select.options[select.selectedIndex]?.textContent?.trim() || ""
    );
  }

  function setValue(id, newValue) {
    const select = element(id);

    if (!select) return;

    select.value = newValue || "";
  }

  function setDisabled(id, disabled) {
    const el = element(id);

    if (el) {
      el.disabled = disabled;
    }
  }

  /* ============================================================
     QUERY
     ============================================================ */

  function buildQuery({
    includeOptional = true,
    requireFilters = true
  } = {}) {
    const yearid = value("mmYear");
    const termid = value("mmTerm");
    const examid = value("mmExam");

    if (requireFilters && (!yearid || !termid || !examid)) {
      return null;
    }

    const params = new URLSearchParams();

    if (yearid) {
      params.set("yearid", yearid);
    }

    if (termid) {
      params.set("termid", termid);
    }

    if (examid) {
      params.set("examid", examid);
    }

    if (includeOptional) {
      const departmentid = value("mmDepartment");
      const classid = value("mmClass");
      const status = value("mmStatus");

      if (departmentid) {
        params.set("departmentid", departmentid);
      }

      if (classid) {
        params.set("classid", classid);
      }

      if (status) {
        params.set("status", status);
      }
    }

    return params;
  }

  /* ============================================================
     ESCAPE HTML
     ============================================================ */

  function esc(value) {
    const div = document.createElement("div");
    div.textContent = value ?? "";
    return div.innerHTML;
  }

  /* ============================================================
     STATUS
     ============================================================ */

  function statusLabel(status) {
    const labels = {
      COMPLETE: "Complete",
      IN_PROGRESS: "In Progress",
      NOT_STARTED: "Not Started",
      OVERDUE: "Overdue"
    };

    return labels[status] || status || "Unknown";
  }

  function statusClass(status) {
    const classes = {
      COMPLETE: "mm-status-complete",
      IN_PROGRESS: "mm-status-progress",
      NOT_STARTED: "mm-status-not-started",
      OVERDUE: "mm-status-overdue"
    };

    return (
      classes[status] ||
      "mm-status-not-started"
    );
  }

  /* ============================================================
     ALERTS
     ============================================================ */

  function showAlert(message, type = "danger") {
    const alertBox = element("mmAlert");

    if (!alertBox) return;

    alertBox.textContent = message;

    alertBox.className =
      `alert alert-${type} mm-alert`;

    alertBox.classList.remove("d-none");
  }

  function clearAlert() {
    const alertBox = element("mmAlert");

    if (!alertBox) return;

    alertBox.textContent = "";
    alertBox.classList.add("d-none");
  }

  /* ============================================================
     LOADING
     ============================================================ */

  function setLoading(isLoading) {
    state.loading = isLoading;

    const refresh = element("mmRefresh");
    const spinner = element("mmRefreshSpinner");

    if (refresh) {
      refresh.disabled = isLoading;
    }

    if (spinner) {
      spinner.classList.toggle(
        "d-none",
        !isLoading
      );
    }

    [
      "mmYear",
      "mmTerm",
      "mmExam",
      "mmDepartment",
      "mmClass",
      "mmStatus"
    ].forEach((id) => {
      const el = element(id);

      if (el) {
        el.classList.toggle(
          "mm-loading",
          isLoading
        );
      }
    });
  }

  /* ============================================================
     EMPTY DASHBOARD
     ============================================================ */

  function resetDashboard(message = "Select monitoring filters") {
    renderKpis({
      totalSubjects: 0,
      completeSubjects: 0,
      inProgressSubjects: 0,
      notStartedSubjects: 0,
      missingMarks: 0,
      completionPercentage: 0
    });

    state.rows = [];

    const body = element("mmRows");
    const empty = element("mmEmpty");

    if (body) {
      body.innerHTML = "";
    }

    if (empty) {
      empty.classList.remove("d-none");

      const text =
        empty.querySelector(".mm-empty-message") ||
        empty.querySelector("[data-empty-message]");

      if (text) {
        text.textContent = message;
      }
    }

    const context = element("mmContext");

    if (context) {
      context.textContent = message;
    }
  }

  /* ============================================================
     KPI RENDERING
     ============================================================ */

  function renderKpis(data = {}) {
    const totalSubjects =
      Number(data.totalSubjects) || 0;

    const completeSubjects =
      Number(data.completeSubjects) || 0;

    const inProgressSubjects =
      Number(data.inProgressSubjects) || 0;

    const notStartedSubjects =
      Number(data.notStartedSubjects) || 0;

    const missingMarks =
      Number(data.missingMarks) || 0;

    const completionPercentage =
      Number(data.completionPercentage) || 0;

    if (element("mmTotalSubjects")) {
      element("mmTotalSubjects").textContent =
        totalSubjects;
    }

    if (element("mmComplete")) {
      element("mmComplete").textContent =
        completeSubjects;
    }

    if (element("mmProgress")) {
      element("mmProgress").textContent =
        inProgressSubjects;
    }

    if (element("mmNotStarted")) {
      element("mmNotStarted").textContent =
        notStartedSubjects;
    }

    if (element("mmMissing")) {
      element("mmMissing").textContent =
        missingMarks;
    }

    if (element("mmCompletion")) {
      element("mmCompletion").textContent =
        `${completionPercentage.toFixed(1)}%`;
    }
  }

  /* ============================================================
     ROW RENDERING
     ============================================================ */

  function renderRows(rows = []) {
    state.rows = Array.isArray(rows)
      ? rows
      : [];

    const body = element("mmRows");
    const empty = element("mmEmpty");

    if (!body) return;

    body.innerHTML = "";

    if (!state.rows.length) {
      if (empty) {
        empty.classList.remove("d-none");
      }

      return;
    }

    if (empty) {
      empty.classList.add("d-none");
    }

    state.rows.forEach((row) => {
      const entered =
        Number(row.entered_marks) || 0;

      const expected =
        Number(row.expected_marks) || 0;

      const completion =
        Number(row.completion_percentage) || 0;

      const missing =
        Number(row.missing_marks) || 0;

      const progress =
        Math.min(
          Math.max(completion, 0),
          100
        );

      const tr =
        document.createElement("tr");

      tr.innerHTML = `
        <td>
          <div class="mm-subject">
            ${esc(row.subjectname)}
          </div>

          <div class="mm-teacher">
            ${esc(row.subjectcode)}
          </div>
        </td>

        <td>
          <div>
            ${esc(row.grade)}
            ${esc(row.section)}
          </div>

          <div class="mm-teacher">
            ${esc(row.departmentname)}
          </div>
        </td>

        <td>
          <div class="fw-semibold">
            ${esc(
              row.teacher_name ||
              "Not allocated"
            )}
          </div>
        </td>

        <td>
          <div class="fw-semibold">
            ${entered}
            /
            ${expected}

            <span class="text-muted">
              (${completion.toFixed(1)}%)
            </span>
          </div>

          <progress
            class="mm-progress-native"
            max="100"
            value="${progress}"
            aria-label="${completion}% complete">
          </progress>
        </td>

        <td>
          <span class="mm-status ${statusClass(
            row.completion_status
          )}">
            ${esc(
              statusLabel(
                row.completion_status
              )
            )}
          </span>
        </td>

        <td class="fw-semibold">
          ${missing}
        </td>

        <td>
          <button
            type="button"
            class="btn btn-sm btn-outline-primary mm-view"
            data-id="${esc(
              row.class_subject_id
            )}">
            View
          </button>
        </td>
      `;

      body.appendChild(tr);
    });

    $$(".mm-view").forEach((button) => {
      button.addEventListener(
        "click",
        handleViewRow
      );
    });
  }

  /* ============================================================
     VIEW ROW
     ============================================================ */

  function handleViewRow(event) {
    const id =
      event.currentTarget.dataset.id;

    const row =
      state.rows.find(
        (item) =>
          String(item.class_subject_id) ===
          String(id)
      );

    if (row) {
      openDetails(row);
    }
  }

  /* ============================================================
     LOAD CLASSES
     ============================================================ */

  async function loadClasses() {
    const yearid = value("mmYear");
    const termid = value("mmTerm");

    const select = element("mmClass");

    if (!select) {
      return;
    }

    if (!yearid || !termid) {
      select.innerHTML =
        `<option value="">All classes</option>`;

      setDisabled("mmClass", true);

      return;
    }

    const currentValue =
      select.value;

    setDisabled("mmClass", true);

    try {
      const params =
        new URLSearchParams({
          yearid,
          termid
        });

      const departmentid =
        value("mmDepartment");

      if (departmentid) {
        params.set(
          "departmentid",
          departmentid
        );
      }

      const result =
        await api(
          `/marks-monitoring/classes?${params}`
        );

      select.innerHTML =
        `<option value="">All classes</option>`;

      const classes =
        Array.isArray(result.data)
          ? result.data
          : [];

      classes.forEach((item) => {
        const option =
          document.createElement("option");

        option.value =
          item.classid;

        option.textContent =
          `${item.grade || ""} ${item.section || ""}`.trim();

        select.appendChild(option);
      });

      if (
        [...select.options].some(
          (option) =>
            String(option.value) ===
            String(currentValue)
        )
      ) {
        select.value =
          currentValue;
      }

    } finally {
      setDisabled("mmClass", false);
    }
  }

  /* ============================================================
     LOAD DASHBOARD
     ============================================================ */

  async function loadDashboard() {
    clearAlert();

    const yearid = value("mmYear");
    const termid = value("mmTerm");
    const examid = value("mmExam");

    /*
     * CRITICAL:
     * Never call summary/rows when required filters
     * are empty.
     */
    if (!yearid || !termid || !examid) {
      let message =
        "Select academic year, term and examination.";

      if (!yearid) {
        message =
          "Select an academic year.";
      } else if (!termid) {
        message =
          "Select a term.";
      } else if (!examid) {
        message =
          "Select an examination.";
      }

      resetDashboard(message);

      return;
    }

    setLoading(true);

    try {
      const params =
        buildQuery({
          includeOptional: true,
          requireFilters: true
        });

      if (!params) {
        resetDashboard(
          "Select academic year, term and examination."
        );

        return;
      }

      const [
        summary,
        rows
      ] = await Promise.all([
        api(
          `/marks-monitoring/summary?${params}`
        ),

        api(
          `/marks-monitoring/rows?${params}`
        )
      ]);

      renderKpis(
        summary.data || {}
      );

      renderRows(
        rows.data || []
      );

      updateContext();

    } catch (error) {
      console.error(
        "Marks monitoring load error:",
        error
      );

      showAlert(
        error.message ||
        "Unable to load marks monitoring data."
      );

    } finally {
      setLoading(false);
    }
  }

  /* ============================================================
     CONTEXT
     ============================================================ */

  function updateContext() {
    const context =
      element("mmContext");

    if (!context) return;

    const term =
      selectedText("mmTerm");

    const exam =
      selectedText("mmExam");

    const year =
      selectedText("mmYear");

    const parts =
      [year, term, exam]
        .filter(Boolean);

    context.textContent =
      parts.length
        ? parts.join(" • ")
        : "Select monitoring filters";
  }

  /* ============================================================
     MISSING LEARNERS
     ============================================================ */

  async function loadMissingLearners(row) {
    const body =
      element("mmMissingLearnersBody");

    if (!body) return;

    body.innerHTML = `
      <tr>
        <td
          colspan="4"
          class="text-center py-4 text-muted">
          Loading learners...
        </td>
      </tr>
    `;

    const params =
      new URLSearchParams({
        class_subject_id:
          row.class_subject_id,
        examid:
          value("mmExam"),
        termid:
          value("mmTerm"),
        yearid:
          value("mmYear")
      });

    const result =
      await api(
        `/marks-monitoring/missing-learners?${params}`
      );

    const learners =
      Array.isArray(result.data)
        ? result.data
        : [];

    body.innerHTML = "";

    if (!learners.length) {
      body.innerHTML = `
        <tr>
          <td
            colspan="4"
            class="text-center py-4 text-success">
            No learners have missing marks.
          </td>
        </tr>
      `;

      return;
    }

    learners.forEach((learner, index) => {
      const tr =
        document.createElement("tr");

      const fullName = [
        learner.fname,
        learner.middlename,
        learner.lname
      ]
        .filter(Boolean)
        .join(" ");

      tr.innerHTML = `
        <td>
          ${index + 1}
        </td>

        <td>
          ${esc(learner.examno)}
        </td>

        <td>
          ${esc(fullName)}
        </td>

        <td>
          ${esc(learner.gender)}
        </td>
      `;

      body.appendChild(tr);
    });
  }

  /* ============================================================
     DETAILS MODAL
     ============================================================ */

  // async function openDetails(row) {
  //   state.selected = row;

  //   const title =
  //     element("mmDetailTitle");

  //   const meta =
  //     element("mmDetailMeta");

  //   const completion =
  //     element("mmDetailCompletion");

  //   const missing =
  //     element("mmDetailMissing");

  //   if (title) {
  //     title.textContent =
  //       `${row.subjectname || "Subject"} — ` +
  //       `${row.grade || ""} ${row.section || ""}`.trim();
  //   }

  //   if (meta) {
  //     meta.textContent =
  //       `${row.teacher_name || "Teacher not allocated"} • ` +
  //       `${selectedText("mmExam")}`;
  //   }

  //   if (completion) {
  //     completion.textContent =
  //       `${Number(row.entered_marks) || 0}/` +
  //       `${Number(row.expected_marks) || 0} ` +
  //       `(${Number(row.completion_percentage) || 0}%)`;
  //   }

  //   if (missing) {
  //     missing.textContent =
  //       Number(row.missing_marks) || 0;
  //   }

  //   const modalElement =
  //     element("mmDetailsModal");

  //   if (modalElement &&
  //       typeof bootstrap !== "undefined") {
  //     const modal =
  //       bootstrap.Modal.getOrCreateInstance(
  //         modalElement
  //       );

  //     modal.show();
  //   }

  //   try {
  //     await loadMissingLearners(row);

  //   } catch (error) {
  //     const body =
  //       element("mmMissingLearnersBody");

  //     if (body) {
  //       body.innerHTML = `
  //         <tr>
  //           <td
  //             colspan="4"
  //             class="text-center text-danger py-4">
  //             ${esc(error.message)}
  //           </td>
  //         </tr>
  //       `;
  //     }
  //   }
  // }


/* ============================================================
   DETAILS MODAL
   ============================================================ */

async function openDetails(row) {
  state.selected = row;

  const title = element("mmDetailTitle");
  const meta = element("mmDetailMeta");
  const completion = element("mmDetailCompletion");
  const missing = element("mmDetailMissing");

  if (title) {
    title.textContent =
      `${row.subjectname || "Subject"} — ` +
      `${row.grade || ""} ${row.section || ""}`.trim();
  }

  if (meta) {
    meta.textContent =
      `${row.teacher_name || "Teacher not allocated"} • ` +
      `${selectedText("mmExam")}`;
  }

  if (completion) {
    completion.textContent =
      `${Number(row.entered_marks) || 0}/` +
      `${Number(row.expected_marks) || 0} ` +
      `(${Number(row.completion_percentage) || 0}%)`;
  }

  if (missing) {
    missing.textContent = Number(row.missing_marks) || 0;
  }

  /* Reset intervention feedback */
  const feedback = element("mmInterventionFeedback");
  if (feedback) {
    feedback.classList.add("d-none");
    feedback.textContent = "";
  }

  /* Loading state for learners */
  const learnersBody = element("mmMissingLearnersBody");
  if (learnersBody) {
    learnersBody.innerHTML = `
      <tr>
        <td colspan="4" class="text-center py-4 text-muted">
          <span class="mm-loading-spinner"></span>
          Loading learners...
        </td>
      </tr>
    `;
  }

  /* Open the modal */
  showModal();

  try {
    await loadMissingLearners(row);
  } catch (error) {
    const body = element("mmMissingLearnersBody");
    if (body) {
      body.innerHTML = `
        <tr>
          <td colspan="4" class="text-center text-danger py-4">
            ${esc(error.message)}
          </td>
        </tr>
      `;
    }
  }
}


/* ============================================================
   SELF-CONTAINED MODAL CONTROLLER
   (Works with Bootstrap markup, no Bootstrap JS required)
   ============================================================ */

let mmHideTimeout = null;

function showModal() {
  const modalElement = element("mmDetailsModal");
  if (!modalElement) return;

  /* Cancel any pending "display:none" from a previous close */
  if (mmHideTimeout) {
    clearTimeout(mmHideTimeout);
    mmHideTimeout = null;
  }

  /* Create backdrop if missing */
  let backdrop = document.querySelector(".mm-modal-backdrop");
  if (!backdrop) {
    backdrop = document.createElement("div");
    backdrop.className = "mm-modal-backdrop";
    backdrop.addEventListener("click", hideModal);
    document.body.appendChild(backdrop);
  }

  /* Make sure display is on before animating */
  modalElement.style.display = "block";

  /* Show backdrop + modal */
  requestAnimationFrame(() => {
    backdrop.classList.add("show");
    modalElement.classList.add("show");
    modalElement.removeAttribute("aria-hidden");
    modalElement.setAttribute("aria-modal", "true");
    document.body.classList.add("mm-modal-open");
  });

  /* Focus close button for accessibility */
  setTimeout(() => {
    const closeBtn = modalElement.querySelector(".btn-close");
    if (closeBtn) closeBtn.focus();
  }, 100);

  /* Attach dismissal handlers (once) */
  if (!modalElement.dataset.bound) {
    modalElement.dataset.bound = "1";

    /* Close button */
    modalElement
      .querySelectorAll("[data-bs-dismiss='modal']")
      .forEach((btn) => {
        btn.addEventListener("click", hideModal);
      });

    /* Escape key */
    document.addEventListener("keydown", function (event) {
      if (
        event.key === "Escape" &&
        modalElement.classList.contains("show")
      ) {
        hideModal();
      }
    });
  }
}

function hideModal() {
  const modalElement = element("mmDetailsModal");
  const backdrop = document.querySelector(".mm-modal-backdrop");

  if (modalElement) {
    modalElement.classList.remove("show");
    modalElement.setAttribute("aria-hidden", "true");
    modalElement.removeAttribute("aria-modal");

    /* Clear any previous pending hide before scheduling a new one */
    if (mmHideTimeout) {
      clearTimeout(mmHideTimeout);
    }

    mmHideTimeout = setTimeout(() => {
      modalElement.style.display = "none";
      mmHideTimeout = null;
    }, 200);
  }

  if (backdrop) {
    backdrop.classList.remove("show");
  }

  document.body.classList.remove("mm-modal-open");
}

/* Expose for buttons / tests */
window.mmHideModal = hideModal;


  /* ============================================================
     INTERVENTION
     ============================================================ */

  async function submitIntervention(event) {
    event.preventDefault();

    if (!state.selected) {
      showInterventionFeedback(
        "Select a class subject first.",
        "danger"
      );

      return;
    }

    const form =
      event.currentTarget;

    const formData =
      new FormData(form);

    const payload = {
      class_subject_id:
        state.selected.class_subject_id,

      examid:
        value("mmExam"),

      termid:
        value("mmTerm"),

      yearid:
        value("mmYear"),

      teacherid:
        state.selected.teacherid || null,

      intervention_type:
        formData.get(
          "intervention_type"
        ),

      message:
        formData.get("message"),

      due_at:
        formData.get("due_at") || null
    };

    try {
      await api(
        "/marks-monitoring/interventions",
        {
          method: "POST",
          body: JSON.stringify(payload)
        }
      );

      form.reset();

      showInterventionFeedback(
        "Intervention recorded successfully.",
        "success"
      );

    } catch (error) {
      showInterventionFeedback(
        error.message,
        "danger"
      );
    }
  }

  function showInterventionFeedback(
    message,
    type = "danger"
  ) {
    const feedback =
      element(
        "mmInterventionFeedback"
      );

    if (!feedback) return;

    feedback.textContent =
      message;

    feedback.className =
      `alert alert-${type}`;

    feedback.classList.remove(
      "d-none"
    );
  }

  /* ============================================================
     YEAR CHANGE
     ============================================================ */

  async function handleYearChange() {
    clearAlert();

    /*
     * A new year invalidates term, exam and class.
     */
    setValue("mmTerm", "");
    setValue("mmExam", "");

    const classSelect =
      element("mmClass");

    if (classSelect) {
      classSelect.innerHTML =
        `<option value="">All classes</option>`;
    }

    resetDashboard(
      "Select a term for this academic year."
    );

    /*
     * If your EJS already loads terms server-side,
     * we simply continue.
     *
     * If your application has a separate term API,
     * loadTerms() can be connected here.
     */
    try {
      await loadTermsIfAvailable();

      await loadClasses();

      await loadDashboard();

    } catch (error) {
      showAlert(error.message);
    }
  }

  /* ============================================================
     TERM CHANGE
     ============================================================ */

  async function handleTermChange() {
    clearAlert();

    /*
     * A new term invalidates the exam and class.
     */
    setValue("mmExam", "");

    const classSelect =
      element("mmClass");

    if (classSelect) {
      classSelect.innerHTML =
        `<option value="">All classes</option>`;
    }

    resetDashboard(
      "Select an examination for this term."
    );

    try {
      await loadExamsIfAvailable();

      await loadClasses();

      await loadDashboard();

    } catch (error) {
      showAlert(error.message);
    }
  }

  /* ============================================================
     EXAM CHANGE
     ============================================================ */

  async function handleExamChange() {
    clearAlert();

    await loadDashboard();
  }

  /* ============================================================
     DEPARTMENT CHANGE
     ============================================================ */

  async function handleDepartmentChange() {
    clearAlert();

    /*
     * Department changes the available classes.
     */
    setValue("mmClass", "");

    try {
      await loadClasses();
      await loadDashboard();

    } catch (error) {
      showAlert(error.message);
    }
  }

  /* ============================================================
     CLASS CHANGE
     ============================================================ */

  async function handleClassChange() {
    clearAlert();

    await loadDashboard();
  }

  /* ============================================================
     STATUS CHANGE
     ============================================================ */

  async function handleStatusChange() {
    clearAlert();

    await loadDashboard();
  }

  /* ============================================================
     OPTIONAL TERM LOADER
     ============================================================

     This function intentionally does nothing if your EJS
     already provides the terms.

     If your backend exposes a terms endpoint, replace the
     endpoint below with your actual endpoint.
     */

  async function loadTermsIfAvailable() {
    const yearid =
      value("mmYear");

    const term =
      element("mmTerm");

    if (!yearid || !term) {
      return;
    }

    /*
     * If terms are already populated in EJS, do not
     * make an unnecessary API request.
     */
    const hasRealOptions =
      [...term.options].some(
        (option) =>
          option.value &&
          option.value !== ""
      );

    if (hasRealOptions) {
      return;
    }

    /*
     * No term endpoint is assumed here.
     *
     * This prevents the frontend from inventing an
     * endpoint that may not exist in your application.
     */
  }

  /* ============================================================
     OPTIONAL EXAM LOADER
     ============================================================

     Same principle as terms. If exams are already populated
     by EJS, no request is made.

     Connect this function to your actual exams endpoint if
     exams are dynamically loaded.
     */

  async function loadExamsIfAvailable() {
    const termid =
      value("mmTerm");

    const exam =
      element("mmExam");

    if (!termid || !exam) {
      return;
    }

    const hasRealOptions =
      [...exam.options].some(
        (option) =>
          option.value &&
          option.value !== ""
      );

    if (hasRealOptions) {
      return;
    }

    /*
     * No exam endpoint is assumed.
     *
     * This intentionally avoids making a request to
     * an endpoint that may not exist.
     */
  }

  /* ============================================================
     REFRESH
     ============================================================ */

  async function refreshDashboard() {
    if (state.loading) {
      return;
    }

    await loadDashboard();
  }

  /* ============================================================
     EVENT BINDING
     ============================================================ */

  function bindEvents() {
    const refresh =
      element("mmRefresh");

    if (refresh) {
      refresh.addEventListener(
        "click",
        refreshDashboard
      );
    }

    const year =
      element("mmYear");

    if (year) {
      year.addEventListener(
        "change",
        handleYearChange
      );
    }

    const term =
      element("mmTerm");

    if (term) {
      term.addEventListener(
        "change",
        handleTermChange
      );
    }

    const exam =
      element("mmExam");

    if (exam) {
      exam.addEventListener(
        "change",
        handleExamChange
      );
    }

    const department =
      element("mmDepartment");

    if (department) {
      department.addEventListener(
        "change",
        handleDepartmentChange
      );
    }

    const classSelect =
      element("mmClass");

    if (classSelect) {
      classSelect.addEventListener(
        "change",
        handleClassChange
      );
    }

    const status =
      element("mmStatus");

    if (status) {
      status.addEventListener(
        "change",
        handleStatusChange
      );
    }

    const interventionForm =
      element("mmInterventionForm");

    if (interventionForm) {
      interventionForm.addEventListener(
        "submit",
        submitIntervention
      );
    }
  }

  /* ============================================================
     INITIALIZATION
     ============================================================ */

  async function initialize() {
    if (state.initialized) {
      return;
    }

    state.initialized = true;

    clearAlert();

    /*
     * Initial filter state.
     */
    const yearid = value("mmYear");
    const termid = value("mmTerm");
    const examid = value("mmExam");

    /*
     * Nothing selected yet.
     * This is normal and must NOT generate a 400 request.
     */
    if (!yearid) {
      resetDashboard(
        "Select an academic year."
      );

      return;
    }

    if (!termid) {
      resetDashboard(
        "Select a term."
      );

      return;
    }

    /*
     * Load classes when year + term exist.
     */
    try {
      await loadClasses();

    } catch (error) {
      showAlert(
        error.message ||
        "Unable to load classes."
      );

      return;
    }

    /*
     * Exam is required before dashboard data can
     * be requested.
     */
    if (!examid) {
      resetDashboard(
        "Select an examination."
      );

      return;
    }

    /*
     * All required filters exist.
     */
    await loadDashboard();
  }

  /* ============================================================
     DOM READY
     ============================================================ */

  document.addEventListener(
    "DOMContentLoaded",
    () => {
      bindEvents();

      initialize().catch((error) => {
        console.error(
          "Marks Monitoring initialization error:",
          error
        );

        showAlert(
          error.message ||
          "Unable to initialize marks monitoring."
        );
      });
    }
  );

})();