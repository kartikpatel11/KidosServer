var kidosApp = angular.module('KidosApp',['ngAnimate','ui.bootstrap','ui.router']);

	kidosApp.config(function($stateProvider, $urlRouterProvider) {
    
    $urlRouterProvider.otherwise('/home');
    
    $stateProvider
        
        .state('home', {
            url: '/home',
            templateUrl: 'carousel.html',
            controller: 'CarouselDemoCtrl'
        })
        
        .state('getapp', {
        	url: '/getapp',
        	templateUrl: 'getapp.html',
        	controller: 'GetAppCtrl'
        
        })
        
        .state('register', {
            url: '/register',
            templateUrl: 'register.html',
            controller: 'RegisterCtrl'
        })
        
        // nested states 
        // each of these sections will have their own view
        // url will be nested (/form/profile)
        .state('register.profile', {
            url: '/profile',
            templateUrl: 'register-profile.html'
        })
        
        // url will be /form/interests
        .state('register.activities', {
            url: '/activities',
            templateUrl: 'register-activities.html'
        })
        
      });
        

       


kidosApp.controller('KidosAppCtrl', function($scope,$http) {
  
  $http.get("/kidoswebgui/test").success(function(response){
  
  $scope.logo = "../images/kidos_logo.png";  
  $scope.message = response;
  });
  
});