let mongoose = require('mongoose');
let Account = mongoose.model('Account');
let User = mongoose.model('User');

let sendJsonResponse = function(res, status, content) {
  res.status(status);
  res.json(content);
};

module.exports.createAccount = function (req, res) {
  if(!req.body.num || !req.body.name || !req.body.rules) {
    sendJsonResponse(res, 404, {
      message: "Account number, name and approval rules are required."
    });
    return;
  }

  Account.create({
    category: req.body.category||0,
    num: req.body.num,
    name: req.body.name,
    rules: req.body.rules
  }, function(err, account) {
    if(err) {
      console.log("Error: " + err);
      sendJsonResponse(res, 400, err);
      return;
    }
    sendJsonResponse(res, 200, account);
  });
};

module.exports.accountsReadOne = function(req, res) {
  if(req.params && req.params.accountid) {
    Account.findOne({"_id": req.params.accountid}).exec(function(err, account) {
      if(err) {
        sendJsonResponse(res, 400, err);
        return;
      } else if(!account) {
        sendJsonResponse(res,404, {
          message: "Account not found"
        });
        return;
      } else {
        sendJsonResponse(res, 200, account);
      }
    });
  } else {
    sendJsonResponse(res, 404, {
      message: "No accountid on request."
    });
  }
};

module.exports.accountsReadOneByNumber = function(req, res) {
  if(req.params && req.params.number) {
    Account.findOne({"num": req.params.number}).exec(function(err, account) {
      if(err) {
        sendJsonResponse(res, 400, err);
        return;
      } else if(!account) {
        sendJsonResponse(res,404, {
          message: "Account not found"
        });
        return;
      } else {
        sendJsonResponse(res, 200, account);
      }
    });
  } else {
    sendJsonResponse(res, 404, {
      message: "No accountid on request."
    });
  }
};

module.exports.accountsUpdateOne = function(req, res) {
  if(!req.params.accountid){
    sendJsonResponse(res, 404, {
      message: "accountid is required."
    });
    return;
  }
  Account.findById(req.params.accountid).exec(function(err, account) {
    if(err){
      sendJsonResponse(res, 400, err);
      return;
    } else if(!account) {
      sendJsonResponse(res, 404, {
        message: "accountid # " + req.params.accountid + " was not found."
      });
      return;
    }
    account.num = req.body.num;
    account.name = req.body.name;
    account.category = req.body.category;
    account.rules = req.body.rules;
    account.save(function(err, account) {
      if(err) {
        sendJsonResponse(res, 400, err);
      } else {
        sendJsonResponse(res, 200, account);
      }
    });
  });
};

module.exports.getAccounts = function(req, res) {
  Account.find().exec(function(err, accounts) {
    if(err) {
      sendJsonResponse(res, 400, err);
      return;
    } else if (!accounts) {
      sendJsonResponse(res, 404, {
        message: "Accounts not found!"
      });
      return;
    } else {
      sendJsonResponse(res, 200, accounts);
    }
  });
};

module.exports.getAccountsMin = function(req, res) {
  Account.find().select('_id num name').exec(function(err, accounts) {
    if(err) {
      sendJsonResponse(res, 400, err);
      return;
    } else if (!accounts) {
      sendJsonResponse(res, 404, {
        message: "Accounts not found!"
      });
      return;
    } else {
      sendJsonResponse(res, 200, accounts);
    }
  });
};
