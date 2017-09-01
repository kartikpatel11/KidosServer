var mongoose=require('mongoose'),
aws = require('aws-sdk'),
Schema=mongoose.Schema;
var fs = require('fs');
var mime=require('mime');
var twilio = require('twilio');
var cat = require('../models/categorymaster.js');
var activities = require('../models/activities.js');
var user = require('../models/user.js');


//AWS
//var AWS_ACCESS_KEY = 'AKIAIU5OIVUAWPDG5LOA';
//var AWS_SECRET_KEY = '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';
//var S3_BUCKET = 'kidosbucket';

//getactivitysummarybyuserid
exports.getactivitysummarybyuserid=(function(req,res){
	console.log("in getactivitysummarybyuserid-params: "+req.params.userid);
	activities.find({ userid: req.params.userid },'activityId name area', function (err, docs) {
		res.json(200,docs);
	});
});

//getclassdetailsbyactivityid
exports.getclassdetailsbyactivityid=(function(req,res){
	console.log("in getclassdetailsbyactivityid-params: "+req.params.activityid);
	activities.findOne({ activityId: req.params.activityid },'activityId name addressline1 area city state pincode', function (err, docs) {
		res.json(200,docs);
	});
});

//saveclassdetailsbyactivityid
exports.saveclassdetailsbyactivityid=(function(req,res){
	console.log("in saveclassdetailsbyactivityid-params: ");

	var activityID= req.body.activityid;
	var name=req.body.name;
	var area=req.body.area;
	var addressline1=req.body.addressline1;
	var state=req.body.state;
	var city=req.body.city;
	var pincode=req.body.pincode;

	activities.update(
		{
			"activityId":activityID
		}, 
		{
			$set:
			{
				"name": name,
				"addressline1": addressline1,
				"area": area,
				"city": city,
				"state": state,
				"pincode": pincode

			}
		}, 
	 
		function(err, result) 
		{
			if (!err)
				res.status(201).send("Changes saved successfully");
			else // active activity
	    	{
	    		console.log( err);
	    		res.status(500).send({msg: "Something went wrong. Try again."});
	    	}
		});

});
