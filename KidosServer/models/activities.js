var mongoose=require('mongoose'),
Schema=mongoose.Schema;
var cat = require('./categorymaster.js');
var activitycounter = require('../models/activitycounter.js');



var activitiesSchema= new Schema({
	activityId: {type:Number},
	name: {type:String},
	OTP: {type:Number},
	activityStatus: {type: Number, required:true},
	images: [{
		name: {type:String},
		imgurl: {type:String}
	}],
	userid: {type: Number},
	rating: {type: Number},
	loc: {
		 "type": {"type": String},           
	     "coordinates": [Number]
	},
	//phone: [String],
	contacts: 
	{
		phno: {"type": String},
		altphno: {"type": String},
		mobno: {"type": String},
		website: {"type": String},
		twitter: {"type": String},
		facebook: {"type": String}
	},
	description: {type: String},
	addressline1: {type: String},
	addressline2: {type: String},
	landmark: {type: String},
	area:{type: String},
	pincode: {type:Number},
	city: {type: String},
	state: {type: String},
	fees: {type: Number},
	unit: {type: String},
	
	//state management starts
	published: {type: Boolean, default: false},
	//classdetails: {type: Boolean, default: false},
	contactdetails: {type: Boolean, default: false},
	activitydetails: {type: Boolean, default: false},
	locationdetails: {type: Boolean, default: false},
	imagesdetails: {type: Boolean, default: false},
	//state management ends
	age: {
		from: {type: Number},
		to: {type: Number}
	},
	batches: [{ 
			days: [String], 
			starttime: {type: String},
			endtime: {type: String}
	}],
		
	type: { type: Schema.Types.String, ref: 'categorymaster'}
	/*type: {
		_id: {type: String},
		catId: {type: Number},
		catName: {type: String},
		catImg: {type: String},
		catbackground: {type:String}
	}*/
	});

activitiesSchema.index({loc: '2dsphere' });


activitiesSchema.pre('save', function(next) {
    var doc = this;
    activitycounter.findByIdAndUpdate({_id: 'activityId'}, {$inc: { seq: 1} }, function(error, activitycounter)   {
        if(error)
            return next(error);
        console.log("in pre save, counter is "+activitycounter.seq);
        doc.activityId = activitycounter.seq;
        doc.loc = undefined;
        next();
    })
});

activitiesSchema.statics.findAndModify = function (query, sort, doc, options, callback) {
	  return this.collection.findAndModify(query, sort, doc, options, callback);
	};

module.exports = mongoose.model('activities', activitiesSchema);
