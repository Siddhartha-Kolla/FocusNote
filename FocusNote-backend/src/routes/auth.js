const express = require("express");
const router = express.Router();
const prisma = require("../prismaClient");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";
const TOKEN_EXPIRATION = "1h";

// Register user
router.post("/register", express.json(), async (req, res) => {
  try {
    const { email, user_first_name, user_last_name, age } = req.body;
    
    // Validate required fields
    if (!email || !user_first_name || !user_last_name || !age) {
      return res.status(400).json({ 
        success: false, 
        message: "Email, first name, last name, and age are required" 
      });
    }

    // Validate email format
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return res.status(400).json({ success: false, message: "Invalid email format" });
    }

    // Validate age
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 13 || ageNum > 120) {
      return res.status(400).json({ 
        success: false, 
        message: "Age must be a number between 13 and 120" 
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ 
        success: false, 
        message: "An account with this email already exists" 
      });
    }

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        email,
        user_first_name,
        user_last_name,
        age: ageNum,
        role: "user"
      }
    });

    res.status(201).json({ 
      success: true, 
      message: "Account created successfully! Please log in.",
      user: {
        id: newUser.id,
        email: newUser.email,
        user_first_name: newUser.user_first_name,
        user_last_name: newUser.user_last_name
      }
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Request OTP
router.post("/request-otp", express.json(), async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return res.status(400).json({ success: false, message: "Invalid email" });
    }

    // Make sure user exists (create if not)
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "No account found with this email. Please register first." 
      });
    }

    // Generate OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    await prisma.otp.upsert({
      where: { email },
      update: { code, expires_at: expiresAt },
      create: { email, code, expires_at: expiresAt },
    });

    // Send OTP email
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: "Your FocusNote OTP Code",
      text: `Your code is ${code}. It expires in 10 minutes.`,
    });

    res.json({ success: true, message: "OTP sent" });
  } catch (err) {
    console.error("OTP error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Verify OTP
router.post("/verify-otp", express.json(), async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ success: false, message: "Email and code required" });
    }

    const otpRow = await prisma.otp.findUnique({ where: { email } });
    if (!otpRow) {
      return res.status(400).json({ success: false, message: "No OTP found" });
    }

    if (otpRow.code !== code) {
      return res.status(401).json({ success: false, message: "Invalid code" });
    }

    if (new Date() > otpRow.expires_at) {
      return res.status(401).json({ success: false, message: "Code expired" });
    }

    // Delete OTP after use
    await prisma.otp.delete({ where: { email } });

    // Issue JWT
    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: TOKEN_EXPIRATION });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 1000,
    });

    res.json({ success: true, message: "Logged in", token });
  } catch (err) {
    console.error("Verify OTP error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Current user
// NOTE: this route is mounted at `/auth` in the main app, so the path here
// must be `/me` (not `/auth/me`) or it would become `/auth/auth/me`.
router.get("/me", (req, res) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ success: false, message: "Not logged in" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ success: true, email: decoded.email });
  } catch (err) {
    console.error("JWT error:", err);
    res.status(401).json({ success: false, message: "Invalid token" });
  }
});

// Logout
router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
  res.json({ success: true, message: "Logged out" });
});

module.exports = router;