var kidosApp = angular.module('kidosApp',['ui.bootstrap','ui.router','xeditable']);

	kidosApp.run(function(editableOptions) {
  		editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
	});

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
        
         //Kidos welcome login page  Starts
        .state('welcome', {
            url: '/welcome',
            templateUrl: 'kidoswelcome.html',
            controller: 'KidosWelcomeCtrl'
        
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



  //Generic Modal launch
 /* function launchDialogs(which,data){
    var dlg = null;
    switch(which){
        
      // Error Dialog
      case 'error':
        dlg = $dialogs.error(data);
        break;
        
     // Wait / Progress Dialog
      case 'wait':
        dlg = $dialogs.wait(msgs[i++],progress);
        fakeProgress();
        break;
        
      // Notify Dialog
      case 'notify':
        dlg = $dialogs.notify('Something Happened!','Something happened that I need to tell you.');
        break;
        
      // Confirm Dialog
      case 'confirm':
        dlg = $dialogs.confirm('Please Confirm','Is this awesome or what?');
        dlg.result.then(function(btn){
          $scope.confirmed = 'You thought this quite awesome!';
        },function(btn){
          $scope.confirmed = 'Shame on you for not thinking this is awesome!';
        });
        break;
    	};
    };*/

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

    $scope.addimages = function(name,address)
    {
        $scope.form.images.push({name: name, imgurl: address});
        
    };

  $scope.registerActivity = function () {

   
     $http.post('http://www.kidos.co.in/registeractivity', $scope.form).
      success(function(data) {
        $location.path('/');
      }); 
  };


 $scope.welcomeform={};
 $scope.loginService = function () {

	  $http.post('http://www.kidos.co.in/loginservice', $scope.loginform).
      success(function(data) {
      	$scope.welcomeform=data;
      	alert("2"+ JSON.stringify($scope.welcomeform));
        $location.path('/welcome');
      }) 
      .error(function(data, status, headers, config) {
        console.error(data);
        if(status === 500) {
           alert(data.error);
           // launchDialogs('error',data.error);
        }
  });

};

  //fetch activity type
  $scope.categories = [];

   
     $http.get('http://www.kidos.co.in/listCategories').
        success(function(data){
            $scope.categories=data;
    });
    
    
  

});

kidosApp.filter('range', function() {
  return function(val, range) {
    range = parseInt(range);
    for (var i=0; i<range; i++)
      val.push(i);
    return val;
  };
});

kidosApp.controller('KidosWelcomeCtrl', ['$scope', function ($scope) {

$scope.rating = 0;
    $scope.ratingcount = [40,23,55,11,0];

    $scope.getSelectedRating = function (rating) {
        console.log(rating);
        return rating;
    };
    
    $scope.getRatingCount = function (rating) {
    	return $scope.ratingcount[rating-1];
    }

}]);



kidosApp.directive('starRating', function () {
    return {
        restrict: 'A',
        template: '<ul class="rating">' +
            '<li ng-repeat="star in stars" ng-class="star" ng-click="toggle($index)">' +
            '\u2605' +
            '</li>' +
            '</ul>',
        scope: {
            ratingValue: '=',
            max: '=',
            onRatingSelected: '&'
        },
        link: function (scope, elem, attrs) {

            var updateStars = function () {
                scope.stars = [];
                for (var i = 0; i < scope.max; i++) {
                    scope.stars.push({
                        filled: i < scope.ratingValue
                    });
                }
                };

            scope.toggle = function (index) {
                scope.ratingValue = index + 1;
                scope.onRatingSelected({
                    rating: index + 1
                });
            };

            scope.$watch('ratingValue', function (oldVal, newVal) {
                if (newVal) {
                    updateStars();
                }
            });
        }
    }
});
