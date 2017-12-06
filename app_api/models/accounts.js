let mongoose = require('mongoose');
let User = mongoose.model('User');
let autoIncrement = require('mongoose-auto-increment');
let conn = mongoose.connection;
autoIncrement.initialize(conn);

let approverSchema = new mongoose.Schema({
  user: {type: Number, ref: 'User'},
  username: {type: String},
  name: {type: String}
});

let ruleSchema = new mongoose.Schema({
  optional: [approverSchema],
  mandatory: [approverSchema],
  valueFrom: {type: Number, required: true, min: 0, default: 0},
  valueTo: {type: Number, min: 0}
});

let accountSchema = new mongoose.Schema({
  category: {type: Number, default: 0},
  num: {type: String, required: true, unique: true},
  name: {type: String, required: true},
  rules: [ruleSchema]
});

 approverSchema.plugin(autoIncrement.plugin,'Approver');
 ruleSchema.plugin(autoIncrement.plugin,'Rule');
 accountSchema.plugin(autoIncrement.plugin, 'Account');
 mongoose.model('Account', accountSchema);
 mongoose.model('Rule', ruleSchema);
 mongoose.model('Approver', approverSchema);
