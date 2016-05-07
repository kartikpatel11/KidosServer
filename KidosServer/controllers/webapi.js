var mongoose=require('mongoose'),
Schema=mongoose.Schema;
var fs = require('fs');
var mime=require('mime');
var cat = require('../models/categorymaster.js');
var activities = require('../models/activities.js');



exports.registeractivity = (function(req,res){
	
	console.log("in registeractivity-params: "+JSON.stringify(req.body));

	var location=[];
	location[0]= parseFloat(req.body.longitude);
	location[1]= parseFloat(req.body.latitude);
	
	var activity= new activities ({
		
			//activityId:10,
			name: req.body.name,
			type: req.body.type,
		//	firstname: req.body.firstname, //new
		//	lastname: req.body.lastname, //new
		//	emailid: req.body.emailid, //new
		//	password: req.body.password, //new
		//	image: {type:String},
		//	rating: {type: Number},
			loc: {
				type: "Point",
				coordinates: location
			},
			addressline1: req.body.addressline1,
			landmark: req.body.landmark,
			contacts: req.body.contacts,
			description: req.body.description,
			area:req.body.area,
			pincode: req.body.pincode,
			city: req.body.city,
			state: req.body.state,
			fees: req.body.fees,
			unit:req.body.unit,
			age: req.body.age,
			batches: req.body.batches
	});
	
	console.log("about to store activity="+activity);
	
	activity.save(function (err, activity) {
	    if (err) { console.log( err); }
	    //res.json(201, activity);
	  });
	
	});
