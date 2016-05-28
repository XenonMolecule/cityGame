//STREET VIEW DATA SERVICE
var panorama,heading=270;

//FUNCTION TO BE CALLED WHEN THE GOOGLE API LOADS
function initMap() {
    //INIT STREET VIEW DATA SERVICE
    panorama = new google.maps.StreetViewPanorama(document.getElementById('street-view'),
    {
        position: {lat: 34.1015969, lng: -118.3355452},
        pov:{heading:heading,pitch:0},
        addressControl: false,
        addressControlOptions: false,
        disableDefaultUI: true,
        clickToGo:false
    });
    rotatePano();
}

function rotatePano(){
    heading-=0.25;
    if(heading<0){
        heading+=360;
    }
    panorama.setPov({heading:heading,pitch:0});
    setTimeout(rotatePano,50);
}