let quotes = [
    { text: "The journey of a thousand miles begins with a single step.", category: "Motivation" },
    { text: "In the middle of every difficulty lies opportunity.", category: "Inspiration" },
    { text: "Do not watch the clock. Do what it does. Keep going.", category: "Motivation" }
];

// Display area for quotes
function renderQuotes() {
    let quoteList = document.getElementById("quoteList");
    if (!quoteList) {
        quoteList = document.createElement("div");
        quoteList.id = "quoteList";
        quoteList.style.marginTop = "20px";
        document.body.appendChild(quoteList);
    }

    quoteList.innerHTML = ""; // Clear before re-render

    quotes.forEach((quote, index) => {
        const quoteItem = document.createElement("p");
        quoteItem.innerHTML = `<strong>${quote.category}:</strong> "${quote.text}"`;
        quoteList.appendChild(quoteItem);
    });
}

// Show random quote
function showRandomQuote() {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const quote = quotes[randomIndex];

    let quoteDisplay = document.getElementById("quoteDisplay");
    if (!quoteDisplay) {
        quoteDisplay = document.createElement("div");
        quoteDisplay.id = "quoteDisplay";
        quoteDisplay.style.marginTop = "20px";
        quoteDisplay.style.fontSize = "1.2em";
        document.body.appendChild(quoteDisplay);
    }

    quoteDisplay.innerHTML = `<strong>${quote.category}:</strong> "${quote.text}"`;
}

// Create form for adding new quotes
function createAddQuoteForm() {
    const form = document.createElement("form");
    form.id = "addQuoteForm";
    form.style.marginTop = "20px";

    const textInput = document.createElement("input");
    textInput.type = "text";
    textInput.placeholder = "Enter quote text";
    textInput.required = true;
    textInput.style.marginRight = "10px";

    const categoryInput = document.createElement("input");
    categoryInput.type = "text";
    categoryInput.placeholder = "Enter category";
    categoryInput.required = true;
    categoryInput.style.marginRight = "10px";

    const submitBtn = document.createElement("button");
    submitBtn.type = "submit";
    submitBtn.textContent = "Add Quote";

    form.appendChild(textInput);
    form.appendChild(categoryInput);
    form.appendChild(submitBtn);

    // On form submission, update array & DOM
    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const newQuote = {
            text: textInput.value.trim(),
            category: categoryInput.value.trim()
        };

        if (newQuote.text && newQuote.category) {
            quotes.push(newQuote); // Add to array
            renderQuotes(); // Refresh list
            alert("Quote added successfully!");
            textInput.value = "";
            categoryInput.value = "";
        }
    });

    document.body.appendChild(form);
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", function () {
    // Show random quote button
    const showBtn = document.createElement("button");
    showBtn.textContent = "Show Random Quote";
    showBtn.addEventListener("click", showRandomQuote);
    document.body.appendChild(showBtn);

    // Add quote form (always visible)
    createAddQuoteForm();

    // Render the initial quotes list
    renderQuotes();
});