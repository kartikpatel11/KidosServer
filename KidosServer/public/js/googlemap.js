var geocoder;
var map;
var marker;
    
function initialize(){
//MAP
  var DUBAI = new google.maps.LatLng(25.27,55.31);
  var options = {
    zoom: 16,
    center: DUBAI,    
    mapTypeId: google.maps.MapTypeId.ROADMAP // ROADMAP | SATELLITE | HYBRID | TERRAIN
  };
        
  map = new google.maps.Map(document.getElementById("map_canvas"), options);
        
  //GEOCODER
  geocoder = new google.maps.Geocoder();
        
  marker = new google.maps.Marker({
    map: map,
    draggable: true
  });
        
}
  
$(document).ready(function() { 
  
	initialize();

	google.maps.event.addDomListener(window, 'load', initialize);     
          
  $(function() {
    $("#address").autocomplete({
      //This uses the geocoder to fetch the address values
      source: function(request, response) {
        geocoder.geocode( {'address': request.term }, function(results, status) {
          response($.map(results, function(item) {
            return {
              label:  item.formatted_address,
              value: item.formatted_address,
              latitude: item.geometry.location.lat(),
              longitude: item.geometry.location.lng()
            }
          }));
        })
      },
      //This is executed upon selection of an address
      select: function(event, ui) {
        
        //$scope.$apply(function() { 
          $("#latitude").val(ui.item.latitude);
          $("#longitude").val(ui.item.longitude);
       // });
          var location = new google.maps.LatLng(ui.item.latitude, ui.item.longitude);
          marker.setPosition(location);
          map.setCenter(location);
        
      }
    });

    $("a[ui-sref='step2']").on('shown.bs.tab', function(){
      
      google.maps.event.trigger(map, 'resize');
    });
  });
  
  
  
  
  
  //Add a listener to the marker for reverse geocoding
  google.maps.event.addListener(marker, 'drag', function() {
    geocoder.geocode({'latLng': marker.getPosition()}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        if (results[0]) {
          $('#address').val(results[0].formatted_address);
          $('#latitude').val(marker.getPosition().lat());
          $('#longitude').val(marker.getPosition().lng());
        }
      }
    });
  }); 
  
});


