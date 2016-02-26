var mongoose=require('mongoose'),
Schema=mongoose.Schema;
var cat = require('./categorymaster.js');

/*
 * "batch" : {
        "1" : {
            "Mon" : [ 
                [ 
                    360, 
                    480
                ]
            ]
        },
        "2" : {
            "Tue" : [ 
                [ 
                    360, 
                    480
                ]
            ]
        }
    },
    "fees" : {
        "1" : {
            "amount" : 2500,
            "frequency" : 1,
            "unit" : "months"
        },
        "2" : {
            "amount" : 3000,
            "frequency" : 1,
            "unit" : "months"
        }
    },
    
 * 
 */
var activitiesSchema= new Schema({
	activityId: {type:Number, required:true},
	name: {type:String, required:true},
	image: {type:String},
	rating: {type: Number},
	loc: {
		 "type": {"type": String},           
	     "coordinates": [Number]
	},
	phone: [String],
	description: {type: String},
	addressline1: {type: String, required:true},
	addressline2: {type: String},
	area:{type: String},
	pincode: {type:Number},
	city: {type: String},
	state: {type: String},
	type: { type: Schema.Types.String, ref: 'categorymaster'}
	});

activitiesSchema.index({loc: '2dsphere' });

module.exports = mongoose.model('activities', activitiesSchema);
