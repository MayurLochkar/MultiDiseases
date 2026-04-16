const express = require("express");
const router = express.Router();
const axios = require("axios");

router.post("/", async (req, res) => {
  try {
    const response = await axios.post(
      "http://127.0.0.1:8000/predict/heart",
      req.body,
      { headers: { "Content-Type": "application/json" } }
    );
    res.json(response.data);
  } catch (err) {
    console.error("Heart route error:", err.message);
    res.status(500).json({ error: "Heart prediction failed", details: err.message });
  }
});

module.exports = router;
