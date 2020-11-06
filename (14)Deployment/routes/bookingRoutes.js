const express = require('express');
const bookingController = require('./../controllers/bookingController');
const authController = require('./../controllers/authController');

const router = express.Router();

// Protecting All the Routes
router.use(authController.protect);

// The route for checking-out is available for everyone.
router.get('/checkout-session/:tourId', bookingController.getCheckoutSession);

// Restricting all the Routes after this to only Admin & Lead Guides
router.use(authController.restrictTo('admin', 'lead-guide'));

router
  .route('/')
  .get(bookingController.getAllBookings)
  .post(bookingController.createBooking);

router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

module.exports = router;
