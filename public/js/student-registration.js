(() => {
  'use strict';

  const form = document.getElementById('registrationForm');
  if (!form) return;

  const panels = [...document.querySelectorAll('.step-panel')];
  const steps = [...document.querySelectorAll('.step')];
  const nextBtn = document.getElementById('nextBtn');
  const backBtn = document.getElementById('backBtn');
  const submitBtn = document.getElementById('submitBtn');
  const cancelBtn = document.getElementById('cancelBtn');
  const reviewContent = document.getElementById('reviewContent');
  const yearLevel = document.getElementById('yearlevel');
  const classSelect = document.getElementById('classid');
  const summaryClass = document.getElementById('summaryClass');
  const photoInput = document.getElementById('profilePicture');
  const photoPreview = document.getElementById('photoPreview');
  const menuBtn = document.getElementById('menuBtn');
  const sidebar = document.getElementById('sidebar');

  let currentStep = 1;

  const value = (id) => {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
  };

  function showStep(step) {
    currentStep = step;

    panels.forEach(panel => {
      panel.classList.toggle('active', Number(panel.dataset.panel) === step);
    });

    steps.forEach(item => {
      const number = Number(item.dataset.step);
      item.classList.toggle('active', number === step);
      item.classList.toggle('done', number < step);
    });

    backBtn.classList.toggle('hidden', step === 1);
    nextBtn.classList.toggle('hidden', step === 4);
    submitBtn.classList.toggle('hidden', step !== 4);

    updateChecklist();
    if (step === 4) buildReview();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function setError(field, message) {
    const wrapper = field.closest('.field');
    if (!wrapper) return;
    wrapper.classList.add('invalid');
    const error = wrapper.querySelector('.field-error');
    if (error) error.textContent = message;
  }

  function clearError(field) {
    const wrapper = field.closest('.field');
    if (!wrapper) return;
    wrapper.classList.remove('invalid');
    const error = wrapper.querySelector('.field-error');
    if (error) error.textContent = '';
  }

  function validateStep(step) {
    const panel = document.querySelector(`.step-panel[data-panel="${step}"]`);
    if (!panel) return true;

    let valid = true;
    const required = [...panel.querySelectorAll('[required]')];

    required.forEach(field => {
      clearError(field);
      if (field.type === 'checkbox') {
        if (!field.checked) {
          valid = false;
          setError(field, 'Please confirm this item.');
        }
      } else if (!field.value.trim()) {
        valid = false;
        setError(field, 'This field is required.');
      }
    });

    if (step === 1) {
      const dob = document.getElementById('dob');
      if (dob && dob.value) {
        const date = new Date(`${dob.value}T00:00:00`);
        const today = new Date();
        if (date > today) {
          valid = false;
          setError(dob, 'Date of birth cannot be in the future.');
        }
      }
    }

    if (step === 2) {
      const guardianPhone = document.getElementById('guardian_phone');
      if (guardianPhone && guardianPhone.value && !/^[0-9+\-\s()]{7,20}$/.test(guardianPhone.value)) {
        valid = false;
        setError(guardianPhone, 'Enter a valid phone number.');
      }
    }

    if (step === 3) {
      const password = document.getElementById('password');
      const confirm = document.getElementById('confirmPassword');

      if (password.value.length < 8) {
        valid = false;
        setError(password, 'Password must contain at least 8 characters.');
      }

      if (password.value !== confirm.value) {
        valid = false;
        setError(confirm, 'Passwords do not match.');
      }
    }

    return valid;
  }

  function updateChecklist() {
    const checks = {
      student: validateWithoutDisplaying(1),
      guardian: validateWithoutDisplaying(2),
      enrollment: validateWithoutDisplaying(3),
      review: document.getElementById('confirmDetails')?.checked === true
    };

    Object.entries(checks).forEach(([name, completed]) => {
      const item = document.querySelector(`[data-check="${name}"]`);
      if (item) item.classList.toggle('completed', completed);
    });
  }

  function validateWithoutDisplaying(step) {
    const panel = document.querySelector(`.step-panel[data-panel="${step}"]`);
    if (!panel) return false;

    return [...panel.querySelectorAll('[required]')].every(field => {
      if (field.type === 'checkbox') return field.checked;
      return Boolean(field.value.trim());
    });
  }

  function selectedText(id) {
    const select = document.getElementById(id);
    if (!select || select.selectedIndex < 0) return '-';
    return select.options[select.selectedIndex].textContent.trim() || '-';
  }

  function buildReview() {
    const fullName = [value('fname'), value('middlename'), value('lname')]
      .filter(Boolean).join(' ');

    const html = `
      <div class="review-grid">
        <div class="review-section">
          <h3>Student</h3>
          ${row('Full Name', fullName || '-')}
          ${row('Gender', selectedText('gender'))}
          ${row('Date of Birth', value('dob') || '-')}
          ${row('Nationality', selectedText('nationality'))}
          ${row('NRC / Birth Certificate', value('nrcno') || '-')}
        </div>
        <div class="review-section">
          <h3>Guardian</h3>
          ${row('Name', value('guardian_name') || '-')}
          ${row('Relationship', selectedText('relationship'))}
          ${row('Phone', value('guardian_phone') || '-')}
          ${row('Email', value('guardian_email') || '-')}
        </div>
        <div class="review-section">
          <h3>Enrollment</h3>
          ${row('Exam Number', value('examno') || '-')}
          ${row('Academic Year', document.getElementById('summaryYear')?.textContent.trim() || '-')}
          ${row('Term', document.getElementById('summaryTerm')?.textContent.trim() || '-')}
          ${row('Class', selectedText('classid'))}
        </div>
        <div class="review-section">
          <h3>System Status</h3>
          ${row('Student Status', 'ACTIVE')}
          ${row('Enrollment', 'NEW')}
          ${row('Reporting', 'REPORTED')}
          ${row('Reporting Date', 'Database CURRENT_TIMESTAMP')}
        </div>
        <div class="review-section full">
          <h3>Address</h3>
          <div>${escapeHtml(value('address') || '-')}</div>
        </div>
      </div>
    `;

    reviewContent.innerHTML = html;
  }

  function row(label, text) {
    return `<div class="review-row"><span>${escapeHtml(label)}</span><strong>${escapeHtml(text)}</strong></div>`;
  }

  function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, ch => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
    }[ch]));
  }

  yearLevel?.addEventListener('change', () => {
    const selected = yearLevel.options[yearLevel.selectedIndex];
    const levelId = selected?.dataset.levelId || selected?.value || '';

    classSelect.disabled = !levelId;
    classSelect.value = '';

    [...classSelect.options].forEach(option => {
      if (!option.value) {
        option.hidden = false;
        return;
      }
      option.hidden = option.dataset.levelId !== levelId;
    });

    classSelect.options[0].textContent = levelId
      ? 'Select class'
      : 'Select year level first';

    summaryClass.textContent = 'Not selected';
    updateChecklist();
  });

  classSelect?.addEventListener('change', () => {
    summaryClass.textContent = selectedText('classid');
    updateChecklist();
  });

  photoInput?.addEventListener('change', () => {
    const file = photoInput.files?.[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png'];
    if (!allowed.includes(file.type)) {
      photoInput.value = '';
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      photoInput.value = '';
      return;
    }

    const reader = new FileReader();
    reader.addEventListener('load', () => {
      photoPreview.innerHTML = `<img src="${reader.result}" alt="Profile preview">`;
    });
    reader.readAsDataURL(file);
  });

  document.querySelectorAll('.password-toggle').forEach(button => {
    button.addEventListener('click', () => {
      const target = document.getElementById(button.dataset.target);
      if (!target) return;

      const show = target.type === 'password';
      target.type = show ? 'text' : 'password';
      button.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    });
  });

  steps.forEach(step => {
    step.addEventListener('click', () => {
      const target = Number(step.dataset.step);
      if (target < currentStep) {
        showStep(target);
      } else if (target === currentStep) {
        return;
      } else {
        let canMove = true;
        for (let i = currentStep; i < target; i++) {
          if (!validateStep(i)) {
            canMove = false;
            showStep(i);
            break;
          }
        }
        if (canMove) showStep(target);
      }
    });
  });

  nextBtn?.addEventListener('click', () => {
    if (!validateStep(currentStep)) return;
    showStep(Math.min(4, currentStep + 1));
  });

  backBtn?.addEventListener('click', () => {
    showStep(Math.max(1, currentStep - 1));
  });

  document.getElementById('confirmDetails')?.addEventListener('change', updateChecklist);

  cancelBtn?.addEventListener('click', () => {
    if (window.confirm('Cancel student registration? Unsaved information will be lost.')) {
      window.location.href = '/students';
    }
  });

  form.addEventListener('submit', event => {
    for (let step = 1; step <= 4; step++) {
      if (!validateStep(step)) {
        event.preventDefault();
        showStep(step);
        return;
      }
    }

    const password = document.getElementById('password');
    const confirm = document.getElementById('confirmPassword');

    if (password.value !== confirm.value) {
      event.preventDefault();
      showStep(3);
      setError(confirm, 'Passwords do not match.');
      return;
    }

    const submitted = submitBtn;
    submitted.disabled = true;
    submitted.textContent = 'Registering...';
  });

  menuBtn?.addEventListener('click', () => {
    sidebar?.classList.toggle('open');
  });

  document.addEventListener('input', updateChecklist);
  document.addEventListener('change', updateChecklist);

  showStep(1);
})();
