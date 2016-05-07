var mongoose=require('mongoose'),
Schema=mongoose.Schema;
var cat = require('./categorymaster.js');
var activitycounter = require('../models/activitycounter.js');


var activitiesSchema= new Schema({
	activityId: {type:Number},
	name: {type:String, required:true},
	image: {type:String},
	rating: {type: Number},
	loc: {
		 "type": {"type": String},           
	     "coordinates": [Number]
	},
	//phone: [String],
	contacts: {
		phno: {"type": String},
		altphno: {"type": String},
		mobno: {"type": String}
	},
	description: {type: String},
	addressline1: {type: String, required:true},
	addressline2: {type: String},
	landmark: {type: String},
	area:{type: String},
	pincode: {type:Number},
	city: {type: String},
	state: {type: String},
	fees: {type: Number},
	unit: {type: String},
	age: {
		from: {type: Number},
		to: {type:Number}
	},
	batches: [{ 
			days: [String], 
			starttime: {type: String},
			endtime: {type: String}
	}],
		
	//type: { type: Schema.Types.String, ref: 'categorymaster'}
	type: {
		_id: {type: String},
		catId: {type: Number},
		catName: {type: String},
		catImg: {type: String}
	}
	});

activitiesSchema.index({loc: '2dsphere' });


activitiesSchema.pre('save', function(next) {
    var doc = this;
    activitycounter.findByIdAndUpdate({_id: 'activityId'}, {$inc: { seq: 1} }, function(error, activitycounter)   {
        if(error)
            return next(error);
        console.log("in pre save, counter is "+activitycounter.seq);
        doc.activityId = activitycounter.seq;
        next();
    })
});

module.exports = mongoose.model('activities', activitiesSchema);
