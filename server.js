const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public")); // serve your HTML
app.use("/api/auth", require("./routes/auth"));
app.use("/api/forgot", require("./routes/forgot"));

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB connected"))
    .catch(err => console.log("❌ MongoDB error:", err));

app.listen(process.env.PORT, () => console.log(`🚀 Server running on port ${process.env.PORT}`));
