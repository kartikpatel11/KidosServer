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


//registeruser
exports.registeruser = (function(req,res){

	console.log("in registeruser-params: "+req.body);
	user.find({$or:[{mobile: req.body.mobile},{emailid:req.body.emailid}]}, function (err, docs) {

		if(docs.length > 0)
		{
			console.log( docs);
	    		res.status(300).send({errmsg: "Mobile or emailID is already registered."});
	    	
		}
		else
		{
			var newuser = new user(req.body);
			newuser.save(function (err, userdetail) {
				if (err) 
				{ 
				   	console.log('Error inserting user: '+ err); 
			    	res.status(300).send({errmsg: "Something went wrong. Try again."});
			    }
			    else
			    {
			    	console.log("user created successfully!!");
			    	res.status(201).json(userdetail);
			    }

			});

		}

	});

});


//kidospartnerslogin
exports.kidospartnerslogin=(function(req,res){
	console.log("in kidospartnerslogin-params: mobile="+req.body.mobile+",pass="+req.body.pass);
	user.find({ mobile:req.body.mobile, password:req.body.pass}).exec(function (err, docs) {
		 console.log("in loginservice-params: query output"+JSON.stringify(docs));
		 	req.json(200,docs);
		});

});

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
	activities.findOne({ activityId: req.params.activityid },'activityId name addressline1 area city state pincode userid type', function (err, docs) {
		res.json(200,docs);
	});
});

//saveclassdetailsbyactivityid
exports.saveclassdetailsbyactivityid=(function(req,res){
	console.log("in saveclassdetailsbyactivityid-params: " );
console.log("activityid="+req.body.activityId+",name="+req.body.name+",area="+req.body.area+",addressline1="+req.body.addressline1+",state="+req.body.state+",city="+req.body.city+",pincode="+req.body.pincode);


	if(req.body.activityId!=null && req.body.activityId!='' && req.body.activityId!=0.0 && req.body.activityId!='0.0')
	{
	
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
		    		res.status(300).send({errmsg: "Something went wrong. Try again."});
		    	}
			});
	}
	else
	{
		var newactivity = new activities(req.body);

		newactivity.save(function (err, userdetail) {
				if (err) 
				{ 
				   	console.log('Error adding activity: '+ err); 
			    	res.status(300).send({errmsg: "Something went wrong. Try again."});
			    }
			    else
			    {
			    	console.log("activity created successfully!!");
			    	res.status(201).send({msg:"Changes saved successfully",activityId: newactivity.activityId});
			    }

			});
	}
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
                res.json(200,docs[0]);
        });
});

//savecontactdetailsbyactivityid
exports.savecontactdetailsbyactivityid=(function(req,res){
	console.log("in savecontactdetailsbyactivityid-params: ");

	console.log("activityid="+req.body.activityId+",phno="+req.body.phno+",altphno="+req.body.altphno+",mobno="+req.body.mobno+",twitter="+req.body.twitter+",website="+req.body.website+",facebook="+req.body.facebook);

	activities.update(
		{
			activityId:req.body.activityId
		}, 
		{
			$set:
			{
				'contacts.phno': req.body.phno,
				'contacts.altphno': req.body.altphno,
				'contacts.mobno': req.body.mobno,
				'contacts.twitter': req.body.twitter,
				'contacts.facebook': req.body.facebook,
				'contacts.website': req.body.website

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

//getactivitydetailsbyactivityid
exports.getactivitydetailsbyactivityid=(function(req,res){
	console.log("in getactivitydetailsbyactivityid-params: "+req.params.activityid);
	activities.findOne({ activityId: req.params.activityid },'activityId description fees age batches', function (err, docs) {
		res.json(200,docs);
	});
});

//saveactivitydetailsbyactivityid
exports.saveactivitydetailsbyactivityid=(function(req,res){
	console.log("in saveactivitydetailsbyactivityid-params: ");

	//console.log("activityID="+req.body.activityId+",description="+req.body.description+",fees="+req.body.fees+",age="+req.body.age+",batches="+req.body.batches);
	console.log(req.body);
	
	activities.update(
		{
			activityId:req.body.activityId
		}, 
		{
			$set:
			{
				"description":req.body.description,
				"fees":req.body.fees,
				"batches": req.body.batches,
				"age": req.body.age
				
				
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

//getactivitylocationbyactivityid
exports.getactivitylocationbyactivityid=(function(req,res){
	console.log("in getactivitylocationbyactivityid-params: "+req.params.activityid);


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
        				coordinates:"$loc.coordinates",
        			}
        		}
        	],function (err, docs) {
                res.json(200,docs[0]);
        });


	//activities.findOne({ activityId: req.params.activityid },'activityId loc', function (err, docs) {
	//	res.json(200,docs);
	//});
});

//saveactivitylocationbyactivityid
exports.saveactivitylocationbyactivityid=(function(req,res){
	console.log("in saveactivitylocationbyactivityid-params: ");
	console.log(req.body);
	activities.update(
		{
			activityId:req.body.activityId
		}, 
		{
			$set:
			{	
				"loc": {
						type: "Point",
						coordinates: req.body.coordinates
					}
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


//getactivityimagesbyactivityid
exports.getactivityimagesbyactivityid=(function(req,res){
	console.log("in getactivityimagesbyactivityid-params: "+req.params.activityid);
	activities.findOne({ activityId: req.params.activityid },'activityId images', function (err, docs) {
		res.json(200,docs);
	});
});

//saveactivityimagesbyactivityid
exports.saveactivityimagesbyactivityid=(function(req,res){
	console.log("in saveactivityimagesbyactivityid-params: ");

	//console.log("activityID="+req.body.activityId+",description="+req.body.description+",fees="+req.body.fees+",age="+req.body.age+",batches="+req.body.batches);
	console.log(req.body);

	activities.update(
		{
			activityId:req.body.activityId
		}, 
		{
			$set:
			{	
				"images": req.body.images

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

