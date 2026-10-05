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

  menuBtn.addEventListener("click", () => sidebar.classList.contains("open") ? closeSidebar() : openSidebar());
  closeBtn?.addEventListener("click", closeSidebar);
  overlay?.addEventListener("click", closeSidebar);

  sidebar.querySelectorAll("a.nav-item").forEach(link => {
    link.addEventListener("click", () => { if (isMobile()) closeSidebar(); });
  });

  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && sidebar.classList.contains("open")) closeSidebar();
  });

  window.addEventListener("resize", () => {
    if (!isMobile()) closeSidebar();
  });
})();
