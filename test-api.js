fetch("https://factflow-frontend.onrender.com/api/ollama/summarize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: "A massive earthquake hit Japan today. The government declared a state of emergency. Many people are being evacuated to safety zones." })
}).then(res => res.json()).then(console.log).catch(console.error);
