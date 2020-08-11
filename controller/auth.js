const bcrypt = require('bcryptjs');
const User = require('../model/user');

// @desc    Register User Form
// @route   Get /register
// @access  Public
exports.registerform = async (req, res, next) => {
  res.render('user/signup');
};

// @desc    Register User
// @route   Post /register
// @access  Public
exports.register = async (req, res, next) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];
  if (!name || !email || !password || !password2) {
    errors.push({ msg: 'required input' });
  }
  if (password !== password2) {
    errors.push({ msg: 'password does not match ' });
  }
  if (password.length < 6) {
    errors.push({ msg: 'password should be at least 6 characters' });
  }
  if (errors.length > 0) {
    res.render('user/signup', {
      errors: errors
    });
  } else {
    //validation pass ...
    User.findOne({ email: email }).then(async user => {
      if (user) {
        //user exists
        errors.push({ msg: 'Email Address is Already Registered' });
        res.render('user/signup', {
          errors,
          name,
          email,
          password,
          password2
        });
      } else {
        const newuser = new User({ name, email, password });

        //hash password
        const salt = await bcrypt.genSalt(10);
        newuser.password = await bcrypt.hash(newuser.password, salt);
        await newuser.save();

        req.flash('success_msg', 'you are now signed up you can login');
        res.redirect('/loginform');
      }
    });
  }
};

// @desc    Ask user to login or to signup
// @route   Get /login
// @access  Public
exports.login = async (req, res, next) => {
  res.render('user/login');
};

// @desc    Login User Form
// @route   Get /loginform
// @access  Public
exports.loginForm = async (req, res, next) => {
  res.render('user/loginform');
};

// @desc    Login User
// @route   Post /login
// @access  Public
exports.loginAuthenticate = async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    req.flash('error_msg', 'Please provide an email and password');
    res.redirect('/loginform');
    return;
  }

  // Check for user
  const user = await User.findOne({ email });

  if (!user) {
    req.flash('error_msg', 'Invalid Username and Password');
    res.redirect('/loginform');
    return;
  }

  //Match user entered password to hashed password in database
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    req.flash('error_msg', 'Invalid Username and Password');
    res.redirect('/loginform');
    return;
  }

  // Create token
  const token = user.getSignedJwtToken();

  // assiging the redirect page after login by the roles
  let redirectPage = '/';
  if (user.roles == 'admin') redirectPage = '/admin';
  req.session.isAuthenticated = true;

  //create cookie and send response
  res
    .cookie('token', token, {
      expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
      secure: false
    })
    .redirect(redirectPage);
};

// @desc      Log user out/ clear cookie
// @route     GET  /logout
// @access    Private
exports.logout = async (req, res, next) => {
  req.session.isAuthenticated = false;
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10) // expires in 10 Msecond
  });
  res.redirect('/');
};
