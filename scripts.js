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

// Work and chat: on desktop the chat card reaches into /work's last column, so when /work
// grows past the card's top (a job opens), push the card down to clear it by the gap
// between cards; the stylesheet adds --clear to the card's drop. On phones the cards
// don't sit side by side, so nothing moves.
const workCard = document.querySelector(".paper.work");
const chatCard = document.querySelector(".paper.chat");
if (workCard && chatCard) {
  const clear = () => {
    chatCard.style.removeProperty("--clear");
    const work = workCard.getBoundingClientRect();
    const card = chatCard.getBoundingClientRect();
    const gap = parseFloat(getComputedStyle(chatCard.parentElement).rowGap) || 0;
    const overlap = work.bottom + gap - card.top;
    if (card.left < work.right && overlap > 0) chatCard.style.setProperty("--clear", `${overlap}px`);
  };
  new ResizeObserver(clear).observe(workCard);
}

// Chat: a terminal screen held for the chat that will run the puzzle.
// - The "Last login" line shows the visitor's own date and time, the way a real terminal
//   would. Without JS it keeps the date written in the HTML.
// - Until the chat is built, a visitor can type at the prompt. Enter echoes the line under
//   the same prompt the page shows, and reply() answers; the real chat replaces reply().
// - The screen scrolls to the newest line; past 100 lines the oldest go.
// - Clicking the screen starts typing, except while selecting text in it.
// - The field is a text area, so a pasted line break becomes a space.
const terminal = document.querySelector(".chat-screen");
if (terminal) {
  const login = terminal.querySelector(".chat-login time");
  const input = terminal.querySelector(".chat-input");
  const log = terminal.querySelector(".chat-log");
  const prompt = terminal.querySelector(".chat-ps1").textContent;

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
  terminal.addEventListener("click", () => {
    const selection = getSelection();
    const selecting = !selection.isCollapsed && terminal.contains(selection.anchorNode);
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
    terminal.scrollTop = terminal.scrollHeight;
  });
}
