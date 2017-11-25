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
var S3_BUCKET = 'kidosbucket';

var AWS_ACCESS_KEY = '';
var AWS_SECRET_KEY = '';

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

//standard error messages
var STD_ERR_MSG ='Ohh! Some internal error. Please try again';


//send activation text
exports.sendactivationtext = (function(req,res){
	var phno=req.body.txtmobno;
	var output=sendsms(phno,ACTIVITY_MSG);
	if(output==0)
	{
		res.status(500).send({msg: STD_ERR_MSG});
	}
	else
	{
		res.status(201).send("Success");
	}
});


// reset password
exports.resetpassword = (function(req,res){
	
	//Get mobile no and otp
	var mobno= req.body.txtmobno;
	var otpno = req.body.txtotp;
	var email = req.body.txtemailid;
	var pass = req.body.txtpass;
	
	
	console.log("in reset password :"+JSON.stringify(req.body));
	console.log("mobno="+mobno+",otpno="+otpno+",email="+email+",pass="+pass);
	
	user.update(
			{
				$and: [
				      	{"emailid":email},
				      	{"OTP":otpno}
				      ]
			},
			{$set:{"password":pass}},
			function(err,result) {
				if(!err && result.nModified==1)
				{
				
					console.log("result="+JSON.stringify(result));
					console.log("password reset successfully for "+mobno);
		    		res.status(201).send({msg: "Password reset successfully. Please log in using new password."});
	    		
				}
				else
				{
					console.log("Error updating password for "+mobno);
					res.status(500).send({msg:"Error updating password. Please ensure emailID, mobile number and OTP is correct"});
				}
			}
	);
	
});




