let mongoose = require('mongoose');
let nodemailer = require('nodemailer');
let Req = mongoose.model('Requisition');
let User = mongoose.model('User');

let sendJsonResponse = function(res, status, content) {
  res.status(status);
  res.json(content);
};

let getTotal = function(lines) {
  let total = 0;
  for(let c = 0; c<lines.length; c++) {
    total+= lines[c].qty * lines[c].unitPrice;
  }
  return total;
};

let getSubmitter = function(req, res, callback) {
  if(req.payload && req.payload.username) {
    User.findOne({username: req.payload.username}).exec(function(err, user) {
      if(!user) {
        sendJsonResponse(res, 404, {
          message: "User not found."
        });
        return;
      } else if (err) {
        sendJsonResponse(res, 404, err);
        return;
      }
      callback(req, res, {
        _id: user._id,
        name: user.name
      });
    });
  } else {
    sendJsonResponse(res, 404, {
      message: "User not found."
    });
    return;
  }
};

let sendMail = function(to, subject, html) {
  let transporter = nodemailer.createTransport({
    host: "smtp.office365.com",
    port: 587,
    secureConnection: 'false',
    auth: {
      user: process.env.MAIL_ACCT,
      pass: process.env.MAIL_PWD
    },
    tls: {
      ciphers: 'SSLv3'
    }
  });
  let mailOptions = {
    from: 'daniel.lopez@belf.com',
    to: to,
    subject: subject,
    html: html
  };
  transporter.sendMail(mailOptions, function(error, info) {
    if(error) {
      console.log("Mail Error: " + error);
    } else {
      console.log("Mail sent: " + info.response);
    }
  });
};

module.exports.getRequisitions = function(req, res) {
  // let po = req.query.po ? req.query.po : undefined;
  // let submitterId = req.query.submitterId ? req.query.submitterId : undefined;
  // let vendorId = req.query.vendorId ? req.query.vendorId : undefined;
  // let startDate = req.query.startDate ? req.query.startDate : undefined;
  // let endDate = req.query.endDate ? req.query.endDate : undefined;
  let query = {};
  if (req.query.po) {
    query.po = req.query.po;
  }
  if(req.query.submitterId && req.query.submitterId!=-1) {
    query.submitterId = req.query.submitterId;
  }
  if(req.query.vendorId && req.query.vendorId!=-1) {
    query.vendorId = req.query.vendorId;
  }
  if(req.query.startDate) {
    query.dateSubmitted = {
      $gte:  new Date(req.query.startDate)
    };
  }
  if(req.query.endDate) {
    if(!query.dateSubmitted) {
      query.dateSubmitted = {
        $lte: new Date(req.query.endDate)
      };
    } else {
      query.dateSubmitted.$lte = new Date(req.query.endDate);
    }
  }
  Req.find(query).select("-lines -attachments").sort({_id:"asc"}).exec(function(err, requisitions) {
    if(err) {
      sendJsonResponse(res, 404, err);
      return;
    }
    sendJsonResponse(res, 200, requisitions);
  });
};

module.exports.requisitionsReadOne = function(req, res) {
  if(req.params && req.params.requisitionid) {
    Req.findById(req.params.requisitionid).populate('acct','_id num name rules').populate('optApprovers','_id username name').populate('manApprovers','_id username name').exec(function (err, requisition) {
      if(!requisition) {
        sendJsonResponse(res, 404, {
          message: "Requisition not found."
        });
        return;
      } else if(err) {
        sendJsonResponse(res, 404, err);
        return;
      } else {
        sendJsonResponse(res, 200, requisition);
      }
    });
  } else {
    sendJsonResponse(res, 404, {
      message: "No requisitionid on request"
    });
  }
};

