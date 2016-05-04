var mongoose=require('mongoose'),
Schema=mongoose.Schema;
var fs = require('fs');
var mime=require('mime');
var jinqJs = require('jinq');
var cat = require('../models/categorymaster.js');
var activities = require('../models/activities.js');


exports.registeractivity = (function(req,res){
	
	console.log("in registeractivity-params: "+JSON.stringify(req.body));
	res.send("hi, this is my first angularjs response");
	 
	});