let fs = require('fs');
let path = require('path');

let sendJsonResponse = function(res, status, content) {
  res.status(status);
  res.json(content);
};

module.exports.uploadFile = function(req, res) {
  if(!req.files) {
    sendJsonResponse(res, 400, {
      message: "No files were uploaded."
    });
  }
  let attachment = req.files.attachment;
  let filePath = process.env.UPLOAD_PATH;
  let fileName = attachment.name;
  let index = 1;
  while(fs.existsSync(filePath + fileName)){
    let extension = path.extname(attachment.name);
    fileName = attachment.name.substring(0,attachment.name.length - extension.length) + "(" + index + ")" + extension;
    index ++;
  }
  attachment.mv(filePath + fileName, function(err) {
    if(err) {
      sendJsonResponse(res, 500, err);
    }
    sendJsonResponse(res, 200, {
      message: "File uploaded succesfully.",
      filePath: filePath,
      fileName: fileName
    });
  });
};
