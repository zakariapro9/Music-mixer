/* jshint node: true */
var express = require('express');
var app = express();
var port  = process.env.PORT || 8080;
var mongoose  = require('mongoose');
var passport  = require('passport');
var flash  = require('connect-flash');
var winston = require('winston');
var winstonMongoDB = require('winston-mongodb').MongoDB;
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var path = require('path');
var fs = require('fs');

require('./config/passport')(passport); // pass passport for configuration

// ==================================================
// setting up express application ===================
// setup the logger
app.configure('development', 'test', 'production', function(){
    // Request Logging
    var logger = new (winston.Logger)({
        transports: [
            new (winston.transports.Console)({colorize:true}),
            new (winston.transports.File)({
                level: 'info',
                filename: './app/log/critical-logs.log',
                handleExceptions: true,
                json: true,
                maxsize: 5242880, //5MB
                maxFiles: 5,
                colorize: false
            })
         ]
    });
    app.use(require('winston-request-logger').create(logger));
});


app.use(cookieParser());
app.use(express.bodyParser({ keepExtensions: true, uploadDir: __dirname + '/_tmp' }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine','ejs');
// setting passport
app.use(session({secret:'a622946d-6efa-4698-bf10-a5297be5415'}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// setting routes of our app =======================================
require('./app/routes.js')(app, passport);
// runnig our app ==================================================

app.listen(port, function(){
    console.log('Music mix server is up and running at port:' + port);
});

module.exports = app;
