const key = "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";
fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: "Hello" }],
      max_tokens: 50,
    }),
}).then(res => res.json()).then(console.log).catch(console.error);
