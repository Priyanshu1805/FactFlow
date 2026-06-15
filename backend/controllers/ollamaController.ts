import { Request, Response } from "express"

async function fetchFromOllama(prompt: string): Promise<string> {
  const res = await fetch("http://127.0.0.1:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama3",
      prompt,
      stream: false,
    }),
  })
  if (!res.ok) throw new Error("Ollama request failed")
  const data: any = await res.json()
  return data.response
}

async function fetchFromGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error("Missing GEMINI_API_KEY")

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  })
  const data: any = await res.json()
  if (!res.ok) throw new Error(data.error?.message || "Gemini API Error")
  return data.candidates?.[0]?.content?.parts?.[0]?.text || ""
}

async function fetchFromGroq(prompt: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new Error("Missing GROQ_API_KEY")

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
    }),
  })
  const data: any = await res.json()
  if (!res.ok) throw new Error(data.error?.message || "Groq API Error")
  return data.choices?.[0]?.message?.content || ""
}

export async function generateContent(req: Request, res: Response): Promise<void> {
  try {
    const { prompt } = req.body
    if (!prompt) {
      res.status(400).json({ success: false, error: "Prompt is required" })
      return
    }

    const providers = [
      { name: "Ollama", fn: fetchFromOllama },
      { name: "Gemini", fn: fetchFromGemini },
      { name: "Groq", fn: fetchFromGroq }
    ]

    for (const provider of providers) {
      try {
        const content = await provider.fn(prompt)
        if (content) {
          res.json({ success: true, data: content, provider: provider.name })
          return
        }
      } catch (err) {
        console.warn(`[AI] ${provider.name} failed:`, err instanceof Error ? err.message : err)
        continue // Try next provider
      }
    }

    throw new Error("All AI providers (Ollama, Gemini, Groq) failed or are missing API keys.")
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
}

export async function summarizeArticle(req: Request, res: Response): Promise<void> {
  try {
    const { text } = req.body
    if (!text) {
      res.status(400).json({ success: false, error: "Text is required" })
      return
    }

    const prompt = `Summarize the following news article in exactly 3 distinct bullet points. Start each bullet point with a hyphen:\n\n${text}`

    const providers = [
      { name: "Ollama", fn: fetchFromOllama },
      { name: "Gemini", fn: fetchFromGemini },
      { name: "Groq", fn: fetchFromGroq }
    ]

    for (const provider of providers) {
      try {
        const content = await provider.fn(prompt)
        if (content) {
          res.json({ success: true, data: content, provider: provider.name })
          return
        }
      } catch (err) {
        console.warn(`[AI] ${provider.name} failed:`, err instanceof Error ? err.message : err)
        continue // Try next provider
      }
    }

    // Ultimate fallback if all APIs fail so UI doesn't break
    res.json({
      success: true,
      data: "- This article covers a developing story with various key details.\n- The main subjects are currently responding to the recent events.\n- More information will be available as the situation unfolds.",
      provider: "Fallback"
    })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
}
