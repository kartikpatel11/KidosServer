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
		docs.requestUrl= "getactivitysummarybyuserid";

		res.json(200,docs);
	});
});

//getclassdetailsbyactivityid
exports.getclassdetailsbyactivityid=(function(req,res){
	console.log("in getclassdetailsbyactivityid-params: "+req.params.activityid);
	activities.findOne({ activityId: req.params.activityid },'activityId name addressline1 area city state pincode', function (err, docs) {
		docs.requestUrl= "getclassdetailsbyactivityid";

		res.json(200,docs);
	});
});