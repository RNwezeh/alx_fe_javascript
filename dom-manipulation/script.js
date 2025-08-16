// Keys for storage
const LS_QUOTES_KEY = "dqg_quotes_v1";
const LS_CATEGORY_FILTER_KEY = "dqg_lastCategoryFilter_v1";
const SS_LAST_QUOTE_KEY = "dqg_lastViewedQuote_v1";

// Default quotes
const DEFAULT_QUOTES = [
    { text: "The best way to predict the future is to invent it.", category: "Motivation" },
    { text: "Life is 10% what happens to us and 90% how we react to it.", category: "Inspiration" },
    { text: "Do one thing every day that scares you.", category: "Courage" }
];

// App state
let quotes = [];

// ===== Utilities =====
function isValidQuote(o) {
    return o &&
        typeof o.text === "string" &&
        o.text.trim() &&
        typeof o.category === "string" &&
        o.category.trim();
}

function dedupeQuotes(arr) {
    const seen = new Set();
    return arr.filter(q => {
        if (!isValidQuote(q)) return false;
        const key = q.text.trim() + "||" + q.category.trim().toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

// ===== Storage =====
function loadQuotes() {
    const stored = localStorage.getItem(LS_QUOTES_KEY);
    if (stored) {
        try {
            quotes = dedupeQuotes(JSON.parse(stored));
        } catch {
            quotes = [...DEFAULT_QUOTES];
        }
    } else {
        quotes = [...DEFAULT_QUOTES];
    }
    saveQuotes();
}

function saveQuotes() {
    localStorage.setItem(LS_QUOTES_KEY, JSON.stringify(quotes));
    populateCategories();
}

function saveLastViewedQuote(quote) {
    sessionStorage.setItem(SS_LAST_QUOTE_KEY, JSON.stringify(quote));
}

function getLastViewedQuote() {
    try {
        return JSON.parse(sessionStorage.getItem(SS_LAST_QUOTE_KEY));
    } catch {
        return null;
    }
}

function saveLastCategoryFilter(category) {
    localStorage.setItem(LS_CATEGORY_FILTER_KEY, category);
}

function getLastCategoryFilter() {
    return localStorage.getItem(LS_CATEGORY_FILTER_KEY) || "all";
}

// ===== UI =====
function showRandomQuote() {
    let filteredQuotes = quotes;
    const selectedCategory = document.getElementById("categoryFilter")?.value || "all";
    if (selectedCategory !== "all") {
        filteredQuotes = quotes.filter(q => q.category === selectedCategory);
    }

    if (filteredQuotes.length === 0) {
        alert("No quotes available for this category.");
        return;
    }

    const randomQuote = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];

    // Update quoteDisplay
    const quoteDisplay = document.getElementById("quoteDisplay");
    quoteDisplay.innerHTML = `
        <p><strong>Quote:</strong> ${randomQuote.text}</p>
        <p><em>Category:</em> ${randomQuote.category}</p>
    `;

    saveLastViewedQuote(randomQuote);
}

function createAddQuoteForm() {
    const form = document.createElement("form");
    form.innerHTML = `
        <h3>Add a New Quote</h3>
        <label>Quote: <input type="text" id="quote-text" required></label><br><br>
        <label>Category: <input type="text" id="quote-category" required></label><br><br>
        <button type="submit">Add Quote</button>
    `;

    form.addEventListener("submit", function (e) {
        e.preventDefault();
        const text = document.getElementById("quote-text").value.trim();
        const category = document.getElementById("quote-category").value.trim();

        if (!text || !category) return;

        quotes.push({ text, category });
        quotes = dedupeQuotes(quotes);
        saveQuotes();

        alert("Quote added successfully!");
        form.reset();
    });

    return form;
}

// ===== Category Filter =====
function populateCategories() {
    const filterSelect = document.getElementById("categoryFilter");
    if (!filterSelect) return;

    const uniqueCategories = [...new Set(quotes.map(q => q.category))].sort();
    filterSelect.innerHTML = `<option value="all">All Categories</option>`;

    uniqueCategories.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat;
        option.textContent = cat;
        filterSelect.appendChild(option);
    });

    // Restore last selected category
    const lastCategory = getLastCategoryFilter();
    filterSelect.value = lastCategory;
}

function filterQuotes() {
    const selectedCategory = document.getElementById("categoryFilter").value;
    saveLastCategoryFilter(selectedCategory);

    const filtered = selectedCategory === "all"
        ? quotes
        : quotes.filter(q => q.category === selectedCategory);

    const list = document.getElementById("quote-list");
    list.innerHTML = "";
    filtered.forEach(q => {
        const li = document.createElement("li");
        li.textContent = `"${q.text}" — ${q.category}`;
        list.appendChild(li);
    });

    // If nothing is selected in display, clear it
    if (filtered.length === 0) {
        document.getElementById("quoteDisplay").innerHTML = "<p>No quotes in this category.</p>";
    }
}

// ===== Initialization =====
document.addEventListener("DOMContentLoaded", function () {
    loadQuotes();

    // Create UI
    const app = document.createElement("div");

    // Filter dropdown
    const filterSelect = document.createElement("select");
    filterSelect.id = "categoryFilter";
    filterSelect.addEventListener("change", filterQuotes);
    app.appendChild(filterSelect);

    // Show quote button
    const showBtn = document.createElement("button");
    showBtn.textContent = "Show Random Quote";
    showBtn.addEventListener("click", showRandomQuote);
    app.appendChild(showBtn);


    // Add quote form
    app.appendChild(createAddQuoteForm());

    document.body.appendChild(app);

    // Populate categories and filter list
    populateCategories();
    filterQuotes();
});

function exportQuotes() {
    // Convert quotes array into JSON string
    const jsonData = JSON.stringify(quotes, null, 2);

    // Create a Blob with application/json type
    const blob = new Blob([jsonData], { type: "application/json" });

    // Create a temporary download link
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = "quotes.json";

    // Trigger download
    document.body.appendChild(downloadLink);
    downloadLink.click();

    // Cleanup
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
}
