const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Earthquake = new Schema({
    lat: {type: Number},
    lng: {type: Number},
    magnitude: {type: Number}
});


module.exports = mongoose.model('Earthquake', Earthquake);