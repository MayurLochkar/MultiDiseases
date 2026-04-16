const express = require("express");
const cors = require("cors");

const pneumoniaRoute = require("./routes/pneumonia");
const brainRoute = require("./routes/brain");
const skinRoute = require("./routes/skin");
const heartRoute = require("./routes/heart");
const diabetesRoute = require("./routes/diabetes");

const app = express();

app.use(cors());
app.use(express.json()); // ✅ Required for parsing JSON body in heart/diabetes routes

app.use("/api/pneumonia", pneumoniaRoute);
app.use("/api/brain", brainRoute);
app.use("/api/skin", skinRoute);
app.use("/api/heart", heartRoute);
app.use("/api/diabetes", diabetesRoute);

app.listen(5001, () => {
  console.log("Node server running on port 5001");
});