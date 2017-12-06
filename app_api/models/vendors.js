let mongoose =  require('mongoose');

let vendorSchema = new mongoose.Schema({
  num: {type: Number, required: true, unique: true},
  name: {type: String, unique: true},
  country: {type: String, default: "US"},
  city: {type: String},
  shipVia: {type: String, default: "UP26"},
  contactName: {type: String},
  email: {type: String, required: true},
  phone: {type: String},
  website: {type: String}
});

mongoose.model('Vendor', vendorSchema);