module.exports.requisitionsCreate = function(req, res) {
  getSubmitter(req, res, function (re, res, submitter) {
    let data = req.body;
    if(data.submitterId==undefined || !data.submitterName || !data.vendorId || !data.vendorName) {
      sendJsonResponse(res, 404, {
        message: "Submitter and Vendor fields are required"
      });
      return;
    }
    let total = getTotal(data.lines);
    Req.create({
      submitterId: submitter._id,
      submitterName: submitter.name,
      vendorId: data.vendorId,
      vendorName: data.vendorName,
      dateRequired: data.dateRequired,
      status: 1,
      currency: data.currency,
      orderType: data.orderType,
      acct: data.acct,
      lines: data.lines,
      attachments: data.attachments,
      comments: data.comments,
      optApprovers: data.optApprovers,
      optApprovals: data.optApprovals,
      manApprovers: data.manApprovers,
      manApprovals: data.manApprovals,
      total: total
    },function(err, requisition) {
      if(err) {
        sendJsonResponse(res, 400, err);
        return;
      }
      Req.populate(requisition, {path: "acct"}, function(err, requisition) {
        if(err) {
          console.log(err);
        }
        console.log(requisition);
        let approvers = requisition.optApprovers.concat(requisition.manApprovers);
        approvers.map(function(value, index) {
          delete value.username;
          delete value.name;
        });
        let html = generateMail(requisition);
        User.find({_id: {
          $in: approvers
          }
        }).select("_id name email mailNotifications").exec(function(err, receivers) {
          if(err) {
            console.log("Something went wrong: " + err);
          } else {
            receivers.forEach(function(item, index) {
              if(item.mailNotifications) {
                let personalizedMail = html.replace("{{receiver}}", item.name);
                sendMail(item.email, "Requisition# " + requisition._id, personalizedMail);
              }
            });
          }
        });
        sendJsonResponse(res, 201, requisition);
      });
    });
  });
};

module.exports.requisitionUpdateOne = function (req, res) {
  getSubmitter(req, res, function (req, res, submitter) {
    if(!req.params.requisitionid) {
      sendJsonResponse(res,404, {
        message: "Requisition number is required"
      });
      return;
    }
    let requisitionid = req.params.requisitionid;
    console.log("requisitionid: " + requisitionid);
    Req.findById(requisitionid).exec(function(err, requisition) {
      if(!requisition) {
        sendJsonResponse(res, 404, {
          message: "Requisition not found"
        });
        return;
      } else if (err) {
        sendJsonResponse(res, 400, err);
        return;
      }
      let data = req.body;
      let prevStatus = requisition.status;
      requisition.status = data.status;
      requisition.vendorId = data.vendor.num;
      requisition.vendorName = data.vendor.name;
      requisition.dateRequired = data.dateRequired;
      requisition.currency = data.currency;
      requisition.orderType = data.orderType;
      requisition.acct = data.acct;
      requisition.po = data.po;
      requisition.dateApproved = data.dateApproved;
      requisition.dateOrdered = data.dateOrdered;
      requisition.dateConfirmed = data.dateConfirmed;
      requisition.attachments = data.attachments;
      requisition.optApprovers = data.optApprovers;
      requisition.optApprovals = data.optApprovals;
      requisition.manApprovers = data.manApprovers;
      requisition.manApprovals = data.manApprovals;
      requisition.lines = data.lines;
      requisition.comments = data.comments;
      requisition.total = getTotal(data.lines);
      if(data.dateRejected) {
        requisition.dateRejected = data.dateRejected;
      }
      requisition.save(function(err, requisition) {
        if(err) {
          sendJsonResponse(res, 404, err);
        } else {
          if(prevStatus != data.status && (data.status == 2 || data.status == -1 || data.status == -2)) {
            User.findById(requisition.submitterId).select('email mailNotifications').exec(function (err, user) {
              if(err) {
                console.log(err);
              }
              if(user.mailNotifications) {
                let html = generateStatusMail(requisition);
                let statusText = "";
                switch(requisition.status) {
                  case 2:
                    statusText = "Approved!";
                    break;
                  case -1:
                    statusText = "Void";
                    break;
                  case -2:
                    statusText = "Rejected";
                    break;
                }
                sendMail(user.email, "Your requisition has been " + statusText, html);
              }
              sendJsonResponse(res, 200, requisition);
            });
          }
        }
      });
    });
  });
};

