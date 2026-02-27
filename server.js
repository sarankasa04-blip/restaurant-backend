const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

// Schema
const reservationSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    date: String,
    time: String,
    guests: Number,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Reservation = mongoose.model("Reservation", reservationSchema);

// Create reservation
app.post('/api/reservations', async (req, res) => {
    try {
        const reservation = new Reservation(req.body);
        await reservation.save();
        res.status(201).json({ success: true, data: reservation });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get all reservations
app.get('/api/reservations', async (req, res) => {
    try {
        const reservations = await Reservation.find().sort({ createdAt: -1 });
        res.json(reservations);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Delete reservation
app.delete('/api/reservations/:id', async (req, res) => {
    try {
        await Reservation.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
