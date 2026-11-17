// Site scripts, loaded by every page. Everything here is an enhancement: without JS
// every job shows open and "Back to top" still jumps to the top.

// Back to top: glide up without adding "#" to the URL. Without JS, the link still jumps.
document.querySelector(".footer-top")?.addEventListener("click", (event) => {
  event.preventDefault();
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
});

// Work: start each job collapsed and show its toggle. Collapsed jobs show their first
// two points (one on phones); the stylesheet sets this. The toggle reads "+ more", then
// "− less" once open. Clicking anywhere on a job toggles it too, except while selecting
// text; the button stays the control for keyboards and screen readers.
document.querySelectorAll(".job").forEach((job) => {
  const toggle = job.querySelector(".more-toggle");
  job.classList.add("is-collapsed", "is-clickable");
  toggle.hidden = false;
  toggle.textContent = "+ more";
  toggle.addEventListener("click", (event) => {
    // Don't let the job's own click handler toggle it straight back.
    event.stopPropagation();
    const open = !job.classList.toggle("is-collapsed");
    toggle.setAttribute("aria-expanded", open);
    toggle.textContent = open ? "− less" : "+ more";
  });
  job.addEventListener("click", () => {
    const selection = getSelection();
    const selecting = !selection.isCollapsed && job.contains(selection.anchorNode);
    if (selecting) return;
    toggle.click();
  });
});
