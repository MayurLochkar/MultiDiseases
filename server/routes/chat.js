const express = require("express");
const axios   = require("axios");
const router  = express.Router();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// ── AI Helper ──
const sleep = (ms) => new Promise(res => setTimeout(res, ms));

async function callGemini(model, contents, retryCount = 0) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
  
  try {
    const response = await axios.post(url, {
      contents,
      generationConfig: { 
        temperature: 0.7, 
        maxOutputTokens: 1000 
      }
    }, { 
      headers: { "Content-Type": "application/json" },
      timeout: 30000 
    });

    return response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
  } catch (err) {
    const status = err.response?.status;
    const msg = err.response?.data?.error?.message || err.message;
    
    // Auto-retry once on 429
    if (status === 429 && retryCount < 1) {
      console.warn(`[Chat] ⏳ Rate limited on ${model}. Retrying in 1.2s...`);
      await sleep(1200);
      return callGemini(model, contents, retryCount + 1);
    }
    
    console.error(`[Chat] ❌ Model ${model} failed: ${msg}`);
    throw err;
  }
}

// ── Smart Model Health Tracker ──
const modelHealth = {};
const COOLDOWN_MS = 60000; // Increase to 1 minute

router.post("/", async (req, res) => {
  const { messages, systemPrompt } = req.body;

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: "Gemini API Key missing in server/.env" });
  }

  // Refined model list for ultra-fast response (v1 stable)
  // Verified models for this API key (Gwalior Region / Latest Tier)
  const modelsToTry = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-flash-latest"
  ];
  
  let lastError = null;
  const now = Date.now();

  const prunedMessages = messages.slice(-8); // Slightly more context

  const contents = [
    { role: "user", parts: [{ text: `SYSTEM INSTRUCTIONS: ${systemPrompt}\n\nUser has initiated a session. Please acknowledge the patient context and provide help accordingly.` }] }
  ];

  prunedMessages.forEach(m => {
    contents.push({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }]
    });
  });

  // 3. Execution with Smart Rotation
  for (const model of modelsToTry) {
    // Skip if in cooldown
    if (modelHealth[model] && (now - modelHealth[model] < COOLDOWN_MS)) {
      continue;
    }

    try {
      console.log(`[Chat] Attempting: ${model}`);
      const reply = await callGemini(model, contents);
      
      if (reply) {
        return res.json({ reply });
      }
    } catch (err) {
      const status = err.response?.status;
      lastError = { status, msg: err.response?.data?.error?.message || err.message };
      
      if (status === 429 || status === 500 || status === 503) {
          modelHealth[model] = Date.now();
      } else if (status === 401 || status === 403) {
          break; // Stop if API key issues
      }
    }
  }

  // Final Professional Error Handling
  const isRateLimit = lastError?.status === 429;
  const errorMsg = isRateLimit 
    ? "Our clinical AI nodes are high-capacity. Please wait a few seconds."
    : `Clinical AI Engine: ${lastError?.msg || "Connection disrupted"}. Please try again.`;

  return res.status(lastError?.status || 500).json({ error: errorMsg });
});

module.exports = router;
