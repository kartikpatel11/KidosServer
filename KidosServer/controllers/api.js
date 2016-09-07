var mongoose=require('mongoose'),
Schema=mongoose.Schema;
var fs = require('fs');
var mime=require('mime');
var cat = require('../models/categorymaster.js');
var activities = require('../models/activities.js');

var maxDistance = 5000000;
var limit = 100;

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
		    	loc: {
		    		$near: 
		        	{
		        		$maxDistance: maxDistance,
		        		$geometry: { type: 'Point', coordinates: coords }
		        	}
		      }
		    }).limit(limit).select('activityId name image rating area').exec(function(err, activitydoc) {
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


//'getactivitydetails'
exports.getactivitydetails = (function(req,res) {
	console.log("in getactivitydetails-params: "+req.params.activityid);
	activities.find({ activityId: req.params.activityid }, function (err, docs) {
    res.json(docs);
    });
});


//'/findnearbyactivitiestype'
/*

exports.findnearbyactivitiestype = (function(req,res) {
	
	cat.find(function (err, docs) {
    
	
	
	
	 var limit = req.query.limit || 10;
	    var maxDistance = req.query.distance || 15000;

	   // maxDistance /= 6371;
	    
	    var coords = [];
	    coords[0] = req.params.longitude;
	    coords[1] = req.params.latitude;

	    activities.find({
	      loc: {
	        $near: 
	        	{
	        		$maxDistance: maxDistance,
	        		$geometry: { type: 'Point', coordinates: coords }
	        	}
	      }
	    },{'_id': 0}).limit(limit).select('type').populate('type','_id').exec(function(err, activitydoc) {
	      if (err) {
	        return res.json(500, err);
	      }

	      	if(activitydoc!=null)
	      	{
	      		var answer = activitydoc.reduce(function (result, o) {
	      		    if (!(o.type._id in result)) {
	      		    	result.arr.push(result[o.type._id]= {
	      		    		_id:o.type._id,
	      		    		total : 1
	      		    	})	
	      		    ;
	      		    } else {
	      		    	result[o.type._id].total += 1;
	      		    }
	      		   return result;
	      		  
	      		}, { arr: [] }).arr;
	      	
	      		
	      		var finalobj=[];
	
	      		for (var _obj in docs)
	      		{
	      			var key=docs[_obj]._id;
	      			var found=false;
	      			for(var _obj2 in answer)
	      		    {
	      		    	if(answer[_obj2]._id.toString()===key.toString())
	      		    	{
	      		    		found=true;
	      		    		finalobj.push({
	      		      		    	
	    	      		    		_id:docs[_obj]._id,
	    	      		    		catId:docs[_obj].catId,
	    	      		    		catName:docs[_obj].catName,
	    	      		    		catImg:docs[_obj].catImg,
	    	      		    		total : answer[_obj2].total
	    	      		    	});	
	      		    		break;
	      		    	}
	      		    }
	      			
	      		    if(found==false)
	      		    {
	      		    	finalobj[_obj]=docs[_obj];
	      		    }
	      		}
	      		console.log(JSON.stringify(finalobj));
	      		res.json(200, finalobj);
	      	}
	     });
	 });
		    
	    
	    
}); */

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
	        	}
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



