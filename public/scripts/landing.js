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

    if (window.scrollY > 20) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
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
       * Close other questions.
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
       * Toggle current question.
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

  if (messageInput && characterCount) {
    const updateCharacterCount = () => {
      characterCount.textContent = messageInput.value.length;
    };

    messageInput.addEventListener("input", updateCharacterCount);

    updateCharacterCount();
  }

  /*
   * Client-side validation.
   *
   * IMPORTANT:
   * Server-side validation must ALSO be implemented.
   */

  function validateField(field) {
    if (!field) {
      return true;
    }

    const value = field.value.trim();

    let valid = true;

    if (field.required && !value) {
      valid = false;
    }

    if (field.type === "email" && value) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      valid = emailPattern.test(value);
    }

    field.classList.toggle("invalid", !valid);

    return valid;
  }

  if (contactForm) {
    contactForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      clearFormMessage();

      /*
       * Honeypot protection.
       */
      const honeypot = $("#website");

      if (honeypot && honeypot.value.trim() !== "") {
        showFormMessage("Your enquiry could not be submitted.", "error");

        return;
      }

      const fields = [$("#name"), $("#email"), $("#subject"), $("#message")];

      const valid = fields.every(validateField);

      if (!valid) {
        showFormMessage(
          "Please complete all required fields correctly.",
          "error",
        );

        const firstInvalid = $(".invalid");

        if (firstInvalid) {
          firstInvalid.focus();
        }

        return;
      }

      /*
       * Additional length checks.
       */
      const name = $("#name").value.trim();

      const message = $("#message").value.trim();

      if (name.length < 2 || name.length > 100) {
        showFormMessage("Please enter a valid name.", "error");

        return;
      }

      if (message.length < 10 || message.length > 1000) {
        showFormMessage(
          "Your message must be between 10 and 1000 characters.",
          "error",
        );

        return;
      }

      /*
       * Disable submission while sending.
       */
      formSubmit.disabled = true;

      const submitText = $("span:first-child", formSubmit);

      const originalText = submitText ? submitText.textContent : "Send Enquiry";

      if (submitText) {
        submitText.textContent = "Sending...";
      }

      try {
        const formData = new FormData(contactForm);

        const response = await fetch(contactForm.action, {
          method: "POST",
          body: formData,
          credentials: "same-origin",
          headers: {
            Accept: "application/json",
          },
        });

        /*
         * Do not trust HTTP 200 alone.
         */
        let data = null;

        try {
          data = await response.json();
        } catch {
          data = null;
        }

        if (!response.ok || !data || data.success !== true) {
          throw new Error(data?.message || "Unable to send your enquiry.");
        }

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
        /*
         * Do not expose technical errors
         * to public users.
         */
        showFormMessage(
          "We could not send your enquiry. Please try again later.",
          "error",
        );
      } finally {
        formSubmit.disabled = false;

        if (submitText) {
          submitText.textContent = originalText;
        }
      }
    });

    /*
     * Validate on blur.
     */
    [$("#name"), $("#email"), $("#subject"), $("#message")].forEach((field) => {
      if (!field) {
        return;
      }

      field.addEventListener("blur", () => validateField(field));
    });
  }

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
      { passive: true },
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
   *
   * Prevents a broken image from destroying the layout.
   * Replace the fallback with your preferred placeholder.
   * =========================================================
   */

  $$("img").forEach((image) => {
    image.addEventListener(
      "error",
      () => {
        image.classList.add("image-load-error");
      },
      { once: true },
    );
  });

  /* * ========================================================= * LOGIN DROPDOWN * ========================================================= */ const loginDropdown =
    document.querySelector(".login-dropdown");
  const loginDropdownButton = document.querySelector("#loginDropdownButton");
  if (loginDropdown && loginDropdownButton) {
    const loginMenu = document.querySelector("#loginDropdownMenu");
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
    /* * Close when clicking outside. */ document.addEventListener(
      "click",
      (event) => {
        if (!loginDropdown.contains(event.target)) {
          closeLoginDropdown();
        }
      },
    );
    /* * Close with Escape. */ document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeLoginDropdown();
        loginDropdownButton.focus();
      }
    });
    /* * Prevent clicks inside the menu from * bubbling to the document handler. */ if (
      loginMenu
    ) {
      loginMenu.addEventListener("click", (event) => {
        event.stopPropagation();
      });
    }
  }

document.addEventListener("DOMContentLoaded", () => {

    const notificationBar =
        document.querySelector(".notification-bar");

    const notificationTrack =
        document.querySelector("#notificationTrack");

    const notificationControl =
        document.querySelector("#notificationControl");


    if (
        !notificationBar ||
        !notificationTrack ||
        !notificationControl
    ) {
        return;
    }


    /* =========================================================
       PAUSE / PLAY
    ========================================================== */

    notificationControl.addEventListener("click", () => {

        const isPaused =
            notificationBar.classList.toggle("is-paused");


        notificationControl.setAttribute(
            "aria-label",
            isPaused
                ? "Play announcements"
                : "Pause announcements"
        );


        notificationControl.setAttribute(
            "title",
            isPaused
                ? "Play announcements"
                : "Pause announcements"
        );

    });


    /* =========================================================
       PAUSE WHEN TAB IS NOT VISIBLE
    ========================================================== */

    document.addEventListener(
        "visibilitychange",
        () => {

            if (document.hidden) {

                notificationTrack.style
                    .animationPlayState = "paused";

            } else if (
                !notificationBar.classList.contains(
                    "is-paused"
                )
            ) {

                notificationTrack.style
                    .animationPlayState = "running";

            }

        }
    );

});

})();
