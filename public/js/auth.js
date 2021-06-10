import axios from 'axios';
import { showAlert } from './alert';

export const login = async (email, password, event) => {
  try {
    const res = await axios({
      method: 'POST',
      url: `${location.protocol}//${location.host}/api/v1/users/login`,
      data: {
        email,
        password
      }
    });
    if (res.data.status === 'success') {
      showAlert('success', res.data.message);
      event.target.lastChild.lastChild.textContent = 'LOGIN';
      window.setTimeout(() => {
        window.location = '/';
      }, 1500);
    }
  } catch (err) {
    event.target.lastChild.lastChild.textContent = 'LOGIN';
    showAlert('error', err.response.data.message);
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: `${location.protocol}//${location.host}/api/v1/users/logout`
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Logged out successfully');
      window.setTimeout(() => {
        window.location = '/';
      }, 1500);
    }
  } catch (err) {
    showAlert('error', 'Error logging out! Try again');
  }
};

export const signup = async (name, email, password, passwordConfirm,event) => {
  try {
    const res = await axios({
      method: 'POST',
      url: `${location.protocol}//${location.host}/api/v1/users/signup`,
      data: {
        name,
        email,
        password,
        passwordConfirm
      }
    });

    if (res.data.status === 'success') {
      showAlert('success', res.data.message);
      event.target.lastChild.lastChild.textContent = 'SIGNUP';
      window.setTimeout(() => {
        window.location = '/';
      }, 1500);
    }
  } catch (err) {
    event.target.lastChild.lastChild.textContent = 'SIGNUP';
    if (err.response.data.message === 'Duplicate field value: email')
      showAlert('error', 'Email already exists');
    else showAlert('error', err.response.data.message);
  }
};

export const updateMe = async data => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `${location.protocol}//${location.host}/api/v1/users/updateMe`,
      data
    });
    if (res.data.status === 'success') {
      showAlert('success', res.data.message);
      window.setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  } catch (err) {
    let message = err.response.data.message;
    if (message === 'Duplicate field value: email') {
      message = 'Email already in use';
    }
    showAlert('error', message);
  }
};

export const updatePassword = async (
  currentPassword,
  newPassword,
  newPasswordConfirm
) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `${location.protocol}//${location.host}/api/v1/users/updatePassword`,
      data: {
        currentPassword,
        newPassword,
        newPasswordConfirm
      }
    });

    if (res.data.status === 'success') {
      showAlert('success', res.data.message);
      window.setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const forgetPassword = async (email, event) => {
  try {
    const res = await axios({
      method: 'POST',
      url: `${location.protocol}//${location.host}/api/v1/users/forgetPassword`,
      data: {
        email
      }
    });

    if (res.data.status === 'success') {
      showAlert('success', res.data.message);
      event.target.lastChild.lastChild.textContent = 'SEND EMAIL';
      window.setTimeout(() => {
        window.location = '/';
      }, 1500);
    }
  } catch (err) {
    event.target.lastChild.lastChild.textContent = 'SEND EMAIL';
    showAlert('error', err.response.data.message);
  }
};

export const resetPassword = async (
  password,
  passwordConfirm,
  resetToken,
  event
) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `${location.protocol}//${location.host}/api/v1/users/resetPassword/${resetToken}`,
      data: {
        password,
        passwordConfirm
      }
    });

    if (res.data.status === 'success') {
      showAlert('success', res.data.message);
      event.target.lastChild.lastChild.textContent = 'CHANGE PASSWORD';
      window.setTimeout(() => {
        window.location = '/';
      }, 1500);
    }
  } catch (err) {
    event.target.lastChild.lastChild.textContent = 'CHANGE PASSWORD';
    showAlert('error', err.response.data.message);
  }
};
