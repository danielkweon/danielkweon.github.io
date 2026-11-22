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
// text; the button stays the control for keyboards.
document.querySelectorAll(".job").forEach((job) => {
  const toggle = job.querySelector(".more-toggle");
  job.classList.add("is-collapsed", "is-clickable");
  toggle.hidden = false;
  toggle.textContent = "+ more";
  toggle.addEventListener("click", (event) => {
    // Don't let the job's own click handler toggle it straight back.
    event.stopPropagation();
    const open = !job.classList.toggle("is-collapsed");
    toggle.textContent = open ? "− less" : "+ more";
  });
  job.addEventListener("click", () => {
    const selection = getSelection();
    const selecting = !selection.isCollapsed && job.contains(selection.anchorNode);
    if (selecting) return;
    toggle.click();
  });
});

// Chat: a terminal screen held for the chat that will run the puzzle.
// - The "Last login" line shows the visitor's own date and time, the way a real terminal
//   would. Without JS it keeps the date written in the HTML.
// - Until the chat is built, a visitor can type at the prompt. Enter echoes the line under
//   the same prompt the page shows, and reply() answers; the real chat replaces reply().
// - The screen scrolls to the newest line; past 100 lines the oldest go.
// - Clicking the screen starts typing, except while selecting text in it.
// - The field is a text area, so a pasted line break becomes a space.
const chat = document.querySelector(".chat-screen");
if (chat) {
  const login = chat.querySelector(".chat-login time");
  const input = chat.querySelector(".chat-input");
  const log = chat.querySelector(".chat-log");
  const prompt = chat.querySelector(".chat-ps1").textContent;

  const now = new Date();
  const part = (options) => now.toLocaleString("en-US", options);
  const time = now.toLocaleTimeString("en-GB", { hour12: false });
  login.dateTime = now.toISOString();
  login.textContent = `${part({ weekday: "short" })} ${part({ month: "short" })} ${now.getDate()} ${time}`;

  const reply = (text) => "notebook: no one's here yet. check back soon!";

  const say = (text, className) => {
    const line = document.createElement("p");
    line.textContent = text;
    if (className) line.className = className;
    log.append(line);
  };

  input.hidden = false;
  chat.addEventListener("click", () => {
    const selection = getSelection();
    const selecting = !selection.isCollapsed && chat.contains(selection.anchorNode);
    if (!selecting) input.focus();
  });
  input.addEventListener("input", () => {
    if (input.value.includes("\n")) input.value = input.value.replace(/\s*\n\s*/g, " ");
  });
  input.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" || event.isComposing) return;
    event.preventDefault();
    const text = input.value;
    say(`${prompt} ${text}`);
    if (text.trim()) say(reply(text), "chat-reply");
    while (log.children.length > 100) log.firstElementChild.remove();
    input.value = "";
    chat.scrollTop = chat.scrollHeight;
  });
}
