const express = require("express");
const router = express.Router();
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");

const upload = multer();

router.post("/", upload.single("file"), async (req, res) => {

    const form = new FormData();
    form.append("file", req.file.buffer, req.file.originalname);

    const response = await axios.post(
        "http://127.0.0.1:8000/predict/brain",
        form,
        { headers: form.getHeaders() }
    );

    res.json(response.data);

});

module.exports = router;