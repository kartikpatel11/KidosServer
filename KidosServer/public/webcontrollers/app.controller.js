var kidosApp = angular.module('kidosApp',['ui.bootstrap','ui.router','xeditable']);

	kidosApp.run(function(editableOptions) {
  		editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
	});
	
	kidosApp.service('kidosSharedProperties', ['$http','$q', function ($http,$q) {
        var welcomeform={};
        
        var deferObject;
        
        var modalInstance;
        
        var passresetOTPModalInstance;
        
        this.setPassResetModalInstance= function(modalObj)
        {
        	if(passresetOTPModalInstance!=null)
        		passresetOTPModalInstance.close('success');
        		
        	passresetOTPModalInstance=modalObj;
        };
        
        this.setModalInstance = function(modalObj)
        {
        	if(modalInstance!=null)
        		modalInstance.close('success');
        		
        	modalInstance=modalObj;
        };
        
        this.getmodalInstance = function()
        {
        	if(modalInstance)
        		return modalInstance;
        	else
        		return null;
        }
        
        this.closeModal = function()
        {
        	modalInstance.close('success');
        };
        
        this.openModal = function()
        {
        	modalInstance.open();
        };
        
        this.getWelcomeForm = function() {
        	return welcomeform;
        };
        
        this.setWelcomeForm = function(data) {
        	welcomeform=data;
        }
        
         this.clearWelcomeForm = function() {
        	welcomeform={};
        }
        
    	this.getCategoryPromise = function() {
    		var promise=$http.get('http://localhost:8080/listCategories'),
    		deferObject =  deferObject || $q.defer();
        		
        		 promise.then(
                  // OnSuccess function
                  function(answer){
                    // This code will only run if we have a successful promise.
                    deferObject.resolve(answer);
                  },
                  // OnFailure function
                  function(reason){
                    // This code will only run if we have a failed promise.
                    deferObject.reject(reason);
                  });
 
           return deferObject.promise;
        	}
     }]);
	

	kidosApp.config(function($stateProvider, $urlRouterProvider) {
    
    $urlRouterProvider.otherwise('/');
        

        $stateProvider.state('/', {
            url: '/',
            templateUrl: 'kidoshome.html',
            controller: 'KidosAppCtrl'
        })
        
        //kidos authenticate user
        $stateProvider.state('auth', {
            url: '/auth',
            templateUrl: 'kidoshome.html',
            controller: 'KidosAppCtrl'
        })
        
        //kidos password reset otp
        $stateProvider.state('passresetotp', {
            url: '/passresetotp',
            templateUrl: 'kidoshome.html',
            controller: 'KidosAppCtrl'
        })        
        
        //kidos password reset
        $stateProvider.state('passwordreset', {
            url: '/passwordreset',
            templateUrl: 'kidoshome.html',
            controller: 'KidosAppCtrl'
        })   
        
        //kidos myprofile page
          $stateProvider.state('myprofile', {
            url: '/myprofile',
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
        
        .state('signout', {
            url: '/signout',
            templateUrl: 'kidoshome.html',
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
     



kidosApp.controller('KidosAppCtrl', function($scope,$http,$location,$modal,$state,kidosSharedProperties) {
  

   $scope.myInterval = 5000;
  $scope.noWrapSlides = false;
  var slides = $scope.slides = [];

  $scope.addSlide = function(i) {
    slides.push({
        image: '../images/kidosweb'+i+'.jpeg',
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

    $scope.addimages = function(name,address)
    {
        $scope.form.images.push({name: name, imgurl: address});
        
    };

  $scope.registerActivity = function () {

   
     $http.post('http://localhost:8080/registeractivity', $scope.form).
      success(function(data) {
        $location.path('/');
      });
       
  };

 $scope.name='';
 
 $scope.loginService = function () {
	
	  $scope.loginStatusTxt='';
	  $scope.loginerr=false;
	  
	  $http.post('http://localhost:8080/loginservice', $scope.loginform).
      success(function(data) {
      	kidosSharedProperties.setWelcomeForm(data);
      	$scope.name=data.nickname;
      	$('#menu2').show();
      		$('#menu1').hide();
      		
      	  $scope.loginerr=true;
      	  $("#loginmenu").dropdown("toggle");
      	 // $(".dropdown-menu").hide();
        $location.path('/welcome');
      }) 
      .error(function(data, status, headers, config) {
        console.error(data);
        if(status === 500) {
        	
            $scope.loginStatusTxt=data.msg;
           // launchDialogs('error',data.error);
        }
  });
  
  

};

  //fetch activity type
  var categoryPromise = kidosSharedProperties.getCategoryPromise();

	categoryPromise.then(
        // OnSuccess function
        function(answer) {
     	  $scope.categorylist = answer.data;
        },
        // OnFailure function
        function(reason) {
          
        }
   );

//open modal registration window

	$scope.openAuthModalWindow =  function(resetind)
	{
		
		var mymodal=$modal.open({
    		 		templateUrl: '../kidosauth.html',
					controller: 'KidosAuthCtrl',
					windowClass: 'center-modal',
					scope: $scope,
					resolve: {
      					resetind: function(){
          				return resetind;
      					}
    				}
				});
				
		mymodal.result.catch(function() {
    			$('#register').blur();
    			$state.go('/');
		});	
 		kidosSharedProperties.setModalInstance(mymodal);
			
				
	};
	
//open modal pass reset window

	$scope.openAuthPassResetOTPModalWindow = function()
	{
	
		var mymodal=$modal.open({
    		 		templateUrl: '../kidospasswordresetotp.html',
					controller: 'KidosPassResetCtrl',
					windowClass: 'center-modal',
					scope: $scope
				});
				
		mymodal.result.catch(function() {
    			$('#passreset').blur();
    			$state.go('/');
		});	
 		kidosSharedProperties.setPassResetModalInstance(mymodal);
	
	};
	
//open signout modal window
	$scope.openSignoutModalWindow = function()
	{
	
		kidosSharedProperties.clearWelcomeForm();
		var mysignoffmodal=$modal.open({
    		 		templateUrl: '../kidossignout.html',
					windowClass: 'center-modal',
					scope: $scope
				});
				
		mysignoffmodal.result.catch(function() {
    			$state.go('/');
		});			
		$('#menu2').hide();
      	$('#menu1').show();
      	
	}	
	

//open my profile modal window
	$scope.openMyProfileModalWindow = function()
	{
	
		kidosSharedProperties.clearWelcomeForm();
		var mysignoffmodal=$modal.open({
    		 		templateUrl: '../kidosmyprofile.html',
					windowClass: 'center-modal',
					scope: $scope
				});
				
		mysignoffmodal.result.catch(function() {
    			$state.go('/');
		});			
      	
	}	
	

    if($location.path().indexOf('auth') > -1) {
    			$scope.openAuthModalWindow();
	};
	
	if($location.path().indexOf('passresetotp') > -1) {
    			$scope.openAuthPassResetOTPModalWindow();
	};
	if($location.path().indexOf('passwordreset') > -1) {
				$scope.openAuthModalWindow(1);
	};
	if($location.path().indexOf('signout') > -1) {
				$scope.openSignoutModalWindow();
	};
	if($location.path().indexOf('myprofile') > -1) {
				$scope.openMyProfileModalWindow();
	};
	
  

});

kidosApp.filter('range', function() {
  return function(val, range) {
    range = parseInt(range);
    for (var i=0; i<range; i++)
      val.push(i);
    return val;
  };
});


kidosApp.controller('KidosPassResetCtrl', [ '$scope', '$http', '$location','kidosSharedProperties', function ($scope,$http,$location, kidosSharedProperties) {

	$scope.passresetotpsucess=false;
	$scope.passresetotperr=false;
	
	$scope.generatePasswordResetOTP = function()
	{
		$http.post('http://localhost:8080/generatePasswordResetOTP', $scope.passresetform).
      success(function(data) {
      		$scope.msg = data.msg;
      		$scope.passresetotpsucess=true;
       		
      	}).error(function(data, status, headers, config) {
       		 console.error(data);
        	if(status === 500) {
        		$scope.msg = data.msg;
        		$scope.passresetotperr=true;
        	}
        });
	};

}]);


kidosApp.controller('KidosAuthCtrl', [ '$scope', '$http', '$location','resetind', 'kidosSharedProperties', function ($scope,$http,$location,resetind, kidosSharedProperties) {

	
	
	$scope.activatebtndisabled=true;
	$scope.otpmsg=false;
	
	//OTP button variables
	$scope.generateOTPtxt="Generate OTP";
	$scope.otppending=true;
	
	//Auth Button variables
	$scope.authstarted=false;
	$scope.activatebtntext="Activate Account";
	
	$scope.autherr=false;
	
	if(resetind==1)
	{
		$scope.resetind=resetind;
		$scope.activatebtndisabled=false;
		$scope.activatebtntext="Reset Password";
	}
	
	$scope.generateOTP = function() {
	
	
						
			$scope.activatebtndisabled=false;
			$scope.generateOTPtxt="Re-Generate OTP";
			$scope.otppending=false;
			$scope.otpmsg=false;
			
			$scope.authstarted=false;
			$scope.autherr=false; 
					
			$http.post('http://localhost:8080/generateOTP', $scope.authform).
      success(function(data) {
      		$scope.otpmsg=true;
       		
      	}).error(function(data, status, headers, config) {
       		 console.error(data);
        	if(status === 500) {
        		$scope.autherr=true; 
           		$scope.authStatusTxt = data.msg;
        	}
        });

      };
      
      $scope.authenticateUser =function() {
    
     	$scope.activatebtndisabled=true;
     	$scope.otpmsg=false;
     	$scope.authstarted=true;
     	$scope.url=''; 
     	$scope.path='';
     
     	if(resetind==0)
     	{
     		$scope.authStatusTxt="Verifying credentials, Please wait";
	     	$scope.url='http://localhost:8080/authenticateuser';
	     	$scope.path='welcome/';
	     }
	     else
	     {
	    	$scope.authStatusTxt="Resetting credentials, Please wait";
	     	$scope.url='http://localhost:8080/resetpassword';
	     	
	     } 
	     	$http.post($scope.url, $scope.authform).
      success(function(data) {
      		$scope.otpsent=false;
      		
      		if(resetind==0)
      		{
      			kidosSharedProperties.closeModal();
      			//open kidoswelcome page with activity details
      			kidosSharedProperties.setWelcomeForm(data);
      			$location.path($scope.path);
       		}
       		else
       		{
       			$scope.authStatusTxt=data.msg;
       		}
      	})
      .error(function (data, status, headers, config){
      	$scope.activatebtndisabled=false;
      	$scope.authstarted=false; 
      	
      	$scope.autherr=true;
      	$scope.authStatusTxt=data.msg;
      	}); 
			
	}; 
}]);


kidosApp.controller('KidosWelcomeCtrl', [ '$scope', '$http', 'kidosSharedProperties', function ($scope, $http, kidosSharedProperties) {

//$scope.welcomeform= {name:"heloworld"};

$scope.me=kidosSharedProperties.getWelcomeForm;


$scope.daylist= [
        {day:'Mon'},
        {day:'Tue'},
        {day:'Wed'},
        {day:'Thu'},
        {day:'Fri'},
        {day:'Sat'},
        {day:'Sun'}
    ];
    
$scope.showdays = function(batch) {
    var selected = [];
    angular.forEach($scope.daylist, function(d) { 
      if (batch.days.indexOf(d.day) >= 0) {
        selected.push(d.day);
      }
    });
    return selected.length ? selected.join(', ') : 'Not set';
  };

$scope.rating = 0;
    $scope.ratingcount = [40,23,55,11,0];

    $scope.getSelectedRating = function (rating) {
        console.log(rating);
        return rating;
    };
    
    $scope.getRatingCount = function (rating) {
    	return $scope.ratingcount[rating-1];
    }


$scope.initializeWithValues = function(longstr,latstr) {
	  
	        // obtain the attribues of each marker
	        var lat = parseFloat(latstr);
	        var lng = parseFloat(longstr);

	        var myLatlng = new google.maps.LatLng(lat, lng);
	        var options = {
	        	    zoom: 16,
	        	    center: myLatlng,    
	        	    mapTypeId: google.maps.MapTypeId.ROADMAP // ROADMAP | SATELLITE | HYBRID | TERRAIN
	        	  };
	        	        
	        	  map = new google.maps.Map(document.getElementById("map_canvas"), options);
	        	        
	        	  //GEOCODER
	        	  geocoder = new google.maps.Geocoder();
	        	        
	        	  marker = new google.maps.Marker({
	        	    map: map,
	        	    position:myLatlng,
	        	    draggable: true
	        	  });
	        	 
	    }

	if($scope.me().loc!=null)
	{
		
			$scope.initializeWithValues($scope.me().loc.coordinates[0],$scope.me().loc.coordinates[1]);
	}
	
	
	$scope.removeBatch=function(index) {
	
		$scope.me().batches.splice(index,1);
	}
	
	$scope.addBatch = function() {
    $scope.inserted = {
      days: [],
      starttime: '',
      endtime: '' 
    };
    $scope.me().batches.push($scope.inserted);
  };
	
	
	$scope.addimagedetails = function(name,address)
    {
    	$scope.me().images.push({name: name, imgurl: address});
        
    };
    

	
	$scope.addChanged=function(element) {
		
         var file = element.files[0];
			
			sign_request(file, function(response) {
				upload(file, response.signed_request, response.url, function() {
					
	       		$scope.$apply(function() {
	          $scope.addimagedetails(file.name,response.url);
	          
	        })
	      });

		});
	};
	
	var xhr = new XMLHttpRequest();
	
	
	$scope.abortupload =function() {
		abortfileupload();
	};
	
	function abortfileupload()
	{
		xhr.abort();
	}
	
	 function upload(file, signed_request, url, done) {
	  

		xhr.upload.onloadstart = function(e)
		{
				$('.progress-bar').css('width', '0%')
                      .attr('aria-valuenow', 0)
                        .addClass('progress-bar-success')
                      .removeClass('progress-bar-danger');
                      $("#progresstext").text('0%');
		     	$('.progress').show();   
			$('#progressrow').show();
		};      
    	xhr.upload.onprogress = function(e) {
		    if (e.lengthComputable) {
		    	
		        	var percentComplete = Math.floor((e.loaded / e.total) * 100);
		        	$('.progress-bar').css('width', percentComplete+'%')
                      .attr('aria-valuenow', percentComplete);
                      $("#progresstext").text(percentComplete +'%');
		        	
		        };
		 };
		 
		 xhr.upload.onloadend = function(e) {
		 	$(".progress-bar").animate({
					    width: "100%"
					}, 3000, function() {
					    $(this).closest('.progress').fadeOut();
					});
			$('#progressrow').hide();
		 };
		 
		 
		xhr.upload.onerror = function(e) {
		
			$('.progress-bar').css('width', '100%')
                      .attr('aria-valuenow', 100);
		
		};
		
		xhr.upload.onabort = function(e) {
		
   			$('#progressrow').hide();
		
		};
      
         
      xhr.onload = function() {
        if (xhr.status === 200) {
          done()
        }
      }
      
      xhr.open("PUT", signed_request);
      xhr.setRequestHeader('x-amz-acl', 'public-read');
  
      xhr.send(file)
    };

    function sign_request(file, done) {
      var xhr = new XMLHttpRequest()
      xhr.open("GET", "/sign?file_name=" + file.name + "&file_type=" + file.type)

      xhr.onreadystatechange = function() {
        if(xhr.readyState === 4 && xhr.status === 200) {
          var response = JSON.parse(xhr.responseText)
          done(response)
        }
      }

      xhr.send()
    };

	
	
	
	
	
	
 var categoryPromise = kidosSharedProperties.getCategoryPromise();

	categoryPromise.then(
        // OnSuccess function
        function(answer) {
          $scope.categorylist = answer.data;
        },
        // OnFailure function
        function(reason) {
          
        }
  	 );


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
