import axios from 'axios';
import { showAlert } from './alerts';
const stripe = Stripe('pk_test_1GYExd91Xj8EYJ77wjUTOVFE00o3wmwJPP');

export const bookTour = async tourId => {
  try {
    console.log(tourId);
    // 1) Get Checkout Session from API
    const session = await axios(
      `http://localhost:3000/api/v1/bookings/checkout-session/${tourId}`
    );
    console.log(session);

    // 2) Create checkout form + Charge Credit Card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });

  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};