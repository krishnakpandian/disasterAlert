//express setup
const express = require('express')
const app = express()
const path = require('path')
const request = require('request')
const distance = require('gps-distance')
app.use(express.static('./'))
app.use(express.json())

//db stuff
const User = require('./models/User')
const Contact = require('./models/Contact')
const Earthquake = require('./models/Earthquake')
const [dbuser, dbpw] = [process.env.dbuser, process.env.dbpw]
const mongoose = require('mongoose');
let dev_db_url = `mongodb://${dbuser}:${dbpw}@ds161794.mlab.com:61794/disaster`
let mongoDB = process.env.MONGODB_URI || dev_db_url;
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

//twilio
const accountSid = process.env.twilioSid; 
const authToken = process.env.twilioToken; 
const client = require('twilio')(accountSid, authToken); 

//demo probably
let to = ""
app.post('/text', function(req, res){
    client.messages 
      .create({ 
         body: 'Hi, I noticed that there was recently an earthquake nearby. Are you okay? (Sent from Aaron\'s Alexa)', 
         from: '+14153001679',       
         to: to.length>0? to : process.env.phoneNum
       }) 
      .then(message => console.log(message.sid)) 
      .done();
    res.status(202).send()
})
app.get('/text', function(req, res){
    client.messages 
    .create({ 
       body: 'Hi, I noticed that there was recently an earthquake nearby. Are you okay? (Sent from Aaron\'s Alexa)', 
       from: '+14153001679',       
       to: to.length>0? to : process.env.phoneNum
     }) 
    .then(message => console.log(message.sid)) 
    .done();
  res.status(202).send()}
  )
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, "Alexa", "html5up-solid-state", 'elements.html'))
})

app.post('/user/create', function (req, res) {
    var awesome_instance = new User({ email: req.body.email, userid: req.body.id, contacts: [] });
    awesome_instance.save(function (err) {
        if (err)
            res.status(500).send()
        else
            res.status(202).send()
    })
})

app.post('/user/email', function (req, res) {
    console.log('user email triggered')
    User.findOne({
        email: req.body.email}, function(err, user) {
            console.log(user, err)
            if (user)
                res.send(user)

            else
                res.status(400).send()

        }
    )
})

app.get('/notify', function (req, res) {
    sendNotification('fire')
    res.status(200).send()
})
function sendNotification(type, magnitude, person) {
    if (type == 'earthquake') {
        request('http://api.notifymyecho.com/v1/NotifyMe?notification=' +
            encodeURIComponent("A magnitude " +
                magnitude + ` earthquake was reported near ${person}. Should I call them and make sure they are ok?`)
            + '&accessCode=' +
            process.env.notifyAccessCode)
    } else {
        request(`http://api.notifymyecho.com/v1/NotifyMe?notification=${encodeURIComponent(`A ${type} was reported near ${person}. Should I call them and make sure they are ok?`)}&accessCode=` + process.env.notifyAccessCode)
    }
}
app.get('/user/contacts', function (req, res) { // this route will get all contacts (prolly filter out clientside for now)
    Contact.find({}).then(function (users) {
        res.send(users);
    });
})
app.post('/user/contacts', function(req, res){ // this route will add a new contact into the contacts array 
    console.log('contancts '+req.body)
    req.body = JSON.parse(req.body)
    let newContact = new Contact({name: req.body.name, lat: req.body.lat, lng: req.body.lng, phone: req.body.phone})
    newContact.save(function(err){if(err){res.status(500).send()}else{res.status(202).send()}})
})
app.get('/simulate', function(req, res){
    res.sendFile(path.join(__dirname, sim.html))
})

app.post('/simulate', function(req, res){ // this route will simulate an earthquake
    let newEarthquake = {magnitude: req.body.magnitude, lat: req.body.lat, lng: req.body.lng}
    setInterval(function(){ 
        Contact.find({}).then(function (users) {
            users
                .map(o=>{try{to=o.phone; sendNotification('earthquake', req.body.magnitude, o.name)}catch(e){}})
        });
    
        // from users get all close enough
        // send notifications after filtering array of those close enough
    }, 30000)
    res.status(200).send()
}) 

// debug route -- will return true if debugging
app.post('/debug', function (req, res) {
    console.log('the debug route was called with post')
    res.send(JSON.stringify({ success: true }))
})

// sets up the server
if (!process.env.PORT) process.env.PORT = 3000
app.listen(process.env.PORT, function () { console.log('now listening on ' + process.env.PORT) })