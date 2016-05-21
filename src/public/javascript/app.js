var panorama,map,boundaries,locationInfo;

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: 37.869260, lng: -122.254811},
          zoom: 8
        }
    );
    var input = (document.getElementById('ac'));
    var autocomplete = new google.maps.places.Autocomplete(input,{
        types: ["(cities)"]
    });
    autocomplete.bindTo('bounds', map);
    
    autocomplete.addListener('place_changed',function(){
        var place = autocomplete.getPlace();
        boundaries = (autocomplete.getBounds()).toJSON();
        locationInfo = autocomplete;
        if(place.geometry.viewport){
            map.fitBounds(place.geometry.viewport);
        } else {
            map.setCenter(place.geometry.location);
            map.setZoom(17);
        }
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