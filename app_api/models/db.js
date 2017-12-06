let mongoose = require('mongoose');
let dbURI = 'mongodb://localhost/Reqs';

if(process.env.NODE_ENV === 'production') {
  dbURI = process.env.MLAB_URI;
}
mongoose.connect(dbURI, { useMongoClient: true});


mongoose.connection.on('connected', function() {
  console.log('Mongoose connected to: ' + dbURI);
});

mongoose.connection.on('error', function(err) {
  console.log('Mongoose connection error:  ' + err);
});

mongoose.connection.on('disconnected', function() {
  console.log('Mongoose disconnected  ');
});

let gracefulShutdown = function(msg, callback) {
  mongoose.connection.close(function () {
    console.log('Mongoose disconnected through ' + msg);
    callback();
  });
};

process.once('SIGUSR2', function() {  //Listen for SIGURSR2 which is what nodemon uses.
  gracefulShutdown('nodemon restart', function() {  //send message to gracefulShutdown and callback to kill process, emitting SIGUSR2
    process.kill(process.pid, 'SIGUSR2');
  });
});

process.on('SIGINT', function() { //Listen forn SIGINT emitted on application termination
  gracefulShutdown('app termination', function() {
    process.exit(0);  //send message to gracefulShutdown and call back to exit Node process.
  });
});

process.on('SIGTERM', function(){ //Listen for SIGTERM emitted when Heroku shutdown process
  gracefulShutdown('Heroku app shutdown', function() {
    process.exit(0);  //send message to gracefulShutdown and call back to exit Node process.
  });
});

require('./requisitions');
require('./users');
require('./vendors');
require('./accounts');
