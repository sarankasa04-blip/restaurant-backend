const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

const reservationSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  date: String,
  time: String,
  guests: String
});

const Reservation = mongoose.model("Reservation", reservationSchema);

// Setup Gmail Transport
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for 465
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

app.post("/api/reservations", async (req, res) => {
  try {
    const reservation = new Reservation(req.body);
    await reservation.save();

    // Try sending email but don't fail if it breaks
    try {
      await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: req.body.email,
        subject: "Reservation Confirmed",
        html: `
          <h2>Reservation Successful</h2>
          <p>Name: ${req.body.name}</p>
          <p>Date: ${req.body.date}</p>
          <p>Time: ${req.body.time}</p>
          <p>Guests: ${req.body.guests}</p>
        `
      });
    } catch (emailError) {
      console.log("Email failed:", emailError.message);
    }

    // Always return success if saved
    res.json({ success: true });

  } catch (error) {
    console.log("Database error:", error.message);
    res.status(500).json({ success: false });
  }
});

app.get("/api/reservations", async (req, res) => {
  const reservations = await Reservation.find().sort({ _id: -1 });
  res.json(reservations);
});

app.listen(process.env.PORT || 5000, () =>
  console.log("Server Running")
);
