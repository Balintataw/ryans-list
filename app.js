var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mustacheExpress = require('mustache-express');
var config = require('./config/default.json')
var session = require('express-session')
var authRoutes = require('./routes/auth')

var indexRouter = require('./routes/index');

var app = express();

// Register '.mustache' extension with The Mustache Express
app.engine('mustache', mustacheExpress());

// view engine setup
app.set('view engine', 'mustache');
app.set('views', path.join(__dirname, 'views'));



app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: config.session.secret,
  resave: true,
  saveUninitialized: false,
  cookie: {secure: false}
}))



app.use(authRoutes)

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

module.exports = app;
