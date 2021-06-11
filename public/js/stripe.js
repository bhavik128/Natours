import axios from 'axios';
import showAlert from 'alert';

export const bookTour = async tourID => {
  const stripe = Stripe(`${process.env.STRIPE_PUBLIC_KEY}`);
  try {
    const session = await axios(
      `${location.protocol}//${location.host}/api/v1/bookings/checkout-session/${tourID}`
    );

    await stripe.redirectToCheckout({ sessionId: session.data.session.id });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};

// email verification
