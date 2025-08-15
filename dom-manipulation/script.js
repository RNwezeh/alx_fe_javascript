// Dynamic Quote Generator (Storage + JSON Import/Export)
// ===============================

// ---- Storage Keys ----
const LS_QUOTES_KEY = "dqg_quotes_v1";
const SS_LAST_QUOTE_KEY = "dqg_lastViewedQuote_v1";

// ---- Default Quotes (used only if LocalStorage is empty or invalid) ----
const DEFAULT_QUOTES = [
  { text: "The best way to predict the future is to invent it.", category: "Motivation" },
  { text: "Life is 10% what happens to us and 90% how we react to it.", category: "Inspiration" },
  { text: "Do one thing every day that scares you.", category: "Courage" }
];

// ---- App State ----
let quotes = [];

// ---- Utilities ----
function isValidQuote(o) {
  return (
    o &&
    typeof o === "object" &&
    typeof o.text === "string" &&
    o.text.trim().length > 0 &&
    typeof o.category === "string" &&
    o.category.trim().length > 0
  );
}

function dedupeQuoteArray(arr) {
  const seen = new Set();
  const out = [];
  for (const q of arr) {
    if (!isValidQuote(q)) continue;
    const key = `${q.text.trim()}||${q.category.trim().toLowerCase()}`;
    if (!seen.has(key)) {
      seen.add(key);
      out.push({ text: q.text.trim(), category: q.category.trim() });
    }
  }
  return out;
}

function loadQuotes() {
  try {
    const raw = localStorage.getItem(LS_QUOTES_KEY);
    if (!raw) {
      quotes = [...DEFAULT_QUOTES];
      saveQuotes();
      return;
    }
    const parsed = JSON.parse(raw);
    const cleaned = dedupeQuoteArray(Array.isArray(parsed) ? parsed : []);
    quotes = cleaned.length ? cleaned : [...DEFAULT_QUOTES];
    saveQuotes(); // re-save cleaned data
  } catch {
    quotes = [...DEFAULT_QUOTES];
    saveQuotes();
  }
}

function saveQuotes() {
  localStorage.setItem(LS_QUOTES_KEY, JSON.stringify(quotes));
  updateStats();
}

function saveLastViewedQuote(quote) {
  try {
    sessionStorage.setItem(
      SS_LAST_QUOTE_KEY,
      JSON.stringify({ ...quote, viewedAt: new Date().toISOString() })
    );
  } catch {
    // ignore sessionStorage errors (e.g., privacy mode)
  }
}

function getLastViewedQuote() {
  try {
    const raw = sessionStorage.getItem(SS_LAST_QUOTE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// ---- DOM Helpers ----
function el(tag, attrs = {}, children = []) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") e.className = v;
    else if (k === "text") e.textContent = v;
    else if (k.startsWith("on") && typeof v === "function") e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v);
  }
  for (const c of children) e.appendChild(c);
  return e;
}

function mountBaseUI() {
  // Container
  const app = el("div", { id: "app", class: "dqg-app", style: `
      max-width: 720px; margin: 24px auto; padding: 16px;
      font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
      line-height: 1.5; color: #222;
      border: 1px solid #ddd; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    ` });

  // Title & stats
  const header = el("div", { class: "dqg-header" }, [
    el("h2", { text: "Dynamic Quote Generator" }),
    el("div", { id: "stats", style: "font-size: 0.9rem; color:#555" }, [document.createTextNode("Loading…")]),
  ]);

  // Quote display area
  const quoteBox = el("div", { id: "quote-container", style: `
      padding: 16px; background:#fafafa; border:1px solid #eee; border-radius:10px; margin: 12px 0;
    ` }, [
    el("div", { id: "quote-text", style: "font-size:1.1rem; font-weight:600;" }),
    el("div", { id: "quote-category", style: "font-size:0.95rem; color:#666; margin-top:6px;" }),
  ]);

  // Last viewed (session)
  const lastViewed = el("div", { id: "last-viewed", style: "font-size:0.9rem; color:#444; margin: 8px 0;" });

  // Controls: show random, export, import, clear
  const controls = el("div", { class: "dqg-controls", style: "display:flex; flex-wrap:wrap; gap:8px; margin: 8px 0;" });

  const btn = (label, onClick, attrs = {}) => el("button", {
    ...attrs,
    onclick: onClick,
    style: `
      padding:8px 12px; border-radius:8px; border:1px solid #ddd; background:#fff; cursor:pointer;
      box-shadow: 0 1px 4px rgba(0,0,0,0.04);
    `
  }, [document.createTextNode(label)]);

  const showBtn = btn("Show Random Quote", showRandomQuote, { id: "btn-random" });
  const exportBtn = btn("Export to JSON", exportToJson, { id: "btn-export" });

  const importLabel = el("label", { for: "importFile", style: `
      padding:8px 12px; border-radius:8px; border:1px dashed #bbb; cursor:pointer; background:#fcfcfc;
    ` }, [document.createTextNode("Import JSON…")]);
  const importInput = el("input", { type: "file", id: "importFile", accept: ".json", style: "display:none;" });
  importInput.addEventListener("change", importFromJsonFile);

  const clearBtn = btn("Clear All (Local)", () => {
    if (confirm("This will clear all locally stored quotes and reload defaults. Continue?")) {
      localStorage.removeItem(LS_QUOTES_KEY);
      loadQuotes();
      renderLastViewed();
      renderQuoteCount();
      // Clear displayed quote
      document.getElementById("quote-text").textContent = "";
      document.getElementById("quote-category").textContent = "";
      alert("Local quotes cleared. Defaults restored.");
    }
  });

  controls.append(showBtn, exportBtn, importLabel, importInput, clearBtn);

  // Add Quote form
  const formBox = el("div", { id: "form-box", style: `
      margin-top: 12px; padding: 12px; border:1px solid #eee; border-radius:10px; background:#fff;
    ` });
  formBox.appendChild(createAddQuoteForm());

  // Quote list (simple preview for testing)
  const listBox = el("details", { style: "margin-top: 8px;" });
  listBox.appendChild(el("summary", { text: "Show all quotes (for testing)" }));
  const list = el("ul", { id: "quote-list", style: "margin:8px 0 0 18px;" });
  listBox.appendChild(list);

  app.append(header, quoteBox, lastViewed, controls, formBox, listBox);
  document.body.appendChild(app);
}

