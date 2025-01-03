"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import "./globals.css";

export default function Home() {
    const [formData, setFormData] = useState({
        name: "",
        contact: "",
        date: "",
        time: "",
        guests: 1,
    });
    const [message, setMessage] = useState("");
    const [availableSlots, setAvailableSlots] = useState([]);
    const [bookingDetails, setBookingDetails] = useState(null);

    const backendURL = "https://resturant-booking-backend.onrender.com"; // Change to deployed backend URL if applicable

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    useEffect(() => {
        const fetchAvailableSlots = async () => {
            if (formData.date) {
                try {
                    const response = await axios.get(`${backendURL}/slots`, {
                        params: { date: formData.date },
                    });
                    setAvailableSlots(response.data);
                } catch (error) {
                    console.error("Error fetching available slots:", error);
                    setMessage("Unable to fetch available slots.");
                }
            }
        };

        fetchAvailableSlots();
    }, [formData.date]);

    const isDuplicateBooking = (booking) => {
        const existingBookings = JSON.parse(localStorage.getItem("bookings")) || [];
        return existingBookings.some(
            (b) =>
                b.date === booking.date &&
                b.time === booking.time &&
                b.contact === booking.contact
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isDuplicateBooking(formData)) {
            setMessage("Duplicate booking detected. Please choose a different slot.");
            return;
        }

        try {
            const response = await axios.post(
                `${backendURL}/book`,
                formData,
                { headers: { "Content-Type": "application/json" } }
            );

            // Save booking details in local storage
            const existingBookings = JSON.parse(localStorage.getItem("bookings")) || [];
            localStorage.setItem(
                "bookings",
                JSON.stringify([...existingBookings, formData])
            );

            setMessage("Booking successful!");
            setBookingDetails(response.data.booking);
        } catch (error) {
            console.error("Error booking the table:", error);
            setMessage(
                error.response?.data?.message || "Error booking the table."
            );
        }
    };

    const handlePrint = () => {
        const printContent = document.querySelector(".booking-details").innerHTML;
        const printWindow = window.open("", "_blank", "width=800,height=600");
        printWindow.document.open();
        printWindow.document.write(`
            <html>
                <head>
                    <title>Print Booking Details</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            margin: 20px;
                        }
                    </style>
                </head>
                <body>
                    ${printContent}
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    return (
        <div className="form-container">
            <h1>Restaurant Table Booking</h1>
            {message && <p className="message">{message}</p>}

            {bookingDetails ? (
                <div className="booking-details">
                    <h2>Booking Details</h2>
                    <p><strong>Name:</strong> {bookingDetails.name}</p>
                    <p><strong>Contact:</strong> {bookingDetails.contact}</p>
                    <p><strong>Date:</strong> {bookingDetails.date}</p>
                    <p><strong>Time:</strong> {bookingDetails.time}</p>
                    <p><strong>Guests:</strong> {bookingDetails.guests}</p>
                    <button onClick={handlePrint}>Print Booking Details</button>
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        name="name"
                        placeholder="Your Name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="text"
                        name="contact"
                        placeholder="Contact Number"
                        value={formData.contact}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                    />
                    <select
                        name="time"
                        value={formData.time}
                        onChange={handleChange}
                        required
                    >
                        <option value="" disabled>
                            Select a time slot
                        </option>
                        {availableSlots.map((slot) => (
                            <option key={slot} value={slot}>
                                {slot}
                            </option>
                        ))}
                    </select>
                    <input
                        type="number"
                        name="guests"
                        min="1"
                        max="10"
                        value={formData.guests}
                        onChange={handleChange}
                        required
                    />
                    <button type="submit">Book Table</button>
                </form>
            )}
        </div>
    );
}
