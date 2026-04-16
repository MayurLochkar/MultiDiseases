const express = require("express");
const router = express.Router();
const axios = require("axios");

router.post("/", async (req, res) => {
  try {
    const response = await axios.post(
      "http://127.0.0.1:8000/predict/diabetes",
      req.body,
      { headers: { "Content-Type": "application/json" } }
    );
    res.json(response.data);
  } catch (err) {
    console.error("Diabetes route error:", err.message);
    res.status(500).json({ error: "Diabetes prediction failed", details: err.message });
  }
});

module.exports = router;
