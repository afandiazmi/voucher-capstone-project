const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser'); // Add this line

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const viewRouter = require('./routes/viewRoutes');
const userRouter = require('./routes/userRoutes');
const voucherRouter = require('./routes/voucherRoutes');
const cartRouter = require('./routes/cartRoutes');
const orderHistoryRouter = require('./routes/orderHistoryRoutes');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1) GLOBAL MIDDLEWARES
app.use(express.static(path.join(__dirname, 'public')));

// Set security HTTP headers
// app.use(helmet()); // This is the default setting
app.use(helmet({ contentSecurityPolicy: false })); // This is the setting to allow all public use

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit request from the same API
const limiter = rateLimit({
  // 100 request from the same IP in 1 hour
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this IP. Please try again in an hour!',
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(
  express.json({
    limit: '100kb',
  }),
);
app.use(cookieParser()); // Add this line

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp());

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 3) ROUTES
app.use('/', viewRouter);

app.use('/api/v1/users', userRouter);
app.use('/api/v1/vouchers', voucherRouter);
app.use('/api/v1/cart', cartRouter);
app.use('/api/v1/order-history', orderHistoryRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
