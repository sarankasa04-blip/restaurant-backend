const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// Reservation Schema
const reservationSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  date: String,
  time: String,
  guests: String,
});

const Reservation = mongoose.model("Reservation", reservationSchema);

// Gmail Transporter (Fixed Version)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

// POST - Save Reservation
app.post("/api/reservations", async (req, res) => {
  try {
    const reservation = new Reservation(req.body);
    await reservation.save();

    // Try sending email (won't break if fails)
    try {
      await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: req.body.email,
        subject: "Reservation Confirmed",
        html: `
          <h2>Reservation Successful</h2>
          <p><strong>Name:</strong> ${req.body.name}</p>
          <p><strong>Date:</strong> ${req.body.date}</p>
          <p><strong>Time:</strong> ${req.body.time}</p>
          <p><strong>Guests:</strong> ${req.body.guests}</p>
        `
      });
    } catch (emailError) {
      console.log("Email failed:", emailError.message);
    }

    res.json({ success: true });

  } catch (error) {
    console.log("Database error:", error.message);
    res.status(500).json({ success: false });
  }
});

// GET - View All Reservations
app.get("/api/reservations", async (req, res) => {
  const reservations = await Reservation.find().sort({ _id: -1 });
  res.json(reservations);
});

// Start Server
app.listen(process.env.PORT || 5000, () => {
  console.log("Server Running");
});
