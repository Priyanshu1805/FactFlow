const key = "AQ.Ab8RN6Is0xOv4gXIXFt2SiksbQlMoRXg7aVHQVNOB3LnhO_Peg";
fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: "Hello" }] }] })
}).then(res => res.json()).then(console.log).catch(console.error);
