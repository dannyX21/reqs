let mongoose = require('mongoose');
let User = mongoose.model('User');

let sendJsonResponse = function(res, status, content) {
  res.status(status);
  res.json(content);
};

module.exports.getUsers = function(req, res) {
  let query = {}
  if(req.query && req.query.query) {
    query.name = {
      $regex: new RegExp(".*" + req.query.query + ".*","i")
    };
  }
  User.find(query).select("_id name username email").exec(function(err, users) {
    if(err) {
      sendJsonResponse(res, 400, err);
      return;
    } else if (!users) {
      sendJsonResponse(res, 404, {
        message: "No users found"
      });
      return;
    } else {
      sendJsonResponse(res,200,users);
    }
  });
};

module.exports.getDelegatingUsers = function(req, res) {
  User.find({delegating:true, delegateUntil: {$gte: new Date()}}).populate("delegateTo","-hash -salt").select("_id delegating delegateTo delegateUntil").exec(function(err, users) {
    if(err) {
      sendJsonResponse(res, 400, err);
      return;
    } else if (!users) {
      sendJsonResponse(res, 404, {
        message: "No users found"
      });
      return;
    } else {
      sendJsonResponse(res,200,users);
    }
  });
};

module.exports.userReadOne = function(req, res) {
  if(req.params && req.params.userid) {
    User.findById(req.params.userid).populate('delegateTo', "-hash -salt").select("-hash -salt").exec(function (err, user) {
      if(!user) {
        sendJsonResponse(res, 404, {
          message: "User not found."
        });
        return;
      } else if(err) {
        sendJsonResponse(res, 404, err);
        return;
      } else {
        sendJsonResponse(res, 200, user);
      }
    });
  } else {
    sendJsonResponse(res, 404, {
      message: "No requisitionid on request"
    });
  }
};

module.exports.userUpdateOne = function (req, res) {
  if(!req.params.userid) {
    sendJsonResponse(res,404, {
      message: "userid is required."
    });
    return;
  }
  let userid = req.params.userid;
  User.findById(userid).exec(function(err, user) {
    if(!user) {
      sendJsonResponse(res, 404, {
        message: "User not found"
      });
      return;
    } else if (err) {
      sendJsonResponse(res, 400, err);
      return;
    }
    let data = req.body;
    user.name= data.name;
    user.email = data.email;
    user.delegating = data.delegating || false;
    user.delegateTo = data.delegateTo || null;
    user.delegateUntil = data.delegateUntil || null;
    user.admin = data.admin || false;
    user.mailNotifications = data.mailNotifications || false;
    user.save(function(err, user) {
      if(err) {
        sendJsonResponse(res, 404, err);
      } else {
        user.hash = null;
        user.salt = null;
        sendJsonResponse(res, 200, user);
      }
    });
  });
};
