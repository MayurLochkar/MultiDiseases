const express = require("express");
const router = express.Router();
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");

const upload = multer();

router.post("/", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded." });
        }

        const form = new FormData();
        form.append("file", req.file.buffer, req.file.originalname);

        const response = await axios.post(
            "http://127.0.0.1:8000/predict/pneumonia",
            form,
            { headers: form.getHeaders() }
        );

        res.json(response.data);

    } catch (error) {
        console.error("Pneumonia route error:", error.message);
        const status = error.response?.status || 500;
        const message = error.response?.data?.detail || error.message || "ML service error";
        res.status(status).json({ error: message });
    }
});

module.exports = router;