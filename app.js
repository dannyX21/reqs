require('dotenv').load();
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
let uglifyJs = require('uglify-es');
let fs = require('fs');
let concat = require('concat');
let passport = require('passport'); //passport must be required before the model definition
let fileUpload = require('express-fileupload');

require('./app_api/models/db.js');  //Requiring the mongoose model so that the connection to the db is opened early.
require('./app_api/config/passport'); //Require strategy after the model definition.

var routesApi = require('./app_api/routes/index');

var app = express();

// view engine setup
//app.set('views', path.join(__dirname, 'app_server', 'views'));
app.set('view engine', 'jade');

let appClientFiles = [
"app_clientapp.js",
"app_client/common/directives/navigation/navigation.directive.js",
"app_client/common/directives/navigation/navigation.controller.js",
"app_client/common/directives/pageHeader/pageHeader.directive.js",
"app_client/common/directives/convertToNumber/convertToNumber.directive.js",
"app_client/common/directives/badgeQty/badgeQty.directive.js",
"app_client/common/directives/orderStatus/orderStatus.directive.js",
"app_client/home/home.controller.js",
"app_client/requisition/requisition.controller.js",
"app_client/newRequisition/newRequisition.controller.js",
"app_client/common/services/requisitionData.service.js",
"app_client/common/services/authentication.service.js",
"app_client/auth/register/register.controller.js",
"app_client/auth/login/login.controller.js"
];

// concat(appClientFiles, '/concat.js').then(function(result) {
//   //console.log(result);
//   let uglified = uglifyJs.minify(result, { compress: false });
//   fs.writeFile('/reqs.min.js', result, function(err) {
//     if(err) {
//       console.log(err);
//     } else {
//       console.log('Script generated and saved: reqs.min.js');
//     }
//   });
// });

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(fileUpload());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'app_client')));

app.use(passport.initialize());

app.use('/api', routesApi);

app.use(function(req, res) {    //route client application (page 307).
  res.sendFile(path.join(__dirname, 'app_client', 'index.html'));
});

//error handler
//Catch unauthorized errors
app.use(function(err, req, res, next) {
  if(err.name === "UnauthorizedError") {
    res.status(401);
    res.json({
      "message": err.name + ": " + err.message
    });
  }
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
