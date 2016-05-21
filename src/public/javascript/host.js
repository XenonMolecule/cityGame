var panorama,map,boundaries,locationInfo;

//FUNCTION TO BE CALLED WHEN THE GOOGLE API LOADS
function initMap() {
    //INIT MAP
    map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: 37.869260, lng: -122.254811},
          zoom: 8
        }
    );
    
    //INIT MARKER
    var marker = new google.maps.Marker({
        map: map,
        anchorPoint: new google.maps.Point(0, -29)
    });
    marker.setVisible(false);
    
    //INIT AUTOCOMPLETE
    var input = (document.getElementById('ac'));
    var autocomplete = new google.maps.places.Autocomplete(input,{
        types: ["(cities)"]
    });
    autocomplete.bindTo('bounds', map);
    
    autocomplete.addListener('place_changed',function(){
        marker.setVisible(false);
        var place = autocomplete.getPlace();
        boundaries = (autocomplete.getBounds()).toJSON();
        locationInfo = autocomplete;
        if(place.geometry.viewport){
            map.fitBounds(place.geometry.viewport);
        } else {
            map.setCenter(place.geometry.location);
            map.setZoom(17);
        }
        marker.setPosition(place.geometry.location);
        marker.setVisible(true);
    });
     /*
     panorama = new google.maps.StreetViewPanorama(
          document.getElementById('street-view'),
          {
            position: {lat: 37.869260, lng: -122.254811},
            pov: {heading: 165, pitch: 0},
            zoom: 1
          }
        );
     */
}