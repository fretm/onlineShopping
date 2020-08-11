const fs = require('fs');
const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const expresslayout = require('express-ejs-layouts');
const passport = require('passport');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');

const adminRoute = require('./route/admin');
const userRoute = require('./route/user');
const authRoute = require('./route/auth');

//load env vars
dotenv.config({ path: './config/config.env' });

// Passport config
// require('./config/passport')(passport);

const app = express();

//Ejs setup

app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

app.use(
  session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
  })
);
//connect flash
app.use(flash());
app.use((req, res, next) => {
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.isAuthenticated = req.session.isAuthenticated;
  next();
});

// Sanitize data
app.use(mongoSanitize());

//Set security headers
app.use(helmet());

//Prevent cross sites attacks
app.use(xss());

//Compression the api file
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 100 request per 10 min
  max: 100
});
app.use(limiter);

//Prevent http param pollution
app.use(hpp());

//Enable CORS
app.use(cors());

//Set morgan logger middleware
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'access.log'),
  { flags: 'a' }
);
app.use(morgan('combined', { stream: accessLogStream }));

app.use('/images', express.static(path.join(__dirname, 'public', 'images')));
app.use('/css', express.static(path.join(__dirname, 'public', 'css')));
app.use('/js', express.static(path.join(__dirname, 'public', 'javaScript')));

//Mount routes
app.use(authRoute);
app.use('/admin', adminRoute);
app.use(userRoute);

//404 handler
app.use((req, res, next) => {
  res.render('404');
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MongoURI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(dbCon => {
    console.log(`MongoDB Connected ........`);
    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  })
  .catch(console.error);
