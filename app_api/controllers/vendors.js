let mongoose = require('mongoose');
let Vendor = mongoose.model('Vendor');

let sendJsonResponse = function(res, status, content) {
  res.status(status);
  res.json(content);
};

module.exports.getVendors = function(req, res) {
  Vendor.find().select("num name").sort({"name": "asc"}).exec(function(err, vendors) {
    if(err) {
      sendJsonResponse(res,404,err);
      return;
    }
    sendJsonResponse(res, 200, vendors);
  });
};
