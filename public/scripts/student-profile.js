(() => {
  "use strict";

  const tabs = [...document.querySelectorAll(".profile-tab")];

  const contents = [...document.querySelectorAll(".profile-tab-content")];

  if (!tabs.length) return;

  function activateTab(name) {
    tabs.forEach((tab) => {
      tab.classList.toggle("active", tab.dataset.tab === name);
    });

    contents.forEach((content) => {
      content.classList.toggle("active", content.id === `tab-${name}`);
    });

    /*
     * Store the active tab so that
     * refreshing the page keeps the
     * user's current section.
     */

    try {
      sessionStorage.setItem("studentProfileTab", name);
    } catch (error) {
      // Ignore storage errors.
    }
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      activateTab(tab.dataset.tab);
    });
  });

  document.querySelectorAll("[data-open-tab]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();

      activateTab(link.dataset.openTab);
    });
  });

  const savedTab = (() => {
    try {
      return sessionStorage.getItem("studentProfileTab");
    } catch (error) {
      return null;
    }
  })();

  if (savedTab && document.getElementById(`tab-${savedTab}`)) {
    activateTab(savedTab);
  } else {
    activateTab("overview");
  }

  /*
   * Mobile sidebar
   */

  const menuBtn = document.getElementById("menuBtn");

  const sidebar = document.getElementById("sidebar");

  menuBtn?.addEventListener("click", () => {
    sidebar?.classList.toggle("open");
  });

  /*
   * Printing
   */

  document.getElementById("printProfile")?.addEventListener("click", () => {
    window.print();
  });

  document.getElementById("printHistory")?.addEventListener("click", () => {
    activateTab("history");

    setTimeout(() => window.print(), 100);
  });

  const assignNewClassForm = document.getElementById("assignNewClass");
  assignNewClassForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData(assignNewClassForm);

      const resp = await fetch("/student/change/class", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(formData),
      });

      const result = await resp.json();

      if (!resp.ok || !result.success) {
        alert(result.message);
        return;
      }

      alert(result.message);

      // Redirect after successful allocation
      setTimeout(() => {
        window.location.href =
          window.location.href = `/viewPupils`;
      }, 1000);
    } catch (err) {
      console.log(err);
      console.error("Allocation error:", err);
      showError("Something went wrong. Please try again.");
    }
  });
})();
