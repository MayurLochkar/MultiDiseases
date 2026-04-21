const express = require("express");
const axios   = require("axios");
const router  = express.Router();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// ── AI Helper ──
const sleep = (ms) => new Promise(res => setTimeout(res, ms));

async function callGemini(model, contents, retryCount = 0) {
  const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
  
  try {
    const response = await axios.post(url, {
      contents,
      generationConfig: { 
        temperature: 0.7, 
        maxOutputTokens: 1000 // Increased for detailed solutions
      }
    }, { 
      headers: { "Content-Type": "application/json" },
      timeout: 30000 
    });

    return response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
  } catch (err) {
    const status = err.response?.status;
    
    // Auto-retry once on 429
    if (status === 429 && retryCount < 1) {
      console.warn(`[Chat] ⏳ Rate limited on ${model}. Retrying in 3s...`);
      await sleep(3000);
      return callGemini(model, contents, retryCount + 1);
    }
    throw err;
  }
}

router.post("/", async (req, res) => {
  const { messages, systemPrompt } = req.body;

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: "Gemini API Key missing in server/.env" });
  }

  // Use the models confirmed available for your key
  const modelsToTry = ["gemini-2.0-flash", "gemini-2.5-flash", "gemini-2.0-flash-lite"];
  let lastError = null;

  // Prepare contents for Gemini
  const contents = [
    { role: "user", parts: [{ text: `INSTRUCTIONS: ${systemPrompt}` }] },
    { role: "model", parts: [{ text: "I understand. I will provide specific medical solutions based on the diagnosis and context provided." }] }
  ];

  messages.forEach(m => {
    contents.push({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }]
    });
  });

  for (const model of modelsToTry) {
    try {
      console.log(`[Chat] Requesting real AI solution from: ${model}`);
      const reply = await callGemini(model, contents);
      
      if (reply) {
        console.log(`[Chat] ✅ Success with ${model}`);
        return res.json({ reply });
      }
    } catch (err) {
      const status = err.response?.status;
      lastError = { status, msg: err.response?.data?.error?.message || err.message };
      console.error(`[Chat] ❌ ${model} failed (${status})`);
      
      if (status === 401 || status === 403) break; // Key issue
    }
  }

  // If all real API calls fail, provide a real error (No dummy fallback as requested)
  const isRateLimit = lastError?.status === 429;
  const errorMsg = isRateLimit 
    ? "The AI is currently at maximum capacity. Please wait 20-30 seconds for a real solution based on your scan."
    : `AI Error: ${lastError?.msg || "Connection lost"}`;

  return res.status(lastError?.status || 500).json({ error: errorMsg });
});

module.exports = router;
