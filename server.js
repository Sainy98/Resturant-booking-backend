const express = require("express");
const cors = require("cors");

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Static available slots
const availableSlots = [
    "12:00 PM", "12:30 PM", "01:00 PM",
    "01:30 PM", "02:00 PM", "02:30 PM",
    "07:00 PM", "07:30 PM", "08:00 PM",
    "08:30 PM", "09:00 PM", "09:30 PM",
];

// In-memory storage for bookings
const bookings = [];

// Fetch available slots
app.get("/slots", (req, res) => {
    const { date } = req.query;

    if (!date) {
        return res.status(400).json({ message: "Date is required." });
    }

    // Filter out already booked slots for the given date
    const bookedSlots = bookings
        .filter((booking) => booking.date === date)
        .map((booking) => booking.time);
    const freeSlots = availableSlots.filter((slot) => !bookedSlots.includes(slot));

    res.json(freeSlots);
});

// Handle booking
app.post("/book", (req, res) => {
    const { name, contact, date, time, guests } = req.body;

    if (!name || !contact || !date || !time || !guests) {
        return res.status(400).json({ message: "All fields are required." });
    }

    // Check if the slot is already booked
    const isSlotBooked = bookings.some(
        (booking) => booking.date === date && booking.time === time
    );

    if (isSlotBooked) {
        return res.status(400).json({ message: "Slot already booked." });
    }

    // Save booking to in-memory storage
    const newBooking = { name, contact, date, time, guests };
    bookings.push(newBooking);

    res.json({ message: "Booking successful!", booking: newBooking });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