//generate password reset OTP
exports.generatePasswordResetOTP = (function(req, res){
	//Check if phone is registered or emailid is registered
	var mobno= req.body.txtmobno;
	var email= req.body.txtemailid;
	
	if(mobno!=null && mobno!='')
	{
		console.log("in generatePasswordResetOTP: trying to find mobno "+mobno);
	
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
			    	//If activity is found. get userid
			    	
			    	
			    	if(docs.length>0)
			    	{
			    		var otp=randomIntInc(LOW_RANDOM_LIMIT,HIGH_RANDOM_LIMIT);
			    		var smsbody="Hi,Reset your Kidos password by clicking on http://www.kidos.co.in/passwordreset. One Time Password is "+otp;
			    		
			    		console.log("Updating otp for "+docs[0].userid+", otp="+otp);
			    		
			    		var returnval=updateUserOTP(docs[0].userid, otp, function(returnval){
				    		
				    		if(returnval)
				    		{
				    			
				    			//sendsms(mobno, smsbody);
					    		console.log("password reset otp is sent successfully to "+mobno);
					    		res.status(201).send({msg: "One Time Password is successfully sent to given registered mobile number"});
					    		
				    		}
				    		else
				    		{
				    			
				    			console.log("issue in userid OTP updation.");
				    			res.status(500).send({msg:STD_ERR_MSG});
				    		}
			    		});
			    	}
			    	else
			    	{
			    		
			    		console.log("Could not find registered mobile no "+mobno);
			    		res.status(500).send({msg: "Oops!! Looks like the given mobile number is not registered with Kidos. Please try other number"});
			    	}
			    }
			    else
			    {
					console.log("Error while seraching mobileno "+mobno+" in  generatePasswordResetOTP. " +err);
					res.status(500).send({msg: STD_ERR_MSG});
			    }
			});
	}
	else if (email!=null && email!="")
	{
		
		console.log("in generatePasswordResetOTP: trying to find emailid "+email);
		 user.find({ emailid: email}).exec(function (err, docs) {
		
			 if(!err)
			 {
				 if(docs!=null && docs.length >0)
				 {
					 //TODO:send email about OTP to the given emaild
					 var returnval=updateUserOTP(docs[0].userid, otp, function(returnval){
				     if(returnval)
				     {
				    	
						 //sendemail
						 console.log("password reset otp is sent successfully to "+email);
						 res.status(201).send({msg:"One Time Password is successfully sent to given registered Email id"});
			    	 }
					 else
					 {
						 console.log("Error in updating OTP for emailid="+emai);
						 res.status(500).send({msg:STD_ERR_MSG});
					 }
					});
				 }
				 else
				 {
					 console.log("Could not find registered emailid "+email);
			    	res.status(500).send({msg: "Oops!! Looks like the given emailid is not registered with Kidos. Please try other email"});
			    	
				 }
			 }
			 else
			 {
				 console.log(err);
				 res.status(500).send({msg: STD_ERR_MSG});
			 }
		 });
				 
	}
	
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
	    	    	    		
	    	    	    		/*var output=sendsms(mobno,otpmsg);
	    	    	    		if(output==0)
	    	    	    		{
	    	    	    			res.status(500).send({msg: STD_ERR_MSG});
	    	    	    		}
	    	    	    		else*/
	    	    	    		{
	    	    	    			res.status(201).send("Success");
	    	    	    		}

	    	    			}
	    	    	    	else
	    	    	    	{
	    	    	    		console.log("err="+err);	
	    	    	    		res.status(500).send({msg: STD_ERR_MSG});
	    	    	    	}
	    	    	});
	    	    	res.status(201)        
	    		 	   .send('success');
	    	    }
	    		else // active activity
	    		{
	    			console.log( err);
	    			res.status(500).send({msg: "Wow!! It seems you are already verified. Please login using registered emailID/password"});
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
					},
					images: [],
					batches:[]
	    		});
			
	    		console.log("about to store activity="+activity);
			
	    		activity.save(function (err, activity) {
	    			if (err) { 
	    				console.log('Error saving dummy activity' + err); 
	    				res.status(500).send({msg: STD_ERR_MSG});
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
	    	console.log('Error querying activity linked to phone number'+err);
	    	res.status(500).send({msg: STD_ERR_MSG});
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
	var nick = req.body.txtnick;
	
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
						    password: pass,
						    OTP:1,
						    nickname: nick
						});
						users.save(function (err, users) {
						    if (err) { 
						    	console.log('Error inserting emailid and password'+ err); 
						    	res.status(500).send({msg: STD_ERR_MSG});
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
									res.status(500).send({msg: STD_ERR_MSG});
								}
							});
						});
					}
					else
					{
						console.log("error: No activity found activityStatus and OTP not found.");
						res.status(500).send({msg: "Ouch!! Either activity is already activated or wrong OTP entered."});
					}
				}
				else
				{
					console.log("error: activity find "+error);
					res.status(500).send({msg:STD_ERR_MSG});
				}
				
			}
			
		);
	});




function updateUserOTP(users,otp, fn)
{
	
	user.findAndModify(
			{"userid":users},
			[],
			{$set:{"OTP":otp}},
			{
				"new" :true,
				"upsert":false
			},
			function(err,result) {
				if(!err)
				{
					
					console.log("success in OTP update");
					fn(true);
				}
				else
				{
					console.log("error="+err);
					fn(false);
				}
			}
	);

}

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
	        return 1;
	    } 
	   else {
	        console.log('Oops! There was an error.'+ error);
	        return 0;
	        
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
		 if(docs!=null && docs.length >0)
		 {
			 
			 var user=docs[0].toObject().userid;
			 var nick=docs[0].toObject().nickname;
			 console.log("userid="+user+",nickname="+nick);
			 activities.find({ userid: user }, function (err, results) {
				 results.forEach(function (instance, index, array) {
				        array[index] = instance.toObject();
				        array[index].nickname = nick;
				     });   
				 
				 res.json(results[0]);
			 });
			 
	     }
		 else
		 {
			 res.status(500).json({ msg: "Invalid Email ID/Password" }); 
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
	    password: req.body.password,
	    nickname: req.body.nickname
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

    var params = {
  		Bucket: S3_BUCKET
 	};

	s3.headBucket(params, function(err, data) {
		console.log("In the headBucket check: "+err+","+data);
   		if (err) console.log(err, err.stack); // an error occurred
   		else     console.log(data);           // successful response
 	});


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
