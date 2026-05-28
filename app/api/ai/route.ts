export const runtime = 'edge';

// Basic in-memory rate limiting map (works per Edge region instance)
const rateLimitMap = new Map<string, { count: number, resetTime: number }>();

export async function POST(req: Request) {
  try {
    // Basic Rate Limiting: 10 requests per minute per IP
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "anonymous";
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute
    const maxRequests = 10;

    const limitInfo = rateLimitMap.get(ip) || { count: 0, resetTime: now + windowMs };
    
    if (now > limitInfo.resetTime) {
      limitInfo.count = 1;
      limitInfo.resetTime = now + windowMs;
    } else {
      limitInfo.count++;
    }
    
    rateLimitMap.set(ip, limitInfo);

    if (limitInfo.count > maxRequests) {
      return new Response(
        "Rate limit exceeded. To ensure fair usage for everyone, please wait a minute before sending more AI requests.", 
        { status: 429 }
      );
    }

    const { query, model = "gpt-4o-mini", image } = await req.json();

    if (!query && !image) {
      return new Response("Missing query or image", { status: 400 });
    }

    const openaiKey = process.env.OPENAI_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    // Helper to simulate a streaming response for models without keys
    const simulateStream = (text: string) => {
      const stream = new ReadableStream({
        async start(controller) {
          const words = text.split(" ");
          for (let i = 0; i < words.length; i++) {
            await new Promise(r => setTimeout(r, 40));
            controller.enqueue(new TextEncoder().encode(words[i] + " "));
          }
          controller.close();
        }
      });
      return new Response(stream, { headers: { "Content-Type": "text/event-stream" } });
    };

    // --- Pollinations AI (Free Unlimited) ---
    if (model === "free-unlimited") {
      try {
        let finalQuery = query || "Hello";
        if (image) finalQuery += " (Image attached but this free engine only reads text)";
        
        const response = await fetch(`https://text.pollinations.ai/prompt/${encodeURIComponent(finalQuery)}`);

        if (!response.ok) {
          return simulateStream("The Free AI network is currently congested. Please try again in a moment.");
        }

        const fullText = await response.text();
        return simulateStream(fullText);

      } catch (err) {
        return simulateStream("Failed to connect to Free AI Network.");
      }
    }

    // --- Gemini 1.5 Pro (Google) ---
    if (model === "gemini-1.5-pro") {
      if (!geminiKey) return simulateStream("Gemini API Key is not configured.");

      let contents: any[] = [{ role: "user", parts: [{ text: query || "What is in this image?" }] }];

      if (image) {
        // Extract base64 and mime type from data URI (e.g. data:image/png;base64,iVBOR...)
        const mimeMatch = image.match(/^data:(.*?);base64,(.*)$/);
        if (mimeMatch) {
          contents[0].parts.unshift({
            inline_data: {
              mime_type: mimeMatch[1],
              data: mimeMatch[2]
            }
          });
        }
      }

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?key=${geminiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents }),
      });

      if (!response.ok) {
        return simulateStream(`Gemini connection failed. Status: ${response.status}`);
      }

      const stream = new ReadableStream({
        async start(controller) {
          const reader = response.body?.getReader();
          if (!reader) return controller.close();
          const decoder = new TextDecoder("utf-8");
          let buffer = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            buffer += decoder.decode(value, { stream: true });
            
            // Gemini stream sends chunks of JSON arrays. It's tricky to parse perfectly without a library,
            // but we can extract "text": "..." using regex for simplicity in a raw proxy.
            const matches = [...buffer.matchAll(/"text":\s*"([^"]+)"/g)];
            if (matches.length > 0) {
              for (const match of matches) {
                // simple unescape (handles \n, \", etc basically)
                const text = match[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
                controller.enqueue(new TextEncoder().encode(text));
              }
              buffer = ""; // flush buffer once matched to prevent double sending
            }
          }
          controller.close();
        }
      });
      return new Response(stream, { headers: { "Content-Type": "text/event-stream" } });
    }

    // --- GPT-4o Mini (OpenAI) Default ---
    if (!openaiKey) return simulateStream("OpenAI API Key is not configured or invalid. Switch to the 'Pollinations AI' model which is completely free.");

    let userContent: any = query || "Please analyze this image.";
    if (image) {
      userContent = [
        { type: "text", text: query || "What is in this image?" },
        { type: "image_url", image_url: { url: image } }
      ];
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are Fact Flow AI. Be concise and smart." },
          { role: "user", content: userContent }
        ],
        stream: true,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      return simulateStream(`OpenAI Neural Network is offline (Quota exceeded or invalid key). Please switch your AI model to Gemini 1.5 Pro to continue.`);
    }

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) return controller.close();
        const decoder = new TextDecoder("utf-8");
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n").filter(l => l.trim());
          for (const line of lines) {
            const message = line.replace(/^data: /, "");
            if (message === "[DONE]") return controller.close();
            try {
              const parsed = JSON.parse(message);
              const text = parsed.choices[0]?.delta?.content || "";
              if (text) controller.enqueue(new TextEncoder().encode(text));
            } catch (e) {}
          }
        }
        controller.close();
      }
    });

    return new Response(stream, { headers: { "Content-Type": "text/event-stream" } });

  } catch (error: any) {
    console.error("AI Proxy Error:", error);
    return new Response(error.message, { status: 500 });
  }
}