let generateMail = function(data) {
  let orderType = data.orderType == "I" ? "Inventory": "Non-Inventory";
  let html = "<!DOCTYPE html><html><head></head><body>" +
  "<div style='text-align:center;'><img src='http://localhost:3000/img/logo.png'/>" +
  "</div><div style='padding: 15px;'><h2 style='font-family: arial, sans-serif;'>Hello {{receiver}}" +
  ",</h2><p style='font-family: arial, sans-serif; font-size: 125%'>" +
  data.submitterName + " has submitted this requisition and it's waiting for your approval.</p>" +
  "<br /><div style='font-family: arial, sans-serif;'><table style='font-family: arial, sans-serif;border-collapse: collapse;width: 40%;'>" +
  "<tbody><tr><th style='border: 1px solid #dddddd;text-align: right;padding: 8px; font-size: 110%;'>Requisition# </th>" +
  "<th style='border: 1px solid #dddddd;text-align: left;padding: 8px; font-size: 125%;'><a href='http://localhost:3000/requisition/26'>26</a></th>" +
  "</tr><tr><td style='border: 1px solid #dddddd;text-align: right;padding: 8px;'>Vendor: </td>" +
  "<td style='border: 1px solid #dddddd;text-align: left;padding: 8px;'>" + data.vendorName +
  "</td></tr><tr><td style='border: 1px solid #dddddd;text-align: right;padding: 8px;'>Order type: </td>" +
  "<td style='border: 1px solid #dddddd;text-align: left;padding: 8px;'> " + orderType +
  "</td></tr><tr><td style='border: 1px solid #dddddd;text-align: right;padding: 8px;'>Account: </td>" +
  "<td style='border: 1px solid #dddddd;text-align: left;padding: 8px;'>" + data.acct.name +"</td>" +
  "</tr><tr><td style='border: 1px solid #dddddd;text-align: right;padding: 8px;'>Currency: </td>" +
  "<td style='border: 1px solid #dddddd;text-align: left;padding: 8px;'>" + data.currency +"</td>" +
  "</tr></tbody></table></div><br /><h4 style='font-family: arial, sans-serif;'>Items: </h4>" +
  "<div><table style='font-family: arial, sans-serif;border-collapse: collapse;width: 80%;'>" +
  "<thead><tr><th style='border: 1px solid #dddddd;text-align: center;padding: 8px;'>Ln#</th>" +
  "<th style='border: 1px solid #dddddd;text-align: center;padding: 8px;'>P/N</th>" +
  "<th style='border: 1px solid #dddddd;text-align: center;padding: 8px;'>Description</th>" +
  "<th style='border: 1px solid #dddddd;text-align: center;padding: 8px;'>UM</th>" +
  "<th style='border: 1px solid #dddddd;text-align: center;padding: 8px;'>Rev. Level</th>" +
  "<th style='border: 1px solid #dddddd;text-align: center;padding: 8px;'>Qty</th>" +
  "<th style='border: 1px solid #dddddd;text-align: center;padding: 8px;'>Unit Price</th>" +
  "<th style='border: 1px solid #dddddd;text-align: center;padding: 8px;'>Extended Price</th>" +
  "</tr></thead><tbody>";
  let total = 0;
  for(let c=0;c<data.lines.length; c++) {
    html += "<tr><td style='border: 1px solid #dddddd;text-align: center;padding: 8px;'>"+data.lines[c].ln + "</td>" +
    "<td style='border: 1px solid #dddddd;text-align: center;padding: 8px;'>"+ data.lines[c].pn + "</td>" +
    "<td style='border: 1px solid #dddddd;text-align: left;padding: 8px;'>" + data.lines[c].desc + "</td>" +
    "<td style='border: 1px solid #dddddd;text-align: center;padding: 8px;'>" + data.lines[c].um +"</td>" +
    "<td style='border: 1px solid #dddddd;text-align: center;padding: 8px;'>" + data.lines[c].rev + "</td>" +
    "<td style='border: 1px solid #dddddd;text-align: right;padding: 8px;'>" + data.lines[c].qty + "</td>" +
    "<td style='border: 1px solid #dddddd;text-align: right;padding: 8px;'>$" + data.lines[c].unitPrice + "</td>" +
    "<td style='border: 1px solid #dddddd;text-align: right;padding: 8px;'>$" + (Math.round(data.lines[c].unitPrice * data.lines[c].qty*100) / 100) + "</td>" +
    "</tr>";
    total += (data.lines[c].unitPrice * data.lines[c].qty);
  }
  html +="<tr><td style='border: 1px solid #dddddd;text-align: left;padding: 8px;'></td>" +
  "<td style='border: 1px solid #dddddd;text-align: center;padding: 8px;'><span><strong>Total: </strong></span></td>" +
  "<td style='border: 1px solid #dddddd;text-align: left;padding: 8px;'></td>" +
  "<td style='border: 1px solid #dddddd;text-align: left;padding: 8px;'></td>" +
  "<td style='border: 1px solid #dddddd;text-align: left;padding: 8px;'></td>" +
  "<td style='border: 1px solid #dddddd;text-align: left;padding: 8px;'></td>" +
  "<td style='border: 1px solid #dddddd;text-align: left;padding: 8px;'></td>" +
  "<td style='border: 1px solid #dddddd;text-align: right;padding: 8px;'><span><strong>$" + (Math.round(total * 100) / 100) +"</strong></span></td>" +
  "</tr></tbody></table></div>" +
  "<br /><div style='font-family: arial, sans-serif; font-size: 125%'>Please review " +
  "<a href='http://localhost:3000/requisition/" + data._id + "'>this requisition</a> and approve or reject it." +
  "</div><div style='font-family: arial, sans-serif; font-size: 125%'>Thank you,</div></div></body></html>";

  return html;
}

