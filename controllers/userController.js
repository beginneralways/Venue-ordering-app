// backend/controllers/userController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Venue = require('../models/Venue');
const config =require('../config/config');
const Booking =require('../models/Booking')

// Controller for user signup
exports.signup = async (req, res) => {
  try {
    const { username, email, password ,isAdmin } = req.body;
    const newUser = new User({ username, email, password ,isAdmin});
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

// // Controller for booking a venue
// exports.bookVenue = async (req, res) => {
//   try {
//     const { venue: requestedVenue, bookingDate } = req.body; //takes venue only not venue_Id
//     console.log(requestedVenue,bookingDate)

//     try {
//       // Check if the user is authenticated
//       if (!req.user) {
//         throw new Error('Unauthorized. Please login to book a venue.');
//       }

//       const user = await User.findById(req.user._id);
//       console.log(user)
//       if (!user) {
//         throw new Error('User not found.');
//       }

//       const venue = await Venue.findById(requestedVenue);
//       if (!venue) {
//         throw new Error('Venue not found.');
//       }
//       console.log(bookingDate)

//       // Check if the venue is available for booking on the specified date
//       if (!venue.availableDates.includes(bookingDate)) {
//         throw new Error('Venue not available on the specified date.');
        
//       }

//       try {
//         // Create a new Booking document
//         const booking = new Booking({
//           user: user._id,
//           venue: venue._id,
//           bookingDate: bookingDate,
//         });

//         // Save the booking
//         await booking.save();

//         // Update the venue's availability
//         venue.availableDates = venue.availableDates.filter(date => date !== bookingDate);
//         await venue.save();

//         res.status(200).json({ message: 'Venue booked successfully.' });
//       } catch (bookingError) {
//         throw new Error('An error occurred while saving the booking.');
//       }
//     } catch (innerError) {
//       return res.status(400).json({ message: innerError.message });
//     }
//   } catch (error) {
//     res.status(500).json({ message: 'An error occurred while booking the venue.' });
//   }
// };



// Controller for booking a venue
exports.bookVenue = async (req, res) => {
  try {
    const { venue: requestedVenueId, bookingDate } = req.body; // takes venue Id only, not the whole object

    try {
      // Check if the user is authenticated
      if (!req.user) {
        throw new Error('Unauthorized. Please login to book a venue.');
      }

      const user = await User.findById(req.user._id);
      if (!user) {
        throw new Error('User not found.');
      }

      const venue = await Venue.findById(requestedVenueId);
      if (!venue) {
        throw new Error('Venue not found.');
      }

      const trimmedBookingDate = new Date(bookingDate).toISOString().split('T')[0];
      const availableDateStrings = venue.availableDates.map(date => date.toISOString().split('T')[0]);

      if (!availableDateStrings.includes(trimmedBookingDate)) {
        throw new Error('Venue not available on the specified date.');
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
      venue.availableDates = venue.availableDates.filter(date => date.toISOString().split('T')[0] !== trimmedBookingDate);
      await venue.save();

      res.status(200).json({ message: 'Venue booked successfully.' });
    } catch (innerError) {
      return res.status(400).json({ message: innerError.message });
    }
  } catch (error) {
    res.status(500).json({ message: 'An error occurred while booking the venue.' });
  }
};