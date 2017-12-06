let mongoose =  require('mongoose');
let autoIncrement = require('mongoose-auto-increment');
let conn = mongoose.connection;
autoIncrement.initialize(conn);

let lineSchema = new mongoose.Schema({
  ln: {type: Number, required: true},
  pn: {type: String, required: true},
  desc: {type: String, required: true},
  um: {type: String, required: true, "default": "EA"},
  rev: {type: String, required: true, "default": "NA"},
  qty: {type: Number, required: true, "default": 1},
  unitPrice: {type: Number, required: true, min: 0},
  dateConfirmed: {type: Date }
});

let requisitionSchema = new mongoose.Schema({
  dateSubmitted: { type: Date,"default": Date.now },
  submitterId: { type: Number,required: true },
  submitterName: { type: String, required: true},
  status: { type: Number, min: -2, max: 4, "default": 0 },
  vendorId: {type: Number, required: true },
  vendorName: {type: String},
  dateRequired: { type: Date, "default": Date.now },
  currency: { type: String, "default": "USD"},
  orderType: {type: String, "default": "I"},
  acct: {type: Number, ref: 'Account', required: true},
  po: {type: String},
  dateApproved: {type:Date},
  dateOrdered: {type:Date},
  dateConfirmed: {type: Date},
  attachments: [String],
  optApprovers: [{type: Number, ref: 'User'}],
  optApprovals: [{type: Number, min: -1, max: 1, default: 0}],
  manApprovers: [{type: Number, ref: 'User'}],
  manApprovals: [{type: Number, min: -1, max: 1, default: 0}],
  dateRejected: {type: Date},
  lines: [lineSchema],
  comments: {type: String},
  total: {type: Number}
});

requisitionSchema.plugin(autoIncrement.plugin,'Requisition');
mongoose.model('Requisition', requisitionSchema);
