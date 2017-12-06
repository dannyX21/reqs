let passport = require('passport');
let mongoose = require('mongoose');
let User = mongoose.model('User');

let sendJsonResponse = function(res, status, content) {
  res.status(status);
  res.json(content);
};

module.exports.register = function(req, res) {
  if(!req.body.name || !req.body.email || !req.body.username || !req.body.password) {
    sendJsonResponse(res, 400, {
      message: "All fields are required."
    });
    return ;
  }
  var user = new User();
  user.name = req.body.name;
  user.username = req.body.username;
  user.email = req.body.email;
  if (user.email == process.env.ADMIN) {
    user.admin = true;
  }
  user.setPassword(req.body.password);
  user.save(function(err) {
    let token;
    if(err) {
      sendJsonResponse(res, 404, err);
    } else {
      token = user.generateJwt();
      sendJsonResponse(res, 200, {
        "token": token
      });
    }
  });
};

module.exports.login = function(req, res) {
  if(!req.body.username || !req.body.password) {
    sendJsonResponse(res, 400, {
      message: "All fields are required."
    });
    return;
  }
  passport.authenticate('local', function(err, user, info) {
    let token;
    if(err) {
      sendJsonResponse(res, 404, err);
      return;
    }
    if(user) {
      if(user.delegating) {
        User.populate(user,{path: 'delegateTo', select: "name email"}, function(err, user) {
          token = user.generateJwt();
          sendJsonResponse(res, 200, {
            "token": token
          });
        });
      } else {
        token = user.generateJwt();
        sendJsonResponse(res, 200, {
          "token": token
        });
      }
    } else {
      sendJsonResponse(res, 401, info);
    }
  })(req, res);
};
