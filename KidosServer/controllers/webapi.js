var mongoose=require('mongoose'),
aws = require('aws-sdk'),
Schema=mongoose.Schema;
var fs = require('fs');
var mime=require('mime');
var cat = require('../models/categorymaster.js');
var activities = require('../models/activities.js');
var user = require('../models/user.js');



var AWS_ACCESS_KEY = 'AKIAIU5OIVUAWPDG5LOA';
var AWS_SECRET_KEY = '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';
var S3_BUCKET = 'kidosbucket';

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
