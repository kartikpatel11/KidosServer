var kidosApp = angular.module('kidosApp',['ui.bootstrap','ui.router']);

	kidosApp.config(function($stateProvider, $urlRouterProvider) {
    
    $urlRouterProvider.otherwise('/');
        

        $stateProvider.state('/', {
            url: '/',
            templateUrl: 'kidoshome.html',
            controller: 'KidosAppCtrl'
        })
        

        //KidosRegistration Links Starts
        .state('signup', {
            url: '/signup',
            templateUrl: 'kidosregistration.html',
            controller: 'KidosAppCtrl'
        
        })

        
        .state('step1', {
            url: '/signup#step1',
            templateUrl: 'kidosregistration.html#step1',
            controller: 'KidosAppCtrl'
        
        })

        .state('step2', {
            url: '/signup#step2',
            templateUrl: 'kidosregistration.html#step2',
            controller: 'KidosAppCtrl'
        
        })

        .state('step3', {
            url: '/signup#step3',
            templateUrl: 'kidosregistration.html#step3',
            controller: 'KidosAppCtrl'
        
        })

        .state('complete', {
            url: '/signup#complete',
            templateUrl: 'kidosregistration.html#complete',
            controller: 'KidosAppCtrl'
        
        })

        //KidosRegistration Links Ends

        $stateProvider.state('gallery', {
            url: '/#gallery',
            templateUrl: 'kidoshome.html#gallery',
            controller: 'KidosAppCtrl'
        })

         $stateProvider.state('feedback', {
            url: '/#feedback',
            templateUrl: 'kidoshome.html#feedback',
            controller: 'KidosAppCtrl'
        })
        
   

      });
        

       


kidosApp.controller('KidosAppCtrl', function($scope,$http,$location) {
  
 /* $http.get("/kidoswebgui/test").success(function(response){
  
  $scope.logo = "../images/kidos_logo.png";  
  $scope.message = response;
  });
  */

   $scope.myInterval = 5000;
  $scope.noWrapSlides = false;
  var slides = $scope.slides = [];

  $scope.addSlide = function(i) {
    slides.push({
     // image: '//placekitten.com/' + newWidth + '/300',
        image: '../images/kidosweb'+i+'.jpeg',
        //text: ['More','Extra','Lots of','Surplus'][slides.length % 4] + ' ' +
       // ['Cats', 'Kittys', 'Felines', 'Cutes'][slides.length % 4]
    });
  };
  for (var i=1; i<6; i++) {
    $scope.addSlide(i);
  }

  $scope.template = {
    "kidosjumbotron": "jumbotron.html",
    "kidosfeedback": "feedback.html",
    "kidosgallery": "gallery.html"
  }



  $scope.form = {};

//used for activity details
    $scope.daylist= [
        {day:'Mon'},
        {day:'Tue'},
        {day:'Wed'},
        {day:'Thu'},
        {day:'Fri'},
        {day:'Sat'},
        {day:'Sun'}
    ];

    batches = 
    [

    ];

    images =
    [
        
    ];

     $scope.form= {
        batches:batches,
        images:images
    };

    $scope.availablefeeunits = [
        'Per Month','Per Session','Per Batch'];


    $scope.addBatch= function()
    {
         var seldays = [];
        angular.forEach($scope.daylist, function(days){
            if (days.selected) 
                {
                    seldays.push(days.day);
                    //cleanup for next input
                    days.selected=false;
                }
        });
        
       // var panelbody=$scope.from + "-"+ $scope.to;
        $scope.form.batches.push({days: seldays,starttime:$scope.from, endtime:$scope.to});
        //cleanup for next input
        $scope.from =null;
        $scope.to=null;
    };

    $scope.addimages = function(name, address)
    {
        $scope.form.images.push({filename: name, url: address});
        
    };

  $scope.registerActivity = function () {

    $http.post('http://www.kidos.co.in/registeractivity', $scope.form).
      success(function(data) {
        $location.path('/');
      }); 
  };


  //fetch activity type
  $scope.categories = [];

    $http.get('http://www.kidos.co.in/listCategories').
        success(function(data){
            $scope.categories=data;
    });
});