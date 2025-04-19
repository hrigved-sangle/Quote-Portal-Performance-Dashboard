document.getElementById("quoteForm").addEventListener("submit", async function (e) {
    e.preventDefault();
  
    const formData = new FormData(this);
    const data = Object.fromEntries(formData.entries());
  
    try {
      const response = await fetch("http://localhost:5000/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
  
      if (response.ok) {
        document.getElementById("responseMessage").textContent = "Quote submitted successfully!";
        this.reset();
      } else {
        document.getElementById("responseMessage").textContent = "Failed to submit quote.";
      }
    } catch (err) {
      console.error(err);
      document.getElementById("responseMessage").textContent = "Error submitting quote.";
    }
  });
  