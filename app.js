var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session')
var bodyParser = require('body-parser');
var multer  = require('multer');
var http = require('http');
var querystring = require('querystring');
var urlm = require('url');

var serveIndex = require('serve-index')

var clientupdate = require('./routes/clientupdate');
var gamemap = require('./routes/gamemap');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(cookieParser('fuckfuckfuckyou'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
    secret: 'keyboard cat',
    saveUninitialized: true, // (default: true)
    resave: true // (default: true)
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(multer({ dest: './public/clientupdate/'}));


//app.use(function(req, res, next) {
//    var auth;
//    if (req.headers.authorization) {
//        auth = new Buffer(req.headers.authorization.substring(6), 'base64').toString().split(':');
//    }
//    if (!auth || auth[0] !== 'handplay' || auth[1] !== 'handplay.com') {
//        res.statusCode = 401;
//        res.setHeader('WWW-Authenticate', 'Basic realm="handplay"');
//        res.end('Unauthorized');
//    } else {
//        next();
//    }
//});

app.use('/clientupdate', clientupdate);
app.use('/gamemapupload/', gamemap);
app.use('/gamemap', serveIndex('public/gamemap', {'icons': true}))

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
