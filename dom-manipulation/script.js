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

    let quoteContainer = document.getElementById("quoteDisplay");
    if (!quoteContainer) {
        quoteContainer = document.createElement("div");
        quoteContainer.id = "quoteDisplay";
        document.body.appendChild(quoteContainer);
    }

    quoteContainer.innerHTML = `
        <p><strong>Quote:</strong> ${quote.text}</p>
        <p><em>Category:</em> ${quote.category}</p>
    `;

    document.body.appendChild(form);

    // Handle form submission
    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const text = document.getElementById("newQuoteText").value.trim();
        const category = document.getElementById("newQuoteCategory").value.trim();

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