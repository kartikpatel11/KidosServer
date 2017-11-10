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
    mobile: String,
    password: String,
    OTP: Number,
    nickname: String
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

userSchema.statics.findAndModify = function (query, sort, doc, options, callback) {
	  return this.collection.findAndModify(query, sort, doc, options, callback);
	};


module.exports = mongoose.model('user', userSchema);
