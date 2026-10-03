(() => {
  "use strict";

  /*
   * =========================================================
   * ELEMENT HELPERS
   * =========================================================
   */

  const $ = (selector, parent = document) => parent.querySelector(selector);

  const $$ = (selector, parent = document) => [
    ...parent.querySelectorAll(selector),
  ];

  /*
   * =========================================================
   * HEADER
   * =========================================================
   */

  const header = $("#siteHeader");
  const mobileButton = $("#mobileMenuButton");
  const mobileNavigation = $("#mobileNavigation");

  function updateHeader() {
    if (!header) {
      return;
    }

    header.classList.toggle("scrolled", window.scrollY > 20);
  }

  window.addEventListener("scroll", updateHeader, { passive: true });

  updateHeader();

  /*
   * =========================================================
   * MOBILE NAVIGATION
   * =========================================================
   */

  if (mobileButton && mobileNavigation) {
    mobileButton.addEventListener("click", () => {
      const isOpen = mobileNavigation.classList.toggle("open");

      mobileButton.setAttribute("aria-expanded", String(isOpen));

      mobileButton.setAttribute(
        "aria-label",
        isOpen ? "Close navigation menu" : "Open navigation menu",
      );
    });

    $$(".mobile-navigation a").forEach((link) => {
      link.addEventListener("click", () => {
        mobileNavigation.classList.remove("open");

        mobileButton.setAttribute("aria-expanded", "false");

        mobileButton.setAttribute("aria-label", "Open navigation menu");
      });
    });
  }

  /*
   * =========================================================
   * ACTIVE NAVIGATION
   * =========================================================
   */

  const sections = $$("main section[id]");
  const navLinks = $$(".nav-link");

  if (sections.length && navLinks.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          const id = entry.target.id;

          navLinks.forEach((link) => {
            const href = link.getAttribute("href");

            link.classList.toggle("active", href === `#${id}`);
          });
        });
      },
      {
        rootMargin: "-30% 0px -60% 0px",
      },
    );

    sections.forEach((section) => {
      observer.observe(section);
    });
  }

  /*
   * =========================================================
   * SMOOTH INTERNAL LINKS
   * =========================================================
   */

  $$('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");

      if (!href || href === "#" || href.length < 2) {
        return;
      }

      const target = $(href);

      if (!target) {
        return;
      }

      event.preventDefault();

      target.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",

        block: "start",
      });
    });
  });

  /*
   * =========================================================
   * COUNTERS
   * =========================================================
   */

  const counters = $$(".counter");

  if (counters.length) {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          const element = entry.target;

          if (element.dataset.animated === "true") {
            return;
          }

          element.dataset.animated = "true";

          const target = Number(element.dataset.target);

          animateCounter(element, target);

          counterObserver.unobserve(element);
        });
      },
      {
        threshold: 0.4,
      },
    );

    counters.forEach((counter) => {
      counterObserver.observe(counter);
    });
  }

  function animateCounter(element, target) {
    const duration = 1000;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;

      const progress = Math.min(elapsed / duration, 1);

      const eased = 1 - Math.pow(1 - progress, 3);

      element.textContent = Math.floor(target * eased);

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent = target;
      }
    }

    requestAnimationFrame(update);
  }

  /*
   * =========================================================
   * FAQ
   * =========================================================
   */

  $$(".faq-question").forEach((button) => {
    button.addEventListener("click", () => {
      const item = button.closest(".faq-item");

      if (!item) {
        return;
      }

      const isOpen = item.classList.contains("open");

      /*
       * Close other questions
       */

      $$(".faq-item").forEach((otherItem) => {
        if (otherItem !== item) {
          otherItem.classList.remove("open");

          const otherButton = $(".faq-question", otherItem);

          if (otherButton) {
            otherButton.setAttribute("aria-expanded", "false");
          }
        }
      });

      /*
       * Toggle current question
       */

      item.classList.toggle("open", !isOpen);

      button.setAttribute("aria-expanded", String(!isOpen));
    });
  });

  /*
   * =========================================================
   * CONTACT FORM
   * =========================================================
   */

  const contactForm = $("#contactForm");
  const formMessage = $("#formMessage");
  const formSubmit = $("#formSubmit");
  const messageInput = $("#message");
  const characterCount = $("#characterCount");

  /*
   * Only access form fields if the form exists.
   */

  const fields = contactForm
    ? $$("input:not([type='hidden']), select, textarea", contactForm)
    : [];

  /*
   * Honeypot
   */

  const honeypot = contactForm ? $("#companyWebsite", contactForm) : null;

  /*
   * Character counter
   */

  if (messageInput && characterCount) {
    const updateCharacterCount = () => {
      characterCount.textContent = messageInput.value.length;
    };

    messageInput.addEventListener("input", updateCharacterCount);

    updateCharacterCount();
  }

  /*
   * =========================================================
   * FIELD VALIDATION
   * =========================================================
   */

  function validateField(field) {
    if (!field) {
      return true;
    }

    const value = field.value.trim();

    let valid = true;

    /*
     * Required fields
     */

    if (field.required && !value) {
      valid = false;
    }

    /*
     * Email validation
     */

    if (field.type === "email" && value) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      valid = emailPattern.test(value);
    }

    /*
     * Apply validation class
     */

    field.classList.toggle("invalid", !valid);

    return valid;
  }

  /*
   * =========================================================
   * CONTACT FORM SUBMISSION
   * =========================================================
   */

  if (contactForm) {
    contactForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      clearFormMessage();

      /*
       * =================================================
       * HONEYPOT CHECK
       * =================================================
       */

      if (honeypot && honeypot.value.trim() !== "") {
        showFormMessage("Your enquiry could not be submitted.", "error");

        return;
      }

      /*
       * =================================================
       * VALIDATE REAL FORM FIELDS
       * =================================================
       */

      const valid = fields.every(validateField);

      if (!valid) {
        showFormMessage(
          "Please complete all required fields correctly.",
          "error",
        );

        const firstInvalid = $(".invalid", contactForm);

        if (firstInvalid) {
          firstInvalid.focus();
        }

        return;
      }

      /*
       * =================================================
       * ADDITIONAL VALIDATION
       * =================================================
       */

      const nameInput = $("#name", contactForm);

      const emailInput = $("#email", contactForm);

      const subjectInput = $("#subject", contactForm);

      const messageInput = $("#message", contactForm);

      const name = nameInput ? nameInput.value.trim() : "";

      const email = emailInput ? emailInput.value.trim() : "";

      const subject = subjectInput ? subjectInput.value.trim() : "";

      const message = messageInput ? messageInput.value.trim() : "";

      if (name.length < 2 || name.length > 100) {
        showFormMessage("Please enter a valid name.", "error");

        if (nameInput) {
          nameInput.focus();
        }

        return;
      }

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showFormMessage("Please enter a valid email address.", "error");

        if (emailInput) {
          emailInput.focus();
        }

        return;
      }

      if (!subject) {
        showFormMessage("Please select an enquiry type.", "error");

        if (subjectInput) {
          subjectInput.focus();
        }

        return;
      }

      if (message.length < 10 || message.length > 1000) {
        showFormMessage(
          "Your message must be between 10 and 1000 characters.",
          "error",
        );

        if (messageInput) {
          messageInput.focus();
        }

        return;
      }

      /*
       * =================================================
       * DISABLE SUBMIT BUTTON
       * =================================================
       */

      if (formSubmit) {
        formSubmit.disabled = true;
      }

      const submitText = formSubmit ? $("span:first-child", formSubmit) : null;

      const originalText = submitText ? submitText.textContent : "Send Enquiry";

      if (submitText) {
        submitText.textContent = "Sending...";
      }

      /*
       * =================================================
       * SEND REQUEST
       * =================================================
       */

      try {
        const formData = new FormData(contactForm);

        const payload = Object.fromEntries(formData.entries());

        const response = await fetch("/contact", {
          method: "POST",

          credentials: "same-origin",

          headers: {
            Accept: "application/json",

            "Content-Type": "application/json",
          },

          body: JSON.stringify(payload),
        });

        /*
         * Safely parse response
         */

        let data = null;

        try {
          data = await response.json();
        } catch (parseError) {
          throw new Error("The server returned an invalid response.");
        }

        /*
         * =================================================
         * RESPONSE CHECK
         * =================================================
         */

        if (!response.ok || !data || data.success !== true) {
          throw new Error(data?.message || "Unable to send your enquiry.");
        }

        /*
         * =================================================
         * SUCCESS
         * =================================================
         */

        showFormMessage(
          data.message || "Your enquiry has been sent successfully.",
          "success",
        );

        contactForm.reset();

        if (characterCount) {
          characterCount.textContent = "0";
        }

        fields.forEach((field) => {
          field.classList.remove("invalid");
        });
      } catch (error) {
        showFormMessage(
          error.message ||
            "We could not send your enquiry. Please try again later.",
          "error",
        );
      } finally {
        if (formSubmit) {
          formSubmit.disabled = false;
        }

        if (submitText) {
          submitText.textContent = originalText;
        }
      }
    });

    /*
     * =========================================================
     * VALIDATE ON BLUR
     * =========================================================
     */

    fields.forEach((field) => {
      field.addEventListener("blur", () => validateField(field));
    });
  }

  /*
   * =========================================================
   * FORM MESSAGE
   * =========================================================
   */

  function showFormMessage(message, type) {
    if (!formMessage) {
      return;
    }

    formMessage.textContent = message;

    formMessage.className = `form-message ${type}`;
  }

  function clearFormMessage() {
    if (!formMessage) {
      return;
    }

    formMessage.textContent = "";

    formMessage.className = "form-message";
  }

  /*
   * =========================================================
   * BACK TO TOP
   * =========================================================
   */

  const backToTop = $("#backToTop");

  if (backToTop) {
    window.addEventListener(
      "scroll",
      () => {
        backToTop.classList.toggle("visible", window.scrollY > 600);
      },
      {
        passive: true,
      },
    );

    backToTop.addEventListener("click", () => {
      window.scrollTo({
        top: 0,

        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
      });
    });
  }

  /*
   * =========================================================
   * CURRENT YEAR
   * =========================================================
   */

  const yearElement = $("#currentYear");

  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  /*
   * =========================================================
   * IMAGE FALLBACK
   * =========================================================
   */

  $$("img").forEach((image) => {
    image.addEventListener(
      "error",
      () => {
        image.classList.add("image-load-error");
      },
      {
        once: true,
      },
    );
  });

  /*
   * =========================================================
   * LOGIN DROPDOWN
   * =========================================================
   */

  const loginDropdown = $(".login-dropdown");

  const loginDropdownButton = $("#loginDropdownButton");

  if (loginDropdown && loginDropdownButton) {
    const loginMenu = $("#loginDropdownMenu");

    function closeLoginDropdown() {
      loginDropdown.classList.remove("open");

      loginDropdownButton.setAttribute("aria-expanded", "false");
    }

    function toggleLoginDropdown() {
      const isOpen = loginDropdown.classList.contains("open");

      if (isOpen) {
        closeLoginDropdown();
      } else {
        loginDropdown.classList.add("open");

        loginDropdownButton.setAttribute("aria-expanded", "true");
      }
    }

    loginDropdownButton.addEventListener("click", (event) => {
      event.stopPropagation();

      toggleLoginDropdown();
    });

    document.addEventListener("click", (event) => {
      if (!loginDropdown.contains(event.target)) {
        closeLoginDropdown();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeLoginDropdown();

        loginDropdownButton.focus();
      }
    });

    if (loginMenu) {
      loginMenu.addEventListener("click", (event) => {
        event.stopPropagation();
      });
    }
  }

  /*
   * =========================================================
   * NOTIFICATION BAR
   * =========================================================
   */

  const notificationBar = $(".notification-bar");

  const notificationTrack = $("#notificationTrack");

  const notificationControl = $("#notificationControl");

  if (notificationBar && notificationTrack && notificationControl) {
    /*
     * PAUSE / PLAY
     */

    notificationControl.addEventListener("click", () => {
      const isPaused = notificationBar.classList.toggle("is-paused");

      notificationControl.setAttribute(
        "aria-label",
        isPaused ? "Play announcements" : "Pause announcements",
      );

      notificationControl.setAttribute(
        "title",
        isPaused ? "Play announcements" : "Pause announcements",
      );

      notificationTrack.style.animationPlayState = isPaused
        ? "paused"
        : "running";
    });

    /*
     * PAUSE WHEN TAB IS HIDDEN
     */

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        notificationTrack.style.animationPlayState = "paused";
      } else if (!notificationBar.classList.contains("is-paused")) {
        notificationTrack.style.animationPlayState = "running";
      }
    });
  }
})();
