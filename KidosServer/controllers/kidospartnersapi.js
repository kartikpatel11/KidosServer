var mongoose=require('mongoose'),
aws = require('aws-sdk'),
Schema=mongoose.Schema;
var fs = require('fs');
var mime=require('mime');
var twilio = require('twilio');
var cat = require('../models/categorymaster.js');
var activities = require('../models/activities.js');
var user = require('../models/user.js');
var indiancities = require('../models/indiancities.js');
var msg91 = require("msg91")("183523AdC2LWvMW5a09d44b", "KIDOSP", "4" );

//random number
var LOW_RANDOM_LIMIT=1001;
var HIGH_RANDOM_LIMIT=9999;


var msg91options = {
  "method": "POST",
  "hostname": "api.msg91.com",
  "port": null,
  "path": "/api/v2/sendsms",
  "headers": {
    "content-type": "application/json",
    "authkey": ""
  }
};

//registeruser
exports.registeruser = (function(req,res){

	console.log("in registeruser-params: "+req.body);
	req.body.usertype="P";

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
			    	var message = 'Thank you for listing your activity on KidosPartners-An app to find activity classes for kids. Please login to KidosPartners app and update your activity. /n Login:'+userdetail.mobile;
	
					res.status(201).json(userdetail);

					sendmsg91sms(userdetail.mobile,message);
			    	
			    }

			});

		}

	});

});


function sendmsg91sms(mobileNo,message) { 
 
	//var mobileNo = "9820742767";

	msg91.send(mobileNo, message, function(err, response){
    	console.log(err);
    	console.log(response);
	});

};


//kidospartnerslogin
exports.kidospartnerslogin=(function(req,res){
	console.log("in kidospartnerslogin-params: mobile="+req.body.mobile+",pass="+req.body.pass);
	user.findOne({ mobile:req.body.mobile, password:req.body.pass, usertype:"P"}).exec(function (err, docs) {
		 if(!err)
		 {
		 	console.log("in loginservice-params: query output"+JSON.stringify(docs));
		 	
		 	res.json(200,docs);
		 }
		 else
		 {
		 	console.log("error="+err);
		 }

	});

});

//getactivitysummarybyuserid
exports.getactivitysummarybyuserid=(function(req,res){
	console.log("in getactivitysummarybyuserid-params: "+req.params.userid);
	activities.find({ userid: req.params.userid }).select('activityId name area published contactdetails activitydetails locationdetails imagesdetails type').populate('type').exec(function (err, docs) {
		res.json(200,docs);
	});
});

//getclassdetailsbyactivityid
exports.getclassdetailsbyactivityid=(function(req,res){
	console.log("in getclassdetailsbyactivityid-params: "+req.params.activityid);
	activities.findOne({ activityId: req.params.activityid },'activityId name addressline1 area city state pincode userid', function (err, docs) {
		res.json(200,docs);
	});
});

//saveclassdetailsbyactivityid
exports.saveclassdetailsbyactivityid=(function(req,res){
	console.log("in saveclassdetailsbyactivityid-params: " );
console.log("activityid="+req.body.activityId+",name="+req.body.name+",area="+req.body.area+",addressline1="+req.body.addressline1+",state="+req.body.state+",city="+req.body.city+",pincode="+req.body.pincode+",type="+req.body.type);


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
					pincode: req.body.pincode,
					

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
				'contacts.website': req.body.website,
				contactdetails: true

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
				"age": req.body.age,
				activitydetails: true
				
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
					},
				locationdetails: true
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
				"images": req.body.images,
				imagesdetails: true

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

// forgotpassword
exports.forgotpassword = (function(req, res){

console.log("in forgotpassword-params: "+req.body.phnoemail+".");

	user.findOne({
		$and:[
			{usertype:"P"},
			{$or:[{mobile: req.body.phnoemail},{emailid:req.body.phnoemail}]}
			]}, function (err, docs) {
		if (!err)
			{
				console.log("no error:" +docs);

				if(docs!=null)
				{
					var otpno=randomIntInc(LOW_RANDOM_LIMIT,HIGH_RANDOM_LIMIT);

					user.update(
					{
						userid:docs.userid
					},
					{
						$set:
						{
							OTP: otpno
						}
					},
					function(err, result) 
					{
						if (!err)
						{
							console.log(result);
							var message = "One Time Password to reset password for KidosPartners is "+otpno;
							sendmsg91sms(docs.mobile,message);
							res.status(201).send({msg:"Account found"});

						}
						else
						{

	    					console.log(err);
	    					res.status(500).send({msg: "Something went wrong. Try again."});
						}

					});

					
					
				}
				else
				{
					//account not found
					console.log("No account found for phone or mobile no: "+req.body.phnoemail+'.');
					res.status(300).send();
				}

			}
			else // active activity
	    	{
	    		console.log( err);
	    		res.status(500).send({msg: "Something went wrong. Try again."});
	    	}
	});

});


//resetkidospartnerspassword
exports.resetkidospartnerspassword = (function(req,res){
	console.log("in resetkidospartnerspassword-params: "+req.body);

	user.update(
		{
			$or:
			[
				{
					mobile: req.body.phNoEmail
				},
				{
					emailid:req.body.phNoEmail
				}
			],
			OTP: req.body.otp
		}, 
		{
			$set:
			{
				"password": req.body.pass
			}
		},
		function(err, result) 
		{
			if (!err)
			{
				console.log(result);
				if(result.nModified == 1)
				{
					res.status(201).send({msg:"Changes saved successfully"});
				}
				else
				{
					res.status(300).send();
				}
			}
			else // active activity
	    	{
	    		console.log( err);
	    		res.status(500).send({msg: "Something went wrong. Try again."});
	    	}
		}); 

});

// checkactivitystatebeforepublish
exports.checkactivitystatebeforepublish = (function(req, res){
	console.log("in checkactivitystatebeforepublish-params: "+req.params.activityId);

	activities.findOne({ activityId: req.params.activityId },'activityId contactdetails activitydetails locationdetails imagesdetails', function (err, docs) {
		res.json(200,docs);
	});


});

//updateactivitystate
exports.updateactivitystate = (function(req,res){
	console.log("in updateactivitystate-params: "+req.body);
	activities.update(
		{
			activityId:req.body.activityId
		}, 
		{
			$set:
			{
				"published": req.body.published
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

//listindiancities
exports.listindiancities = (function(req,res) {
	console.log("in listindiancities-params:");
	indiancities.find(function (err, docs) {
        res.send(docs);
    });
});

//generate random number
function randomIntInc (low, high) {
    return Math.floor(Math.random() * (high - low + 1) + low);
}


