const jwt = require('jsonwebtoken');
const User = require('../model/user');

//protect routes

exports.protect = async (req, res, next) => {
  let token;
  if (req.cookies.token) {
    token = req.cookies.token;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exist

  if (!token) {
    return res.redirect('/login');
  }

  try {
    // verify Token
    const decoded = jwt.verify(token, 'asdfrewq'); //"asdfrewq" is the secret
    req.user = await User.findById(decoded.id);
    req.session.isAuthenticated = true;
    return next();
  } catch (err) {
    return res.redirect('/login');
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.roles)) {
      return res.redirect('/login');
    }
    next();
  };
};