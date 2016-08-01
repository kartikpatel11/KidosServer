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
var AWS_ACCESS_KEY = 'AKIAIU5OIVUAWPDG5LOA';
var AWS_SECRET_KEY = '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';
var S3_BUCKET = 'kidosbucket';

//TWILIO
var TWILIO_ACCOUNT_SID = 'ACf738201ca3763f7ffe0a4ce01a55cdfd';
var TWILIO_AUTH_TOKEN = 'c566ed82b213650adffb45bc1b498280';
var TWILIO_PHONE_NO = '+18572632945';
var OTP_MSG = "One Time Password to activate Kidos activity is";
var ACTIVITY_MSG ='Welcome to Kidos, the one place to find near by activities for the kids.';
//Your drawing classes are successfully registered with the app. Click http://www.kidos.co.in/auth, enter this mobile number to activate and update registered class information.'

//random number
var LOW_RANDOM_LIMIT=1001;
var HIGH_RANDOM_LIMIT=9999;


//send activation text
exports.sendactivationtext = (function(req,res){
	var phno;
	//sendsms(phno,ACTIVITY_MSG);
});



//generate OTP
exports.generateOTP = (function(req,res){
	//Check if phone is registered & activity-status=0 (activity-status:0-inactive,1-authenticated,2-publish)
	
	var mobno= req.body.txtmobno;
	console.log("in generateOTP: trying to find mobno "+mobno);
	
	//check if any activity is linked to given phno
	activities.find(
			{
				   	   $or: [
				    	         { 'contacts.phno': mobno }, 
				    	         { 'contacts.altphno': mobno },
				    	         { 'contacts.mobno': mobno }
				    	        ]
			}
			, function (err, docs) {
	    if(!err)
	    {
	    	//If activity is found. check activity status to confirm that its not yet verified
	    	if(docs.length>0)
	    	{
	    		if(docs[0].activityStatus==0) //inactive activity
	    		{
	    			//no need to check if user is null as it should be always the case.
	    			//generate random number
	    	    	var otp=randomIntInc(LOW_RANDOM_LIMIT,HIGH_RANDOM_LIMIT);
	    	    	console.log("OTP is :"+otp+",_id="+docs[0]._id);
	    	    	
	    	    	//store to mongodb
	    	    	
	    	    	activities.update({"_id":docs[0]._id}, {$set:{"OTP":otp}}, 
	    	    		function(err, result) {
	    	    	    	if (!err)
	    	    	    	{
	    	    	    		console.log("success");
	    	    	    		//send otp msg
	    	    	    		var otpmsg= OTP_MSG+" "+otp;
	    	    	    		console.log("in generateOTP: found mobno , sending OTP");
	    	    	    	//sendsms(mobno,otpmsg);
	    	    			}
	    	    	    	else
	    	    	    	{
	    	    	    	 console.log("err="+err);	
	    	    	    	}
	    	    	});
	    	    	res.status(201)        
	    		 	   .send('success');
	    	    }
	    		else // active activity
	    		{
	    			console.log( err);
	    			res.status(500).send("Activity is already verified. Please login using registered emailID/password");
	    		}
	    	}
	    	else //no activity with linked to this phone number, need to add dummy activity with phone number, OTP and activity status=0
	    	{
	    		
	    		//generate random number
    	    	var otp=randomIntInc(LOW_RANDOM_LIMIT,HIGH_RANDOM_LIMIT);
    	    	console.log("OTP is :"+otp);
    	    	
    	    	//store to mongodb
    	    	
	    		var activity= new activities ({
	    			
					contacts: {"mobno":mobno},
					OTP: otp,
					activityStatus: 0,
					loc: {
						type: "Point",
						coordinates: [0,0]
					}
	    		});
			
	    		console.log("about to store activity="+activity);
			
	    		activity.save(function (err, activity) {
	    			if (err) { 
	    				console.log( err); 
	    				res.status(500).send('Error saving dummy activity');
	    			}
			    
	    			console.log("success");
    	    		//send otp msg
    	    		var otpmsg= OTP_MSG+" "+otp;
    	    		console.log("in generateOTP: added dummy activity , sending OTP");
    	    		//sendsms(mobno,otpmsg);
	    			res.status(201).send("New dummy activity created");
	    		});
			}
				
	    }
	    else
	    {
	    	console.log(err);
	    	res.status(500).send('Error querying activity linked to phone number');
	    }
	});
});



