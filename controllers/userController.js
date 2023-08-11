// backend/controllers/userController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Venue = require('../models/Venue');
const config =require('../config/config')

// Controller for user signup
exports.signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const newUser = new User({ username, email, password });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred while signing up.' });
  }
};

// Controller for user login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user || !await user.comparePassword(password)) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign({ sub: user._id }, config.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred while logging in.' });
  }
};

// Controller for booking a venue
// Controller for booking a venue
exports.bookVenue = async (req, res) => {
  try {
    const { venueId, bookingDate } = req.body;

    // Check if the user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized. Please login to book a venue.' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(401).json({ message: 'User not found.' });
    }

    const venue = await Venue.findById(venueId);
    if (!venue) {
      return res.status(404).json({ message: 'Venue not found.' });
    }

    // Check if the venue is available for booking on the specified date
    if (!venue.availableDates.includes(bookingDate)) {
      return res.status(400).json({ message: 'Venue not available on the specified date.' });
    }

    // Create a new Booking document
    const booking = new Booking({
      user: user._id,
      venue: venue._id,
      bookingDate: bookingDate,
    });

    // Save the booking
    await booking.save();

    // Update the venue's availability
    venue.availableDates = venue.availableDates.filter(date => date !== bookingDate);
    await venue.save();

    res.status(200).json({ message: 'Venue booked successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred while booking the venue.' });
  }
};
