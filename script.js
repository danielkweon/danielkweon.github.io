/**
 * Daniel Kweon Portfolio - JavaScript
 *
 * Features:
 * - Scroll spy navigation
 * - Experience tabs
 * - Scroll animations
 * - Tumble easter egg
 */

(function () {
  "use strict";

  // ========================================
  // NAVIGATION
  // ========================================

  class Navigation {
    constructor() {
      this.sidebarLinks = document.querySelectorAll(".sidebar-nav a");
      this.sections = document.querySelectorAll("section[id]");
      this.hamburger = document.querySelector(".hamburger");
      this.mobileMenu = document.querySelector(".mobile-menu");
      this.mobileOverlay = document.querySelector(".mobile-overlay");
      this.mobileLinks = document.querySelectorAll(".mobile-menu a");

      this.init();
    }

    init() {
      this.setupScrollSpy();
      this.setupMobileNav();
      this.setupSmoothScroll();
    }

    setupScrollSpy() {
      let scrollTimeout;

      const updateActiveLink = () => {
        const scrollPosition = window.scrollY + 200;
        const documentHeight = document.documentElement.scrollHeight;
        const windowHeight = window.innerHeight;
        const isNearBottom =
          scrollPosition + windowHeight >= documentHeight - 100;

        // If near bottom, select contact section
        if (isNearBottom) {
          this.sidebarLinks.forEach((link) => {
            link.classList.remove("active");
            if (link.getAttribute("href") === "#contact") {
              link.classList.add("active");
            }
          });
          return;
        }

        // Otherwise, check normal section visibility
        this.sections.forEach((section) => {
          const sectionTop = section.offsetTop;
          const sectionHeight = section.offsetHeight;
          const sectionId = section.getAttribute("id");

          if (
            scrollPosition >= sectionTop &&
            scrollPosition < sectionTop + sectionHeight
          ) {
            this.sidebarLinks.forEach((link) => {
              link.classList.remove("active");
              if (link.getAttribute("href") === `#${sectionId}`) {
                link.classList.add("active");
              }
            });
          }
        });
      };

      const throttledScroll = () => {
        if (scrollTimeout) return;
        scrollTimeout = setTimeout(() => {
          updateActiveLink();
          scrollTimeout = null;
        }, 100);
      };

      window.addEventListener("scroll", throttledScroll);
      updateActiveLink();
    }

    setupMobileNav() {
      if (!this.hamburger) return;

      this.hamburger.addEventListener("click", () => this.toggleMenu());

      if (this.mobileOverlay) {
        this.mobileOverlay.addEventListener("click", () => this.closeMenu());
      }

      this.mobileLinks.forEach((link) => {
        link.addEventListener("click", () => this.closeMenu());
      });

      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && this.mobileMenu.classList.contains("open")) {
          this.closeMenu();
        }
      });
    }

    toggleMenu() {
      const isOpen = this.mobileMenu.classList.contains("open");
      isOpen ? this.closeMenu() : this.openMenu();
    }

    openMenu() {
      this.hamburger.classList.add("active");
      this.hamburger.setAttribute("aria-expanded", "true");
      this.mobileMenu.classList.add("open");
      this.mobileOverlay.style.display = "block";
      setTimeout(() => this.mobileOverlay.classList.add("visible"), 10);
      document.body.style.overflow = "hidden";
    }

    closeMenu() {
      this.hamburger.classList.remove("active");
      this.hamburger.setAttribute("aria-expanded", "false");
      this.mobileMenu.classList.remove("open");
      this.mobileOverlay.classList.remove("visible");
      document.body.style.overflow = "";

      setTimeout(() => {
        if (!this.mobileMenu.classList.contains("open")) {
          this.mobileOverlay.style.display = "none";
        }
      }, 400);
    }

    setupSmoothScroll() {
      document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener("click", (e) => {
          const href = anchor.getAttribute("href");
          if (href === "#") return;

          const target = document.querySelector(href);
          if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: "smooth" });
          }
        });
      });
    }
  }

  // ========================================
  // EXPERIENCE TABS
  // ========================================

  class ExperienceTabs {
    constructor() {
      this.tabs = document.querySelectorAll(".experience-tab");
      this.panels = document.querySelectorAll(".experience-panel");

      if (this.tabs.length === 0) return;

      this.init();
    }

    init() {
      this.tabs.forEach((tab) => {
        tab.addEventListener("click", () => this.switchTab(tab.dataset.tab));
        tab.addEventListener("keydown", (e) => this.handleKeyboard(e, tab));
      });
    }

    handleKeyboard(e, currentTab) {
      const tabsArray = Array.from(this.tabs);
      const currentIndex = tabsArray.indexOf(currentTab);
      let newIndex;

      switch (e.key) {
        case "ArrowDown":
        case "ArrowRight":
          e.preventDefault();
          newIndex = (currentIndex + 1) % tabsArray.length;
          tabsArray[newIndex].focus();
          this.switchTab(tabsArray[newIndex].dataset.tab);
          break;
        case "ArrowUp":
        case "ArrowLeft":
          e.preventDefault();
          newIndex = (currentIndex - 1 + tabsArray.length) % tabsArray.length;
          tabsArray[newIndex].focus();
          this.switchTab(tabsArray[newIndex].dataset.tab);
          break;
      }
    }

    switchTab(tabId) {
      this.tabs.forEach((tab) => {
        const isActive = tab.dataset.tab === tabId;
        tab.classList.toggle("active", isActive);
        tab.setAttribute("aria-selected", isActive);
      });

      this.panels.forEach((panel) => {
        panel.classList.toggle("active", panel.id === tabId);
      });
    }
  }

  // ========================================
  // SCROLL ANIMATIONS
  // ========================================

  class ScrollAnimations {
    constructor() {
      this.elements = document.querySelectorAll(".fade-up");
      this.prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      this.init();
    }

    init() {
      if (this.prefersReducedMotion) {
        this.elements.forEach((el) => el.classList.add("visible"));
        return;
      }

      const observerOptions = {
        root: null,
        rootMargin: "0px 0px -100px 0px",
        threshold: 0.1,
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      }, observerOptions);

      this.elements.forEach((el) => observer.observe(el));
    }
  }

  // ========================================
  // EASTER EGG
  // ========================================

  class TumbleEasterEgg {
    constructor() {
      this.sequence = "";
      this.target = "tumble";
      this.timeout = null;

      this.init();
    }

    init() {
      document.addEventListener("keydown", (e) => {
        if (this.isInputElement(e.target)) return;

        this.resetTimeout();
        this.updateSequence(e.key);

        if (this.sequence === this.target) {
          this.activate();
          this.sequence = "";
        }
      });
    }

    isInputElement(element) {
      return element.tagName === "INPUT" || element.tagName === "TEXTAREA";
    }

    resetTimeout() {
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        this.sequence = "";
      }, 2000);
    }

    updateSequence(key) {
      this.sequence += key.toLowerCase();
      if (this.sequence.length > this.target.length) {
        this.sequence = this.sequence.slice(-this.target.length);
      }
    }

    activate() {
      const wrap = document.getElementById("tumble-wrap");
      const sidebar = document.querySelector(".sidebar");
      if (wrap) wrap.classList.add("tumble-active");
      if (sidebar) sidebar.classList.add("tumble-active");
      setTimeout(() => {
        if (wrap) wrap.classList.remove("tumble-active");
        if (sidebar) sidebar.classList.remove("tumble-active");
      }, 500);

      console.log("%c🎮 TUMBLE! 🎮", "font-size: 24px; color: #4dabf7;");
      console.log(
        "You found the easter egg! Play the full game: https://apps.apple.com/us/app/tumble-puzzle-game/id6480238709"
      );
    }
  }

  // ========================================
  // INITIALIZATION
  // ========================================

  document.addEventListener("DOMContentLoaded", () => {
    new Navigation();
    new ExperienceTabs();
    new ScrollAnimations();
    new TumbleEasterEgg();

    const loadMoreBtn = document.getElementById("projects-load-more");
    const loadMoreWrap = document.querySelector(".projects-load-more-wrap");
    const projectPuzzled = document.getElementById("project-puzzled");
    if (loadMoreBtn && projectPuzzled && loadMoreWrap) {
      loadMoreBtn.addEventListener("click", () => {
        projectPuzzled.removeAttribute("hidden");
        loadMoreBtn.setAttribute("aria-expanded", "true");
        loadMoreWrap.classList.add("is-hidden");
      });
    }
  });
})();
