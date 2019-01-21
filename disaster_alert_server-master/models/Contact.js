const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Contact = new Schema({
    name: {type: String},
    phone: {type: String},
    lat: {type: Number},
    lng: {type: Number},
});


module.exports = mongoose.model('Contact', Contact);