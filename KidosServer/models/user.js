// The user model

var mongoose = require('mongoose')
   ,Schema = mongoose.Schema;
var usercounter = require('../models/usercounter.js');
  
var userSchema = new Schema({
  //  thread: ObjectId,
    userid: Number,
    firstname: String,
    lastname: String,
    emailid: String,
    password: String
});

userSchema.pre('save', function(next) {
    var doc = this;
    usercounter.findByIdAndUpdate({_id: 'userid'}, {$inc: { seq: 1} }, function(error, usercounter)   {
        if(error)
            return next(error);
        console.log("in pre save, user counter is "+usercounter.seq);
        doc.userid = usercounter.seq;
        next();
    })
});


module.exports = mongoose.model('user', userSchema);
