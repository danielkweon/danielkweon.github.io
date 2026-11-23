// Site scripts, loaded by every page. Everything here is an enhancement: without JS
// every job shows open and "Back to top" still jumps to the top.

// Back to top: glide up without adding "#" to the URL. Without JS, the link still jumps.
document.querySelector(".footer-top")?.addEventListener("click", (event) => {
  event.preventDefault();
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
});

// Work and chat: on desktop the chat card reaches into /work's last column, so when /work
// grows past the card's top (a job opens), push the card down to clear it by the gap
// between cards plus the card's own drop, the same space it keeps below /projects; the
// stylesheet adds --clear to the card's drop. On phones the cards don't sit side by
// side, so nothing moves.
const workCard = document.querySelector(".paper.work");
const chatCard = document.querySelector(".paper.chat");
const clearChat = () => {
  if (!workCard || !chatCard) return;
  chatCard.style.removeProperty("--clear");
  const work = workCard.getBoundingClientRect();
  const card = chatCard.getBoundingClientRect();
  const gap = parseFloat(getComputedStyle(chatCard.parentElement).rowGap) || 0;
  const drop = parseFloat(getComputedStyle(chatCard).marginTop) || 0;
  const overlap = work.bottom + gap + drop - card.top;
  if (card.left < work.right && overlap > 0) chatCard.style.setProperty("--clear", `${overlap}px`);
};
// Toggling a job calls clearChat right away (below), so the card moves in the same frame
// as /work. This resize observer catches every other change in /work's size (fonts
// loading, the window narrowing); it pushes on the next frame because a resize made
// inside a resize callback makes the browser report a loop.
if (workCard && chatCard) new ResizeObserver(() => requestAnimationFrame(clearChat)).observe(workCard);

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
    clearChat();
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

// Doodles: with a mouse, dragging on the blank grid paper draws in ink, under the cards,
// like writing on the desk around them. Strokes are saved in the visitor's own browser,
// so they're still there next time, and a small "Erase doodles" just under the header,
// on the right, clears them.
// Strokes are stored relative to the board's top-left corner, so they stay put when the
// page scrolls or the board is centred differently.
const desk = document.querySelector(".board");
const header = document.querySelector(".site-header");
const mouse = matchMedia("(hover: hover) and (pointer: fine)");
if (desk && header && mouse.matches) {
  const KEY = "notebook-doodles";
  const MAX_POINTS = 20000; // oldest strokes go first past this
  const canvas = document.createElement("canvas");
  canvas.className = "doodles";
  document.body.prepend(canvas);
  const ctx = canvas.getContext("2d");

  const erase = document.createElement("button");
  erase.type = "button";
  erase.className = "doodle-erase";
  erase.innerHTML =
    '<svg viewBox="0 0 24 24"><path d="M7 21l-4.3-4.3a2 2 0 0 1 0-2.8l9.9-9.9a2 2 0 0 1 2.8 0l5.6 5.6a2 2 0 0 1 0 2.8L13 21" />' +
    '<path d="M22 21H7M5.5 10.5l8 8" /></svg>Erase doodles';
  header.append(erase);

  // Saved strokes, kept only if they're what this script saves: lists of [x, y] numbers.
  // Anything else (an old format, a stray edit) is ignored, so drawing still works.
  let strokes = [];
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    const isPoint = (p) => Array.isArray(p) && p.length === 2 && p.every(Number.isFinite);
    if (Array.isArray(saved)) strokes = saved.filter((s) => Array.isArray(s) && s.every(isPoint));
  } catch {}
  const save = () => {
    let total = strokes.reduce((n, s) => n + s.length, 0);
    while (total > MAX_POINTS && strokes.length > 1) total -= strokes.shift().length;
    try {
      localStorage.setItem(KEY, JSON.stringify(strokes));
    } catch {}
  };

  // Where the board's top-left corner is on the page.
  const origin = () => {
    const r = desk.getBoundingClientRect();
    return { x: r.left + scrollX, y: r.top + scrollY };
  };

  // A stroke as a smooth line: curves through the midpoints between its points.
  const trace = (points, o) => {
    ctx.beginPath();
    ctx.moveTo(points[0][0] + o.x, points[0][1] + o.y);
    for (let i = 1; i < points.length - 1; i++) {
      const [x, y] = points[i], [nx, ny] = points[i + 1];
      ctx.quadraticCurveTo(x + o.x, y + o.y, (x + nx) / 2 + o.x, (y + ny) / 2 + o.y);
    }
    const [lx, ly] = points[points.length - 1];
    ctx.lineTo(lx + o.x, ly + o.y);
    ctx.stroke();
  };

  // Narrow windows stack the cards and hide the canvas (the stylesheet decides where):
  // no drawing and no redrawing then.
  const shown = () => getComputedStyle(canvas).display !== "none";

  const draw = () => {
    if (!shown()) return;
    const ratio = devicePixelRatio || 1;
    // Measure the page without the canvas, which would otherwise hold it at its old height.
    canvas.style.height = "0";
    const width = document.documentElement.clientWidth;
    const height = document.documentElement.scrollHeight;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue("--ink").trim();
    const o = origin();
    for (const points of strokes) if (points.length > 1) trace(points, o);
  };

  // A drag starts only on blank paper: the page itself, the board, or a stack's gaps.
  const blank = (target) =>
    target === document.documentElement || target === document.body || target === desk || target.classList?.contains("board-stack");

  let current = null;
  const finish = () => {
    if (!current) return;
    if (current.length < 2) strokes.pop();
    current = null;
    save();
    draw();
  };
  addEventListener("pointerdown", (event) => {
    if (event.button !== 0 || !shown() || !blank(event.target)) return;
    event.preventDefault(); // don't start selecting text
    const o = origin();
    current = [[Math.round(event.pageX - o.x), Math.round(event.pageY - o.y)]];
    strokes.push(current);
  });
  addEventListener("pointermove", (event) => {
    if (!current) return;
    // The button came up outside the window, where the page never heard it: end the stroke.
    if (event.buttons === 0) return finish();
    const o = origin();
    const point = [Math.round(event.pageX - o.x), Math.round(event.pageY - o.y)];
    const [px, py] = current[current.length - 1];
    if (Math.hypot(point[0] - px, point[1] - py) < 2) return;
    current.push(point);
    // While drawing, just add the newest bit; the finished stroke is redrawn smooth.
    ctx.beginPath();
    ctx.moveTo(px + o.x, py + o.y);
    ctx.lineTo(point[0] + o.x, point[1] + o.y);
    ctx.stroke();
  });
  addEventListener("pointerup", finish);
  addEventListener("pointercancel", finish);

  erase.addEventListener("click", () => {
    strokes = [];
    save();
    draw();
  });

  // Redraw whenever the page changes size (resizing, opening a job, images loading).
  let frame = 0;
  new ResizeObserver(() => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(draw);
  }).observe(document.body);
}
