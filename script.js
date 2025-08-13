// Initial array of quote objects
let quotes = [
    { text: "The best way to predict the future is to invent it.", category: "Motivation" },
    { text: "Life is 10% what happens to us and 90% how we react to it.", category: "Inspiration" },
    { text: "Do one thing every day that scares you.", category: "Courage" }
];

// Function to display a random quote
function showRandomQuote() {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const quote = quotes[randomIndex];

    let quoteContainer = document.getElementById("quote-container");
    if (!quoteContainer) {
        quoteContainer = document.createElement("div");
        quoteContainer.id = "quote-container";
        document.body.appendChild(quoteContainer);
    }

    quoteContainer.innerHTML = `
        <p><strong>Quote:</strong> ${quote.text}</p>
        <p><em>Category:</em> ${quote.category}</p>
    `;
}

// Function to create a form for adding new quotes
function createAddQuoteForm() {
    const form = document.createElement("form");
    form.id = "add-quote-form";
    form.innerHTML = `
        <h3>Add a New Quote</h3>
        <label for="quote-text">Quote:</label>
        <input type="text" id="quote-text" name="quoteText" required>
        <br><br>
        <label for="quote-category">Category:</label>
        <input type="text" id="quote-category" name="quoteCategory" required>
        <br><br>
        <button type="submit">Add Quote</button>
    `;

    document.body.appendChild(form);

    // Handle form submission
    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const text = document.getElementById("quote-text").value.trim();
        const category = document.getElementById("quote-category").value.trim();

        if (text && category) {
            // Add new quote to the array
            quotes.push({ text, category });

            // Show confirmation
            alert("Quote added successfully!");

            // Reset the form
            form.reset();
        }
    });
}

// Create UI elements on page load
document.addEventListener("DOMContentLoaded", function () {
    // Create "Show Random Quote" button
    const showBtn = document.createElement("button");
    showBtn.textContent = "Show Random Quote";
    showBtn.addEventListener("click", showRandomQuote);
    document.body.appendChild(showBtn);

    // Create Add Quote Form
    createAddQuoteForm();
});