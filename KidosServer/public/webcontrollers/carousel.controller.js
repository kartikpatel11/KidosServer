angular.module('kidosApp').controller('CarouselDemoCtrl', function ($scope) {
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
    alert(i);
    $scope.addSlide(i);
  }
});