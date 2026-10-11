/* GÓC LỚP 12 — Shared portal interactions */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function initActiveNavigation() {
    const current = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
    document.querySelectorAll(".category-nav a").forEach((link) => {
      const href = (link.getAttribute("href") || "").split("/").pop().toLowerCase();
      const active = href === current || (current === "" && href === "index.html");
      link.classList.toggle("active", active);
      if (active) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  }

  function initSearch() {
    const input = document.getElementById("searchInput");
    const wrapper = input && input.closest(".search");
    if (!input || !wrapper) return;

    input.setAttribute("aria-label", "Tìm kiếm nội dung trên GÓC LỚP 12");
    const button = wrapper.querySelector("button");
    if (button) button.setAttribute("aria-label", "Tìm kiếm");

    let status = wrapper.querySelector(".search-status");
    if (!status) {
      status = document.createElement("p");
      status.className = "search-status";
      status.setAttribute("role", "status");
      status.setAttribute("aria-live", "polite");
      wrapper.appendChild(status);
    }

    const selector = [
      ".news-card", ".portal-item", ".side-item", ".info-card",
      ".topic-card", ".solution-card", ".resource", ".article-section",
      ".tool"
    ].join(",");

    window.searchArticles = function searchArticles() {
      const query = input.value.trim().toLocaleLowerCase("vi");
      const targets = Array.from(document.querySelectorAll(selector));

      targets.forEach((element) => {
        if (!query) {
          element.removeAttribute("data-search-hidden");
          element.classList.remove("search-highlight");
          return;
        }
        const text = (element.innerText || element.textContent || "").toLocaleLowerCase("vi");
        const matched = text.includes(query);
        if (matched) {
          element.removeAttribute("data-search-hidden");
          element.classList.add("search-highlight");
        } else {
          element.setAttribute("data-search-hidden", "true");
          element.classList.remove("search-highlight");
        }
      });

      if (!query) {
        status.textContent = "";
        return;
      }

      const count = targets.filter((element) =>
        !element.hasAttribute("data-search-hidden")
      ).length;

      status.textContent = count
        ? "Tìm thấy " + count + " mục phù hợp. Nhấn Esc hoặc xóa từ khóa để xem lại toàn bộ."
        : "Chưa tìm thấy mục phù hợp. Thử từ khóa ngắn hơn hoặc xóa từ khóa để xem toàn bộ nội dung.";
    };

    input.addEventListener("input", () => {
      if (input.value.trim().length === 0) {
        window.searchArticles();
      }
    });

    input.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        input.value = "";
        window.searchArticles();
        input.blur();
      }
    });
  }

  function initReadingProgress() {
    const progress = document.createElement("div");
    progress.className = "reading-progress";
    progress.setAttribute("aria-hidden", "true");
    const bar = document.createElement("span");
    progress.appendChild(bar);
    document.body.appendChild(progress);

    let scheduled = false;
    function update() {
      const root = document.documentElement;
      const total = root.scrollHeight - window.innerHeight;
      const ratio = total > 0 ? Math.min(1, Math.max(0, window.scrollY / total)) : 0;
      bar.style.width = (ratio * 100) + "%";
      scheduled = false;
    }
    window.addEventListener("scroll", () => {
      if (!scheduled) {
        scheduled = true;
        window.requestAnimationFrame(update);
      }
    }, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    update();
  }

  function initBackToTop() {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "back-to-top";
    button.setAttribute("aria-label", "Về đầu trang");
    button.setAttribute("title", "Về đầu trang");
    button.textContent = "↑";
    document.body.appendChild(button);

    button.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });

    function update() {
      button.classList.toggle("visible", window.scrollY > 480);
    }
    window.addEventListener("scroll", update, { passive: true });
    update();
  }

  function initAssistantAccessibility() {
    const panel = document.querySelector(".assistant-panel");
    const launcher = document.querySelector(".assistant-launcher");
    const close = document.querySelector(".assistant-close");
    if (!panel || !launcher) return;

    launcher.setAttribute("aria-expanded", "false");
    launcher.setAttribute("aria-controls", "assistantMessages");

    const sync = () => {
      const open = panel.classList.contains("open");
      launcher.setAttribute("aria-expanded", String(open));
      launcher.setAttribute("aria-label", open ? "Đóng Trợ lý Góc học sinh" : "Mở Trợ lý Góc học sinh");
    };
    const observer = new MutationObserver(sync);
    observer.observe(panel, { attributes: true, attributeFilter: ["class"] });
    sync();

    if (close) {
      close.addEventListener("click", () => {
        launcher.focus();
      });
    }
  }

  function initSearchButtonFallback() {
    // Keeps the search button functional if inline onclick handlers are removed later.
    const input = document.getElementById("searchInput");
    const button = input && input.closest(".search")?.querySelector("button");
    if (button && input) {
      button.addEventListener("click", () => {
        if (typeof window.searchArticles === "function") window.searchArticles();
      });
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    initActiveNavigation();
    initSearch();
    initReadingProgress();
    initBackToTop();
    initAssistantAccessibility();
    initSearchButtonFallback();
  });
})();
