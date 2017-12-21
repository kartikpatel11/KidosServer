var mongoose=require('mongoose'),
Schema=mongoose.Schema;
var fs = require('fs');
var mime=require('mime');
var cat = require('../models/categorymaster.js');
var activities = require('../models/activities.js');
var msg91 = require("msg91")("183523AdC2LWvMW5a09d44b", "KIDOSP", "4" );


var maxDistance = 5000000;
var limit = 100;


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

//'/listcategories'
exports.listCategories = (function(req, res) {
	console.log("In listCategories::")
    cat.find(function (err, docs) {
        res.send(docs);
    });
});	

//'/listcategories/:catId'
exports.categoryById = (function(req,res){
	if (req.params.catId) {
        cat.find({ catId: req.params.catId }, function (err, docs) {
            res.json(docs);
        });
	 }
	});

//'getactivityareas/'
exports.getactivityareas = (function(req,res){
	activities.find().distinct('area', function(error, docs) {
	   res.json(docs);
	});
	
});

//'/download/:file(*)'
exports.downloadFile = (function(req,res){
	  var file = req.params.file
	    , path =  '/home/ec2-user/KidosServer/files/' + file;

	  var mimetype = mime.lookup(file);

	  res.setHeader('Content-disposition', 'attachment; filename=' + file);
	  res.setHeader('Content-type', mimetype);
	  
	  var filestream = fs.createReadStream(path);
	  filestream.pipe(res);
	  
	 //  var img = fs.readFileSync(path);
      // res.writeHead(200, {'Content-Type': 'image/png' });
      // res.end(img, 'binary');
	  
	
});

//'/findnearbyactivitiesbycategory'
exports.findnearbyactivitiesbycategory = (function(req,res) {
	    
	    
	    var coords = [];
	    coords[0] = parseFloat(req.params.longitude);
	    coords[1] = parseFloat(req.params.latitude);
	  
	    var input_id = req.params.id;
	    
	     activities.find({
		    	"type._id": input_id,
		    	"published": true ,
		    	loc: {
		    		$near: 
		        	{
		        		$maxDistance: maxDistance,
		        		$geometry: { type: 'Point', coordinates: coords }
		        	}
		       }
		    }).limit(limit).select('activityId name images rating area').exec(function(err, activitydoc) {
		      if (err) {
		        return res.json(500, err);
		      }

		      res.json(200, activitydoc);
		    })
	    
});


//'/findnearbyactivitiesbyareaandcategory'
exports.findnearbyactivitiesbyareaandcategory = (function(req,res) {
	    
	    
	    
	    var areainp = req.params.area;
	    var input_id = req.params.id;
	    
	     activities.find({
		    	"type._id": input_id,
		    	"area": areainp,
		    	"published": true
		    }).limit(limit).select('activityId name images rating area').exec(function(err, activitydoc) {
		      if (err) {
		        return res.json(500, err);
		      }

		      res.json(200, activitydoc);
		    })
	    
});


//'/findnearbyactivities'
exports.findnearbyactivities = (function(req,res) {
	    
	    
	    var coords = [];
	    coords[0] = req.params.longitude;
	    coords[1] = req.params.latitude;
	    activities.find({
	    "published": true ,	
	    loc: {
	        $near: 
	        	{
	        		$maxDistance: maxDistance,
	        		$geometry: { type: 'Point', coordinates: coords }
	        	}
	      }
	    }).limit(limit).exec(function(err, activitydoc) {
	      if (err) {
	        return res.json(500, err);
	      }

	      res.json(200, activitydoc);
	    });
	
});

//'/findnearbyactivitiesbyarea'
exports.findnearbyactivitiesbyarea = (function(req,res) {
	    
	    
	var areainp = req.params.area;
	activities.find({
	    area:areainp
	    ,published: true
	    }).limit(limit).exec(function(err, activitydoc) {
	      if (err) {
	        return res.json(500, err);
	      }

	      res.json(200, activitydoc);
	    });
	
});


//'getactivitydetails'
exports.getactivitydetails = (function(req,res) {
	console.log("in getactivitydetails-params: "+req.params.activityid);
	activities.find({ activityId: req.params.activityid }, function (err, docs) {
    res.json(docs);
    });
});


exports.registerclient = (function(req,res){

	console.log("in registerclient-params: "+req.body);
	req.body.usertype="C";
	
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


//kidoslogin
exports.kidoslogin=(function(req,res){
	console.log("in kidoslogin-params: mobile="+req.body.mobile+",pass="+req.body.pass);
	user.findOne({ mobile:req.body.mobile, password:req.body.pass, usertype:"C"}).exec(function (err, docs) {
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


function sendmsg91sms(mobileNo,message) { 
 
	//var mobileNo = "9820742767";

	msg91.send(mobileNo, message, function(err, response){
    	console.log(err);
    	console.log(response);
	});

};

exports.findnearbyactivitiestype = (function(req,res) {
	
	
	 	    
	    var coords = [];
	    coords[0] = parseFloat(req.params.longitude);
	    coords[1] = parseFloat(req.params.latitude);

	    activities.aggregate([
	    	{
	    		$geoNear: 
	        	{
	        		maxDistance: maxDistance,
	        		near:  coords,
	    			distanceField: "distance",
	    			spherical: true
	        	},
	        		
	    	},
	    	{ "$match": { published: true } },
        	{ 
        		$group: 
        		{
        			_id: 
        			{
        				"_id":"$type._id",
        				"catId":"$type.catId",
        				"catName": "$type.catName",
        				"catImg": "$type.catImg"
        			},
        			total: { $sum: 1  }
        		}
        	},
	    	{ 
        		$project: 
        		{ 
        			_id:"$_id._id",
        			catId: "$_id.catId",
        			catName: "$_id.catName",
        			catImg: "$_id.catImg",
        			total: 1
        		} 
        	}
	    	
        	
	      
	    ]).limit(limit).exec(function(err, activitydoc) {
	      if (err) {
	        return res.json(500, err);
	      }
	      res.json(activitydoc);
	    }
	);
	
});


exports.findnearbyactivitiestypebyarea = (function(req,res) {
	
	
	    
    
    var areainp=req.params.area;
   
    activities.aggregate([
    	{ $match : { 
    		area : areainp,
    		published: true } 
    	},
    	{ 
    		$group: 
    		{
    			_id: 
    			{
    				"_id":"$type._id",
    				"catId":"$type.catId",
    				"catName": "$type.catName",
    				"catImg": "$type.catImg"
    			},
    			total: { $sum: 1  }
    		}
    	},
    	{ 
    		$project: 
    		{ 
    			_id:"$_id._id",
    			catId: "$_id.catId",
    			catName: "$_id.catName",
    			catImg: "$_id.catImg",
    			total: 1
    		} 
    	}
    	
    	
      
    ]).limit(limit).exec(function(err, activitydoc) {
      if (err) {
        return res.json(500, err);
      }
      res.json(activitydoc);
    }
);

});


