const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

router.post("/register", async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        const hashed = await bcrypt.hash(password, 10);
        const user = new User({ username, email, password: hashed, role });
        await user.save();
        res.json({ message: "User registered successfully" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { username, password, role } = req.body;
        const user = await User.findOne({ username, role });

        if (!user) return res.status(404).json({ message: "User not found" });

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ message: "Invalid password" });

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

        let redirect;
        if (role === "admin") redirect = "admin_dashboard.html";
        else if (role === "faculty") redirect = "faculty_dashboard.html";
        else redirect = "student_dashboard.html";

        res.json({ status: "success", redirect, token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
