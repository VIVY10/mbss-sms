(() => {
  "use strict";

  // DOM refs
  const form = document.getElementById("registrationForm");
  const panels = document.querySelectorAll(".step-panel");
  const steps = document.querySelectorAll(".step");
  const nextBtn = document.getElementById("nextBtn");
  const backBtn = document.getElementById("backBtn");
  const submitBtn = document.getElementById("submitBtn");
  const cancelBtn = document.getElementById("cancelBtn");
  const reviewContent = document.getElementById("reviewContent");
  const yearLevel = document.getElementById("yearlevel");
  const classSelect = document.getElementById("selectedClass");
  const summaryClass = document.getElementById("summaryClass");
  const photoInput = document.getElementById("profilePicture");
  const photoPreview = document.getElementById("photoPreview");
  const uploadBox = document.getElementById("photoUploadBox");
  const admissionSelector = document.getElementById("admissionSelector");
  const admissionTypeHidden = document.getElementById("admissionType");
  const returningPanel = document.getElementById("returningPanel");
  const returningResult = document.getElementById("returningResult");
  const findBtn = document.getElementById("findReturningBtn");
  const returningExamno = document.getElementById("returningExamno");
  const regTypeLabel = document.getElementById("regTypeLabel");
  const summaryType = document.getElementById("summaryType");

  let currentStep = 1;
  let isReturning = false;
  let returningStudentVerified = false;

  // ----- helpers -----
  const value = (id) => document.getElementById(id)?.value?.trim() || "";
  const selectedText = (id) => {
    const sel = document.getElementById(id);
    if (!sel || sel.selectedIndex < 0) return "-";
    return sel.options[sel.selectedIndex]?.textContent?.trim() || "-";
  };
  const setError = (field, msg) => {
    const wrap = field.closest(".field");
    if (!wrap) return;
    wrap.classList.add("invalid");
    const err = wrap.querySelector(".field-error");
    if (err) err.textContent = msg;
  };
  const clearError = (field) => {
    const wrap = field.closest(".field");
    if (!wrap) return;
    wrap.classList.remove("invalid");
    const err = wrap.querySelector(".field-error");
    if (err) err.textContent = "";
  };

  // ----- step navigation -----
  function showStep(step) {
    currentStep = step;
    panels.forEach((p) =>
      p.classList.toggle("active", Number(p.dataset.panel) === step),
    );
    steps.forEach((s) => {
      const n = Number(s.dataset.step);
      s.classList.toggle("active", n === step);
      s.classList.toggle("done", n < step);
    });
    backBtn.classList.toggle("hidden", step === 1);
    nextBtn.classList.toggle("hidden", step === 4);
    submitBtn.classList.toggle("hidden", step !== 4);
    updateChecklist();
    if (step === 4) buildReview();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ----- validation per step -----
  function validateStep(step, displayErrors = true) {
    const panel = document.querySelector(`.step-panel[data-panel="${step}"]`);
    if (!panel) return true;
    let valid = true;
    const required = panel.querySelectorAll("[required]");
    required.forEach((field) => {
      if (displayErrors) clearError(field);
      if (field.type === "checkbox") {
        if (!field.checked) {
          valid = false;
          if (displayErrors) setError(field, "Please confirm");
        }
      } else if (!field.value.trim()) {
        valid = false;
        if (displayErrors) setError(field, "Required");
      }
    });

    // Step 3 password validation - only for new students
    if (step === 3 && !isReturning) {
      const pwd = document.getElementById("password");
      const cnf = document.getElementById("confirmPassword");
      const passwordField = document.getElementById("passwordField");

      // Only validate if password field is visible (not hidden for returning students)
      if (!passwordField.classList.contains("hidden")) {
        if (pwd.value.length < 8) {
          valid = false;
          if (displayErrors) setError(pwd, "Min 8 chars");
        }
        if (pwd.value !== cnf.value) {
          valid = false;
          if (displayErrors) setError(cnf, "Passwords do not match");
        }
      }
    }

    // Check if returning student is verified
    if (isReturning && step === 3) {
      if (!returningStudentVerified) {
        valid = false;
        if (displayErrors) {
          const err = document.getElementById("returningSearchError");
          if (err)
            err.textContent =
              "Please search and verify the returning student first.";
        }
      }
    }

    return valid;
  }

  function validateWithoutDisplay(step) {
    return validateStep(step, false);
  }

  function updateChecklist() {
    const checks = {
      student: validateWithoutDisplay(1),
      guardian: validateWithoutDisplay(2),
      enrollment: validateWithoutDisplay(3),
      review: document.getElementById("confirmDetails")?.checked === true,
    };
    document.querySelectorAll("[data-check]").forEach((el) => {
      const name = el.dataset.check;
      el.classList.toggle("completed", checks[name] || false);
    });
  }

  // ----- review builder -----
  function buildReview() {
    const fullName =
      [value("fname"), value("middlename"), value("lname")]
        .filter(Boolean)
        .join(" ") || "-";
    const html = `
        <div class="review-section"><h3>Student</h3>${row("Name", fullName)}${row("Gender", selectedText("gender"))}${row("DOB", value("dob"))}${row("Nationality", selectedText("nationality"))}</div>
        <div class="review-section"><h3>Guardian</h3>${row("Name", value("guardianFname") + " " + value("guardianLname") || "-")}${row("Relationship", selectedText("relationship"))}${row("Phone", value("guardian_phone"))}</div>
        <div class="review-section"><h3>Enrollment</h3>${row("Exam No", value("examno"))}${row("Class", selectedText("classid"))}${row("Status", "ACTIVE")}</div>
        <div class="review-section full"><h3>Address</h3><div>${value("address") || "-"}</div></div>
      `;
    reviewContent.innerHTML = html;
  }
  function row(label, text) {
    return `<div class="review-row"><span>${label}</span><strong>${text || "-"}</strong></div>`;
  }

  // ----- Returning student search -----
  returningExamno.addEventListener("input", () => {
    returningStudentVerified = false;
    returningResult.classList.add("hidden");
    document.getElementById("returningSearchError").textContent = "";
  });

  findBtn?.addEventListener("click", async () => {
    const exam = returningExamno.value.trim();
    const err = document.getElementById("returningSearchError");

    if (!exam) {
      err.textContent = "Please enter examination number";
      return;
    }

    err.textContent = "";
    findBtn.disabled = true;
    findBtn.textContent = "Searching...";

    try {
      const response = await fetch(
        `/register/returning/search?examno=${encodeURIComponent(exam)}`,
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Student not found");
      }
      populateReturningStudent(result.student);
    } catch (error) {
      returningResult.classList.add("hidden");
      err.textContent = error.message || "Unable to find student.";
    } finally {
      findBtn.disabled = false;
      findBtn.textContent = "Search";
    }
  });

  function populateReturningStudent(student) {
    returningStudentVerified = true;
    returningResult.classList.remove("hidden");

    document.getElementById("returningName").textContent =
      `${student.fname} ${student.lname}`;
    document.getElementById("returningExamDisplay").textContent =
      student.examno;
    document.getElementById("returningClass").textContent =
      student.levelname + student.class || "Not enrolled";
    document.getElementById("returningStatus").textContent =
      student.status || "Active";
    document.getElementById("rExam").textContent = student.examno;
    document.getElementById("rFname").textContent = student.fname;
    document.getElementById("rLname").textContent = student.lname;
    document.getElementById("rGender").textContent = student.gender;
    document.getElementById("rDob").textContent = student.dob.slice(0, 10);

    // Prefill existing student information
    document.getElementById("fname").value = student.fname || "";
    document.getElementById("middlename").value = student.middlename || "";
    document.getElementById("lname").value = student.lname || "";
    document.getElementById("gender").value = student.gender || "";
    document.getElementById("email").value = student.email || "";
    document.getElementById("studentPhoneNumber").value =
      student.studentPhoneNumber || "";
    document.getElementById("dob").value = student.dob.slice(0, 10) || "";
    document.getElementById("birthplace").value = student.birthplace || "";
    document.getElementById("nationality").value = student.nationality || "";
    document.getElementById("religion").value = student.religion || "";
    document.getElementById("studentnrcno").value = student.studentnrcno || "";
    document.getElementById("previous_school").value =
      student.previous_school || "";
    document.getElementById("address").value = student.address || "";
    document.getElementById("examno").value = student.examno;
    document.getElementById("schoolyear").value = student.schoolyearid || "";
    document.getElementById("termid").value = student.termid || "";
    document.getElementById("selectedClass").value = student.classid || "";
    document.getElementById("studentstatus").value =
      student.studentStatusID || "";
    document.getElementById("sponsor").value = student.sponsorID || "";
    document.getElementById("ovcstatus").value = student.ovcstatusid || "";
    document.getElementById("guardianFname").value =
      student.guardianFname || "";
    document.getElementById("guardianLname").value =
      student.guardianLname || "";
    document.getElementById("relationship").value =
      student.guardiantypeid || "";
    document.getElementById("guardian_nrc_no").value =
      student.guardian_nrc_no || "";
    document.getElementById("guardian_phone").value = student.phoneNumber || "";
    document.getElementById("guardian_email").value =
      student.guardian_email || "";
    document.getElementById("guardian_occupation").value =
      student.guardian_occupation || "";
    document.getElementById("guardian_address").value =
      student.guardian_address || "";
    document.getElementById("yearlevel").value = student.levelid || "";

    // Clear password fields for returning students
    document.getElementById("password").value = "";
    document.getElementById("confirmPassword").value = "";

    // Set admission type
    document.getElementById("admissionType").value = "returning";
    isReturning = true;

    // Update the UI to show returning mode
    setAdmissionType("returning");
  }

  // ----- Credentials configuration -----
  function configureCredentialsForReturning() {
    const password = document.getElementById("password");
    const confirmPassword = document.getElementById("confirmPassword");
    const passwordField = document.getElementById("passwordField");
    const confirmPasswordField = document.getElementById(
      "confirmPasswordField",
    );
    //const examnoField = document.getElementById("examon")

    // Remove required attribute from DOM
    password.removeAttribute("required");
    confirmPassword.removeAttribute("required");
    //examnoField.setAttribute('readonly', true);

    // Hide the fields
    passwordField.classList.add("hidden");
    confirmPasswordField.classList.add("hidden");

    // Clear any values
    password.value = "";
    confirmPassword.value = "";
  }

  function configureCredentialsForNew() {
    const password = document.getElementById("password");
    const confirmPassword = document.getElementById("confirmPassword");
    const passwordField = document.getElementById("passwordField");
    const confirmPasswordField = document.getElementById(
      "confirmPasswordField",
    );

    // Add required attribute
    password.setAttribute("required", "");
    confirmPassword.setAttribute("required", "");

    // Show the fields
    passwordField.classList.remove("hidden");
    confirmPasswordField.classList.remove("hidden");

    // Clear any values
    password.value = "";
    confirmPassword.value = "";
  }

  function setAdmissionType(type) {
    isReturning = type === "returning";
    admissionTypeHidden.value = type;
    returningPanel.classList.toggle("hidden", !isReturning);

    if (!isReturning) {
      returningResult.classList.add("hidden");
      configureCredentialsForNew();
    } else {
      configureCredentialsForReturning();
    }

    const label = isReturning ? "RETURNING" : "NEW STUDENT";
    regTypeLabel.textContent = label;
    summaryType.textContent = label;
    summaryType.className = `badge ${isReturning ? "badge-outline" : "badge-green"}`;

    document.querySelectorAll(".admission-type").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.type === type);
    });
  }

  // ----- Event listeners -----

  // Admission selector
  admissionSelector?.addEventListener("click", (e) => {
    const btn = e.target.closest(".admission-type");
    if (!btn) return;
    setAdmissionType(btn.dataset.type);
  });

  // Stepper click
  steps.forEach((step) => {
    step.addEventListener("click", () => {
      const target = Number(step.dataset.step);
      if (target < currentStep) {
        showStep(target);
        return;
      }
      let canMove = true;
      for (let i = currentStep; i < target; i++) {
        if (!validateStep(i, true)) {
          canMove = false;
          showStep(i);
          break;
        }
      }
      if (canMove) showStep(target);
    });
  });

  nextBtn?.addEventListener("click", () => {
    if (!validateStep(currentStep, true)) return;
    showStep(Math.min(4, currentStep + 1));
  });

  backBtn?.addEventListener("click", () =>
    showStep(Math.max(1, currentStep - 1)),
  );

  cancelBtn?.addEventListener("click", () => {
    if (confirm("Cancel registration? Unsaved data will be lost."))
      window.location.href = "/register";
  });

  // Class selection
  classSelect?.addEventListener("change", () => {
    summaryClass.textContent = selectedText("selectedClass");
    updateChecklist();
  });

  document
    .getElementById("selectedClass")
    ?.addEventListener("change", function () {
      var selectedOption = this.options[this.selectedIndex];
      var yearlevel = selectedOption.getAttribute("data-levelid");
      document.getElementById("yearlevel").value = yearlevel;
    });

  // ----- PHOTO UPLOAD -----
  uploadBox?.addEventListener("click", (e) => {
    e.stopPropagation();
    photoInput?.click();
  });

  uploadBox?.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadBox.style.borderColor = "var(--blue)";
    uploadBox.style.background = "var(--blue-light)";
  });

  uploadBox?.addEventListener("dragleave", (e) => {
    e.preventDefault();
    uploadBox.style.borderColor = "#b7c4d5";
    uploadBox.style.background = "#fbfcfe";
  });

  uploadBox?.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadBox.style.borderColor = "#b7c4d5";
    uploadBox.style.background = "#fbfcfe";

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      photoInput.files = files;
      photoInput.dispatchEvent(new Event("change"));
    }
  });

  photoInput?.addEventListener("change", () => {
    const file = photoInput.files?.[0];
    if (!file) {
      photoPreview.innerHTML = "📷";
      return;
    }

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      alert("Please upload a JPG or PNG image.");
      photoInput.value = "";
      photoPreview.innerHTML = "📷";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("File size must be less than 2MB.");
      photoInput.value = "";
      photoPreview.innerHTML = "📷";
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      photoPreview.innerHTML = `<img src="${e.target.result}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
    };
    reader.onerror = () => {
      alert("Error reading file. Please try again.");
      photoInput.value = "";
      photoPreview.innerHTML = "📷";
    };
    reader.readAsDataURL(file);
  });

  // Password toggle
  document.querySelectorAll(".password-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = document.getElementById(btn.dataset.target);
      if (!target) return;
      target.type = target.type === "password" ? "text" : "password";
    });
  });

  // Confirm checkbox update
  document
    .getElementById("confirmDetails")
    ?.addEventListener("change", updateChecklist);
  document.addEventListener("input", updateChecklist);
  document.addEventListener("change", updateChecklist);

  // ----- Form submission -----

  // form.addEventListener("submit", async (e) => {
  //   e.preventDefault();

  //   // =========================================================
  //   // Validate all steps
  //   // =========================================================

  //   for (let i = 1; i <= 4; i++) {
  //     if (!validateStep(i, true)) {
  //       showStep(i);
  //       return;
  //     }
  //   }

  //   // =========================================================
  //   // Password validation
  //   // Only required for NEW students
  //   // =========================================================

  //   if (!isReturning) {
  //     const pwd = document.getElementById("password");

  //     const cnf = document.getElementById("confirmPassword");

  //     if (pwd.value !== cnf.value) {
  //       showStep(3);

  //       setError(cnf, "Passwords do not match.");

  //       return;
  //     }

  //     if (pwd.value.length < 8) {
  //       showStep(3);

  //       setError(pwd, "Password must be at least 8 characters.");

  //       return;
  //     }
  //   }

  //   // =========================================================
  //   // Determine registration route
  //   // =========================================================

  //   const registerURL = isReturning ? "/registerReturningPupils" : "/register";

  //   // =========================================================
  //   // Disable submit button
  //   // =========================================================

  //   submitBtn.disabled = true;

  //   submitBtn.textContent = isReturning ? "Registering returning student..." : "Registering...";

  //   try {
  //     const formData = new FormData(form);

  //     const response = await fetch(registerURL, {
  //       method: "POST",
  //       body: formData,
  //     });

  //     // =======================================================
  //     // Parse response
  //     // =======================================================

  //     const result = await response.json();

  //     // =======================================================
  //     // Success
  //     // =======================================================

  //     if (response.ok) {
  //       alert(
  //         result.message ||
  //           (isReturning
  //             ? "Returning student successfully registered!"
  //             : "Student successfully registered!"),
  //       );

  //       window.location.href = "/register";

  //       return;
  //     }

  //     // =======================================================
  //     // Server validation / registration error
  //     // =======================================================

  //     alert(result.message || "Registration failed. Please try again.");

  //     submitBtn.disabled = false;

  //     submitBtn.textContent = "✓ Register Student";
  //   } catch (error) {
  //     console.error("Registration error:", error);

  //     alert("An error occurred during registration. Please try again.");

  //     submitBtn.disabled = false;

  //     submitBtn.textContent = "✓ Register Student";
  //   }
  // });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // =========================================================
    // Validate all steps
    // =========================================================
    for (let i = 1; i <= 4; i++) {
        if (!validateStep(i, true)) {
            showStep(i);
            return;
        }
    }

    // =========================================================
    // Password validation - only for NEW students
    // =========================================================
    if (!isReturning) {
        const pwd = document.getElementById("password");
        const cnf = document.getElementById("confirmPassword");

        if (pwd.value !== cnf.value) {
            showStep(3);
            setError(cnf, "Passwords do not match.");
            return;
        }

        if (pwd.value.length < 8) {
            showStep(3);
            setError(pwd, "Password must be at least 8 characters.");
            return;
        }
    }

    // =========================================================
    // Determine registration route
    // =========================================================
    const registerURL = isReturning ? "/registerReturningPupils" : "/register";

    // =========================================================
    // Disable submit button
    // =========================================================
    submitBtn.disabled = true;
    submitBtn.textContent = isReturning ? "Registering returning student..." : "Registering...";

    try {
        let body;
        let headers = {};  // Start with empty headers

        if (isReturning) {
           const payload = {
                examno: document.getElementById("returningExamno").value.trim(),
                classid: document.getElementById("selectedClass").value,
                schoolyear: document.getElementById("schoolyear").value,
                termid: document.getElementById("termid").value,
                studentstatus: document.getElementById("studentstatus").value,
                sponsor: document.getElementById("sponsor").value,
                ovcstatus: document.getElementById("ovcstatus").value,
                enrollment_type: "returning",
                guardianFname: document.getElementById("guardianFname").value,
                guardianLname: document.getElementById("guardianLname").value,
                relationship: document.getElementById("relationship").value,
                guardian_nrc_no: document.getElementById("guardian_nrc_no").value,
                phoneNumber: document.getElementById("guardian_phone").value,
                guardian_email: document.getElementById("guardian_email").value,
                guardian_occupation: document.getElementById("guardian_occupation").value,
                guardian_address: document.getElementById("guardian_address").value,
            };
            
            body = JSON.stringify(payload);
            headers['Content-Type'] = 'application/json';  // ✅ SET for JSON
            
        } else {
            // ✅ For new students - send ALL form data
             body = new FormData(form);
        }

        // ✅ Make the request
        const response = await fetch(registerURL, {
            method: "POST",
            headers: headers,  // ✅ headers for JSON, empty for FormData
            body: body,
        });

        const result = await response.json();

        if (response.ok) {
            alert(
                result.message ||
                (isReturning
                    ? "Returning student successfully registered!"
                    : "Student successfully registered!"),
            );
            window.location.href = "/register";
            return;
        }

        alert(result.message || "Registration failed. Please try again.");
        submitBtn.disabled = false;
        submitBtn.textContent = "✓ Register Student";
        
    } catch (error) {
        console.error("Registration error:", error);
        alert("An error occurred during registration. Please try again.");
        submitBtn.disabled = false;
        submitBtn.textContent = "✓ Register Student";
    }
});

  // ----- Initialization -----
  setAdmissionType("new");
  showStep(1);
})();
