const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const RECORDS_FILE = path.join(__dirname, "../records.json");

// Utility to read records
const readRecords = () => {
    try {
        if (!fs.existsSync(RECORDS_FILE)) {
            return [];
        }
        const data = fs.readFileSync(RECORDS_FILE, "utf8");
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading records file:", error);
        return [];
    }
};

// Utility to write records
const writeRecords = (records) => {
    try {
        fs.writeFileSync(RECORDS_FILE, JSON.stringify(records, null, 2));
        return true;
    } catch (error) {
        console.error("Error writing records file:", error);
        return false;
    }
};

// GET all records
router.get("/", (req, res) => {
    const records = readRecords();
    res.json(records);
});

// POST new record
router.post("/", (req, res) => {
    const { patientName, patientAge, patientGender, diseaseType, result, advancedReport, date } = req.body;
    
    if (!patientName) {
        return res.status(400).json({ error: "Patient name is required" });
    }

    const records = readRecords();
    const newRecord = {
        id: Date.now(),
        patientName,
        patientAge,
        patientGender,
        diseaseType,
        result,
        advancedReport,
        date: date || new Date().toISOString()
    };

    records.unshift(newRecord); // Add to beginning (most recent first)
    
    if (writeRecords(records)) {
        res.status(201).json(newRecord);
    } else {
        res.status(500).json({ error: "Could not save record" });
    }
});

// DELETE a record
router.delete("/:id", (req, res) => {
    const id = parseInt(req.params.id);
    let records = readRecords();
    const initialLength = records.length;
    records = records.filter(r => r.id !== id);
    
    if (records.length < initialLength) {
        writeRecords(records);
        res.json({ message: "Record deleted" });
    } else {
        res.status(404).json({ error: "Record not found" });
    }
});

module.exports = router;
