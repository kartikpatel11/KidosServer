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

	console.log("activityid="+req.body.activityId+",name="+req.body.name+",area="+req.body.area+",addressline1="+req.body.addressline1+",state="+req.body.state+",city="+req.body.city+",pincode="+req.body.pincode);

	activities.update(
		{
			activityId:req.body.activityId
		}, 
		{
			$set:
			{
				name: req.body.name,
				addressline1: req.body.addressline1,
				area: req.body.area,
				city: req.body.city,
				state: req.body.state,
				pincode: req.body.pincode

			}
		}, 
	 
		function(err, result) 
		{
			if (!err)
			{
				console.log(result);
				res.status(201).send({msg:"Changes saved successfully"});
			}
			else // active activity
	    	{
	    		console.log( err);
	    		res.status(500).send({msg: "Something went wrong. Try again."});
	    	}
		});

});


//getcontactdetailsbyactivityid
exports.getcontactdetailsbyactivityid=(function(req,res){
    console.log("in getcontactdetailsbyactivityid-params: "+req.params.activityid);
    
        activities.aggregate(
        	[
        		{
        			$match: 
        			{ 
        					activityId: parseInt(req.params.activityid) 
        			}
        		},
        		{
        			"$project": 
        			{
        				activityId:"$activityId",
        				phno:"$contacts.phno",
        				mobno:"$contacts.mobno",
        				altphno:"$contacts.altphno",
        				website:"$contacts.website",
        				twitter:"$contacts.twitter",
        				facebook:"$contacts.facebook"
        			}
        		}
        	],function (err, docs) {
                res.json(200,docs);
        });

//      activities.findOne({ activityId: req.params.activityid },'activityId contacts.phno', function (err, docs) {
//              res.json(200,docs);
//      });
});

//savecontactdetailsbyactivityid
exports.savecontactdetailsbyactivityid=(function(req,res){
	console.log("in savecontactdetailsbyactivityid-params: ");
		});