function updateStats() {
  const stats = document.getElementById("stats");
  if (!stats) return;
  stats.textContent = `Total quotes: ${quotes.length}`;
}

function renderLastViewed() {
  const c = document.getElementById("last-viewed");
  if (!c) return;
  const last = getLastViewedQuote();
  if (last && isValidQuote(last)) {
    const when = last.viewedAt ? new Date(last.viewedAt).toLocaleString() : "this session";
    c.textContent = `Last viewed this session: “${last.text}” — ${last.category} (${when})`;
  } else {
    c.textContent = "No quote viewed yet this session.";
  }
}

function renderQuoteList() {
  const list = document.getElementById("quote-list");
  if (!list) return;
  list.innerHTML = "";
  quotes.forEach((q) => {
    const li = el("li", {}, [document.createTextNode(`“${q.text}” — ${q.category}`)]);
    list.appendChild(li);
  });
}

function renderQuoteCount() {
  updateStats();
  renderQuoteList();
}

// ---- Core Features ----
function showRandomQuote() {
  if (!quotes.length) {
    alert("No quotes available. Add some first!");
    return;
  }
  const idx = Math.floor(Math.random() * quotes.length);
  const quote = quotes[idx];

  const textEl = document.getElementById("quote-text");
  const catEl = document.getElementById("quote-category");
  if (textEl && catEl) {
    textEl.textContent = `“${quote.text}”`;
    catEl.textContent = `Category: ${quote.category}`;
  }

  saveLastViewedQuote(quote);
  renderLastViewed();
}

// Builds and returns the Add Quote form element
function createAddQuoteForm() {
  const form = el("form", { id: "add-quote-form" });

  const title = el("h3", { text: "Add a New Quote" });
  const row = (labelText, inputEl) =>
    el("div", { style: "display:flex; gap:8px; align-items:center; margin:6px 0;" }, [
      el("label", { style: "min-width:80px;" }, [document.createTextNode(labelText)]),
      inputEl,
    ]);

  const inputText = el("input", {
    type: "text",
    id: "quote-text-input",
    placeholder: "e.g., Stay hungry, stay foolish.",
    required: "true",
    style: "flex:1; padding:8px; border:1px solid #ccc; border-radius:8px;"
  });

  const inputCategory = el("input", {
    type: "text",
    id: "quote-category-input",
    placeholder: "e.g., Wisdom",
    required: "true",
    style: "flex:1; padding:8px; border:1px solid #ccc; border-radius:8px;"
  });

  const submitBtn = el("button", {
    type: "submit",
    style: `
      padding:8px 12px; border-radius:8px; border:1px solid #ddd; background:#f7f7f7; cursor:pointer;
      margin-top: 6px;
    `
  }, [document.createTextNode("Add Quote")]);

  form.append(
    title,
    row("Quote:", inputText),
    row("Category:", inputCategory),
    submitBtn
  );

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = inputText.value.trim();
    const category = inputCategory.value.trim();

    if (!text || !category) return;

    const newQuote = { text, category };
    if (!isValidQuote(newQuote)) {
      alert("Please provide valid text and category.");
      return;
    }

    // Add, dedupe and persist
    quotes.push(newQuote);
    quotes = dedupeQuoteArray(quotes);
    saveQuotes();

    // Clear inputs
    inputText.value = "";
    inputCategory.value = "";

    // Feedback + update UI
    alert("Quote added successfully!");
    renderQuoteCount();
  });

  return form;
}

// ---- JSON Export / Import ----
function exportToJson() {
  try {
    const data = JSON.stringify(quotes, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    const a = document.createElement("a");
    a.href = url;
    a.download = `quotes-${ts}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error(err);
    alert("Failed to export quotes.");
  }
}

// Required signature: <input type="file" id="importFile" accept=".json" onchange="importFromJsonFile(event)" />
// We also attach the listener programmatically in mountBaseUI. This function is global.
function importFromJsonFile(event) {
  const file = event?.target?.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const parsed = JSON.parse(e.target.result);

      if (!Array.isArray(parsed)) {
        alert("Invalid file: expected an array of {text, category} objects.");
        return;
      }

      const incoming = parsed.filter(isValidQuote);
      if (!incoming.length) {
        alert("No valid quotes found in file.");
        return;
      }

      const before = quotes.length;
      quotes.push(...incoming);
      quotes = dedupeQuoteArray(quotes);
      const after = quotes.length;

      saveQuotes();
      renderQuoteCount();

      const added = after - before;
      alert(`Quotes imported successfully! ${added} new ${added === 1 ? "quote" : "quotes"} added.`);
      // Reset input so the same file can be re-imported if needed
      event.target.value = "";
    } catch (err) {
      console.error(err);
      alert("Failed to parse JSON. Please provide a valid JSON file.");
    }
  };
  reader.readAsText(file);
}

// ---- Init ----
document.addEventListener("DOMContentLoaded", () => {
  loadQuotes();          // Load from Local Storage (or defaults)
  mountBaseUI();         // Build the UI
  renderQuoteCount();    // Show counts and list
  renderLastViewed();    // Show last viewed quote from Session Storage
});