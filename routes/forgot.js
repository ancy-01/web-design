const express = require("express");
const router = express.Router();
const User = require("../models/User");
const nodemailer = require("nodemailer");

router.post("/forgot", async (req, res) => {
    const { email } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpExpiry = Date.now() + 5 * 60 * 1000;

    const user = await User.findOneAndUpdate({ email }, { otp, otpExpiry });
    if (!user) return res.status(404).json({ message: "Email not found" });

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Attendo Password Reset OTP",
        text: `Your OTP is ${otp}. It will expire in 5 minutes.`
    };

    transporter.sendMail(mailOptions, (err) => {
        if (err) return res.status(500).json({ message: "Failed to send OTP" });
        res.json({ message: "OTP sent successfully" });
    });
});

router.post("/reset", async (req, res) => {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email, otp });

    if (!user || user.otpExpiry < Date.now())
        return res.status(400).json({ message: "Invalid or expired OTP" });

    const bcrypt = require("bcrypt");
    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    res.json({ message: "Password reset successful" });
});

module.exports = router;
