const express = require('express');

const {
  loginForm,
  login,
  logout,
  loginAuthenticate,
  registerform,
  register
} = require('../controller/auth');

const router = express.Router();

router.get('/login', login);

router.get('/loginform', loginForm);
router.post('/login', loginAuthenticate);

router.get('/signup', registerform);
router.post('/signup', register);

router.get('/logout', logout);

module.exports = router;
