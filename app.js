// const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const { get } = require('request');

const app = express();

const viewsDir = path.join(__dirname, 'views')
app.use(express.static(viewsDir))
app.use(require('./middleware/sqlServer'))
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'face-api-js')))
app.use(express.static(path.join(__dirname, 'face-api-weights')))

app.get('/sw.js', (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.sendFile(path.join(__dirname, 'sw.js'));
})

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(logger('dev'));
app.use(cookieParser());

const usersRouter = require('./routes/users');
// app.use('/', indexRouter);
app.use('/users', usersRouter);
app.get('/', (req, res) => res.redirect('/home'))
app.get('/home', (req, res) => res.sendFile(path.join(viewsDir, 'index.html')))

// // catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

module.exports = app;
