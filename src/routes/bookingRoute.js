const express = require('express');
const router = express.Router();
const db = require('../config/db.js');

// Create a new booking
router.post('/', async (req, res) => {
  try {
    const { name, phoneNumber } = req.body;

    const sql = 'INSERT INTO bookings (name, phone_number) VALUES (?, ?)';
    await db.promise().execute(sql, [name, phoneNumber]);

    res.status(201).json({ message: 'Booking created successfully' });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'An error occurred while creating the booking' });
  }
});

// Get all bookings
router.get('/', async (req, res) => {
  try {
    const sql = 'SELECT * FROM bookings';
    const [results] = await db.promise().query(sql);

    res.status(200).json(results);
  } catch (error) {
    console.error('Error retrieving bookings:', error);
    res.status(500).json({ error: 'An error occurred while retrieving bookings' });
  }
});

module.exports = router;