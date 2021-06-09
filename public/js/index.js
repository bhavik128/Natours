/*eslint-disable*/
import '@babel/polyfill';
import {
  login,
  logout,
  signup,
  updateMe,
  updatePassword,
  forgetPassword,
  resetPassword
} from './auth';
import { displayMap } from './mapbox';
import { bookTour } from './stripe';

const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const signupForm = document.querySelector('.form--signup');
const updateMeForm = document.querySelector('.form--updateMe');
const updatePasswordForm = document.querySelector('.form--updatePassword');
const logoutBtn = document.querySelector('.nav__el--logout');
const forgetPasswordForm = document.querySelector('.form--forgetPassword');
const resetPasswordForm = document.querySelector('.form--resetPassword');
const bookTourBtn = document.getElementById('book-tour');

if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

if (loginForm) {
  loginForm.addEventListener('submit', async event => {
    event.preventDefault();
    event.target.lastChild.lastChild.textContent = 'LOGGING IN...';
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    await login(email, password, event);
  });
}

if (signupForm) {
  signupForm.addEventListener('submit', async event => {
    event.preventDefault();
    event.target.lastChild.lastChild.textContent = 'SIGNING UP...';
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;

    await signup(name, email, password, passwordConfirm, event);
  });
}

if (updateMeForm) {
  updateMeForm.addEventListener('submit', async event => {
    event.preventDefault();

    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);

    await updateMe(form);
  });
}

if (updatePasswordForm) {
  updatePasswordForm.addEventListener('submit', async event => {
    event.preventDefault();
    const currentPassword = document.getElementById('password-current').value;
    const newPassword = document.getElementById('password').value;
    const newPasswordConfirm =
      document.getElementById('password-confirm').value;

    await updatePassword(currentPassword, newPassword, newPasswordConfirm);
  });
}

if (forgetPasswordForm) {
  forgetPasswordForm.addEventListener('submit', async event => {
    event.preventDefault();
    event.target.lastChild.lastChild.textContent = 'SENDING EMAIL...';
    const email = document.getElementById('email').value;

    await forgetPassword(email, event);
  });
}

if (resetPasswordForm) {
  resetPasswordForm.addEventListener('submit', async event => {
    event.preventDefault();
    event.target.lastChild.lastChild.textContent = 'CHANGING PASSWORD...';
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;
    const resetToken = document.getElementById('resetToken').value;

    await resetPassword(password, passwordConfirm, resetToken, event);
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', logout);
}

if (bookTourBtn) {
  bookTourBtn.addEventListener('click', async event => {
    const temp = event.target.textContent;
    event.target.textContent = 'Processing...';
    const tourID = event.target.dataset.tourId;

    await bookTour(tourID);
    event.target.textContent = temp;
  });
}
