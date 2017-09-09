
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , mongoose = require('mongoose');

var app = express();

// all environments
app.set('port', process.env.PORT || 8080);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect('mongodb://localhost/kidosdb');

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//used by kidos app
var api = require('./controllers/api.js');

app.get('/', routes.index);
app.get('/users', user.list);
app.get('/listcategories', api.listCategories);
app.get('/listcategories/:catId', api.categoryById);
app.get('/download/:file(*)', api.downloadFile);

app.get('/findnearbyactivitiesbycategory/:longitude/:latitude/:id', api.findnearbyactivitiesbycategory);
app.get('/findnearbyactivitiesbyareaandcategory/:area/:id',api.findnearbyactivitiesbyareaandcategory);

app.get('/findnearbyactivities/:longitude/:latitude', api.findnearbyactivities);
app.get('/findnearbyactivitiesbyarea/:area', api.findnearbyactivitiesbyarea);

app.get('/findnearbyactivitiestype/:longitude/:latitude', api.findnearbyactivitiestype);
app.get('/findnearbyactivitiestypebyarea/:area', api.findnearbyactivitiestypebyarea);

app.get('/getactivitydetails/:activityid', api.getactivitydetails);
app.get('/getactivityareas',api.getactivityareas);

app.get('/kidoswebgui/test', function(req,res){
	res.send("hi, this is my first angularjs response");
});

//used by kidos web
var webapi = require('./controllers/webapi.js');
app.get('/sendactivationtext', webapi.sendactivationtext);
app.post('/generateOTP', webapi.generateOTP);
app.post('/generatePasswordResetOTP',webapi.generatePasswordResetOTP);
app.post('/resetpassword',webapi.resetpassword);
app.post('/authenticateuser', webapi.authenticateuser);
app.post('/registeractivity', webapi.registeractivity);
app.post('/loginservice', webapi.loginservice);
app.get('/sign', webapi.sign);

//used by kidospartners
var partnersapi = require('./controllers/kidospartnersapi.js');
app.get('/getactivitysummarybyuserid/:userid',partnersapi.getactivitysummarybyuserid);
app.get('/getclassdetailsbyactivityid/:activityid',partnersapi.getclassdetailsbyactivityid);
app.post('/saveclassdetailsbyactivityid',partnersapi.saveclassdetailsbyactivityid);
app.get('/getcontactdetailsbyactivityid/:activityid',partnersapi.getcontactdetailsbyactivityid);
app.post('/savecontactdetailsbyactivityid',partnersapi.savecontactdetailsbyactivityid);
app.get('/getactivitydetailsbyactivityid/:activityid',partnersapi.getactivitydetailsbyactivityid);
app.post('/saveactivitydetailsbyactivityid',partnersapi.saveactivitydetailsbyactivityid);



http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