//authenticate user
exports.authenticateuser = (function(req,res){
	console.log("in authenticateuser-params: "+JSON.stringify(req.body));
	
	//Get mobile no and otp
	var mobno= req.body.txtmobno;
	var otpno = req.body.txtotp;
	var email = req.body.txtemailid;
	var pass = req.body.txtpass;
	
	//Find record in DB with otp, phno and activityStatus=0
	activities.find(
			{
				$and: [
				       {
				    	   $or: [
				    	         { 'contacts.phno': mobno }, 
				    	         { 'contacts.altphno': mobno },
				    	         { 'contacts.mobno': mobno }
				    	        ]
				       },
				       {
				    	   'activityStatus': 0
				       },
				       {
				    	   'OTP': otpno
				       }
				      ]
			}
			, function (err, docs) {
				if(!err)
				{
					if(docs.length>0) //if one or more activities found
					{
						//First insert emailid and password to user table so user can login next time
						console.log("inserting email id and password");
						
						var users= new user({
							emailid: email,
						    password: pass
						});
						
						users.save(function (err, users) {
						    if (err) { 
						    	console.log( err); return;
						    	res.status(500).send('Error inserting emailid and password');
						    }
						
							
							
							//Update activitystatus=1, OTP=1 and userid to user
							console.log("updating OTP in DB to 1 and activitystatus=1 and userid="+users.userid+": "+docs[0]._id);
							activities.findAndModify(
									{"_id":docs[0]._id}, 
									[],
									{$set:{"OTP":1,"activityStatus":1,"userid":users.userid}},
									{
										"new" : true,
										"upsert" : false
									}, 
							function(err, result) {
								if (!err)
								{
									console.log("Document post update: "+result.value);
									res.json(result.value);
								}
								else
								{
									console.log("error while updating db activitystatus to 1 :"+err);
									res.status(500)        // HTTP status 404: NotFound
									   .send('error while updating db activitystatus to 1');
								}
							
							});
						});
					}
				}
				else
				{
					console.log("error: No activity found activityStatus and OTP not found.");
					res.status(404)        // HTTP status 404: NotFound
					   .send('Not found');
				}
				
			}
		);
	});


//generate random number
function randomIntInc (low, high) {
    return Math.floor(Math.random() * (high - low + 1) + low);
}

//send sms
function sendsms (phno,smsbody){
	
	var client = new twilio.RestClient(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
	client.sms.messages.create({
	    to: phno,
	    from:TWILIO_PHONE_NO,
	    //from:'kidos',
	    body:smsbody
	}, function(error, message) {
	   if (!error) {
	        console.log('Success! The SID for this SMS message is:');
	        console.log(message.sid);
	        console.log('Message sent on:');
	        console.log(message.dateCreated);
	    } 
	   else {
	        console.log('Oops! There was an error.'+ error);
	    }
	});
	
};



//loginservice
exports.loginservice = (function(req,res){
	
	console.log("in loginservice-params: "+JSON.stringify(req.body));
	var email= req.body.emailid;
	var pass= req.body.password;
	
	
	 user.find({ emailid: email, password: pass }).exec(function (err, docs) {
		 console.log("in loginservice-params: first query output"+JSON.stringify(docs));
		 if(docs!=null)
		 {
			 
			 var user=docs[0].toObject().userid;
			 console.log("userid="+user);
			 activities.find({ userid: user }, function (err, docs) {
				    res.json(docs[0]);
			 });
			 
	     }
		 else
		 {
			 res.status(500).json({ error: "Invalid Email ID/Password" }); 
		 }
        // res.json(docs);
     });
	
});


//registeractivity
exports.registeractivity = (function(req,res){
	
	console.log("in registeractivity-params: "+JSON.stringify(req.body));

	var location=[];
	location[0]= parseFloat(req.body.longitude);
	location[1]= parseFloat(req.body.latitude);
	
	
	var users= new user({
		firstname: req.body.firstname,
	    lastname: req.body.lastname,
	    emailid: req.body.emailid,
	    password: req.body.password
	});
	
	users.save(function (err, users) {
	    if (err) { console.log( err); return;}
	  
		var activity= new activities ({
			
				name: req.body.name,
				type: req.body.type,
				userid: users.userid,
				images: req.body.images ,
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
	});

exports.sign = (function(req,res) {
	
	
	aws.config.update({accessKeyId: AWS_ACCESS_KEY, secretAccessKey: AWS_SECRET_KEY});

    var s3 = new aws.S3();
    var options = {
      Bucket: S3_BUCKET,
      Key: req.query.file_name,
      Expires: 60,
      ContentType: req.query.file_type,
      ACL: 'public-read'
    }
    
    s3.getSignedUrl('putObject', options, function(err, data){
        if(err) return res.send('Error with S3')

        res.json({
          signed_request: data,
          url: 'https://s3-us-west-2.amazonaws.com/' + S3_BUCKET + '/' + req.query.file_name
        })
      })

});