let generateStatusMail = function(data) {
  let orderType = data.orderType == "I" ? "Inventory": "Non-Inventory";
  let status = "";
  if(data.status==2) {
    status = "Approved";
  } else if(data.status==-1) {
    status = "Void";
  } else if(data.status==-2) {
    status = "Rejected";
  }
  let html = "<!DOCTYPE html><html><head></head><body>" +
  "<div style='text-align:center;'><img src='http://localhost:3000/img/logo.png'/>" +
  "</div><div style='padding: 15px;'><h2 style='font-family: arial, sans-serif;'>Hello " + data.submitterName +
  ",</h2><p style='font-family: arial, sans-serif; font-size: 125%'>" +
  "Your requisition has been <strong>" + status + "</strong>.</p>" +
  "<br /><div style='font-family: arial, sans-serif;'><table style='font-family: arial, sans-serif;border-collapse: collapse;width: 40%;'>" +
  "<tbody><tr><th style='border: 1px solid #dddddd;text-align: right;padding: 8px; font-size: 110%;'>Requisition# </th>" +
  "<th style='border: 1px solid #dddddd;text-align: left;padding: 8px; font-size: 125%;'><a href='http://localhost:3000/requisition/26'>26</a></th>" +
  "</tr><tr><td style='border: 1px solid #dddddd;text-align: right;padding: 8px;'>Vendor: </td>" +
  "<td style='border: 1px solid #dddddd;text-align: left;padding: 8px;'>" + data.vendorName +
  "</td></tr><tr><td style='border: 1px solid #dddddd;text-align: right;padding: 8px;'>Order type: </td>" +
  "<td style='border: 1px solid #dddddd;text-align: left;padding: 8px;'> " + orderType +
  "</td></tr><tr><td style='border: 1px solid #dddddd;text-align: right;padding: 8px;'>Account: </td>" +
  "<td style='border: 1px solid #dddddd;text-align: left;padding: 8px;'>" + data.acct.name +"</td>" +
  "</tr><tr><td style='border: 1px solid #dddddd;text-align: right;padding: 8px;'>Currency: </td>" +
  "<td style='border: 1px solid #dddddd;text-align: left;padding: 8px;'>" + data.currency +"</td>" +
  "</tr></tbody></table></div><br /><h4 style='font-family: arial, sans-serif;'>Items: </h4>" +
  "<div><table style='font-family: arial, sans-serif;border-collapse: collapse;width: 80%;'>" +
  "<thead><tr><th style='border: 1px solid #dddddd;text-align: center;padding: 8px;'>Ln#</th>" +
  "<th style='border: 1px solid #dddddd;text-align: center;padding: 8px;'>P/N</th>" +
  "<th style='border: 1px solid #dddddd;text-align: center;padding: 8px;'>Description</th>" +
  "<th style='border: 1px solid #dddddd;text-align: center;padding: 8px;'>UM</th>" +
  "<th style='border: 1px solid #dddddd;text-align: center;padding: 8px;'>Rev. Level</th>" +
  "<th style='border: 1px solid #dddddd;text-align: center;padding: 8px;'>Qty</th>" +
  "<th style='border: 1px solid #dddddd;text-align: center;padding: 8px;'>Unit Price</th>" +
  "<th style='border: 1px solid #dddddd;text-align: center;padding: 8px;'>Extended Price</th>" +
  "</tr></thead><tbody>";
  let total = 0;
  for(let c=0;c<data.lines.length; c++) {
    html += "<tr><td style='border: 1px solid #dddddd;text-align: center;padding: 8px;'>"+data.lines[c].ln + "</td>" +
    "<td style='border: 1px solid #dddddd;text-align: center;padding: 8px;'>"+ data.lines[c].pn + "</td>" +
    "<td style='border: 1px solid #dddddd;text-align: left;padding: 8px;'>" + data.lines[c].desc + "</td>" +
    "<td style='border: 1px solid #dddddd;text-align: center;padding: 8px;'>" + data.lines[c].um +"</td>" +
    "<td style='border: 1px solid #dddddd;text-align: center;padding: 8px;'>" + data.lines[c].rev + "</td>" +
    "<td style='border: 1px solid #dddddd;text-align: right;padding: 8px;'>" + data.lines[c].qty + "</td>" +
    "<td style='border: 1px solid #dddddd;text-align: right;padding: 8px;'>$" + data.lines[c].unitPrice + "</td>" +
    "<td style='border: 1px solid #dddddd;text-align: right;padding: 8px;'>$" + (Math.round(data.lines[c].unitPrice * data.lines[c].qty*100) / 100) + "</td>" +
    "</tr>";
    total += (data.lines[c].unitPrice * data.lines[c].qty);
  }
  html +="<tr><td style='border: 1px solid #dddddd;text-align: left;padding: 8px;'></td>" +
  "<td style='border: 1px solid #dddddd;text-align: center;padding: 8px;'><span><strong>Total: </strong></span></td>" +
  "<td style='border: 1px solid #dddddd;text-align: left;padding: 8px;'></td>" +
  "<td style='border: 1px solid #dddddd;text-align: left;padding: 8px;'></td>" +
  "<td style='border: 1px solid #dddddd;text-align: left;padding: 8px;'></td>" +
  "<td style='border: 1px solid #dddddd;text-align: left;padding: 8px;'></td>" +
  "<td style='border: 1px solid #dddddd;text-align: left;padding: 8px;'></td>" +
  "<td style='border: 1px solid #dddddd;text-align: right;padding: 8px;'><span><strong>$" + (Math.round(total * 100) / 100) +"</strong></span></td>" +
  "</tr></tbody></table></div>";

  if(data.status == 2) {
    html += "<br /><div style='font-family: arial, sans-serif; font-size: 125%'>Please process " +
    "<a href='http://localhost:3000/requisition/" + data._id + "'>this requisition</a>.";
  } else {
    html += "<br /><div style='font-family: arial, sans-serif; font-size: 125%'>Click " +
    "<a href='http://localhost:3000/requisition/" + data._id + "'>here</a> to review it.";
  }
  html += "</div><div style='font-family: arial, sans-serif; font-size: 125%'>Thank you,</div></div></body></html>";

  return html;
}
