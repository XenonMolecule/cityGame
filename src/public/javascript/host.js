var panorama,map,boundaries,locationInfo,thisID,gameStarted = false,partner,serverID,repeatedCheck,codeSuccess=0;

//FUNCTION TO BE CALLED WHEN THE GOOGLE API LOADS
function initMap() {
    //INIT MAP
    map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: 37.869260, lng: -122.254811},
          zoom: 8,
          streetViewControl:false
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
        $("#startBtn").removeClass("disabledBtn");
    });
    $("#startBtn").click(function(){
        if(boundaries!=undefined){
            $(".selection").hide();
            $("#map").hide();
            generateCode();
            waitForCondition(function(){
                return thisID!=undefined;
            },100,function(){
                $(".waitScreen h1").text(thisID);
                $(".waitScreen").fadeIn(1000);
            });
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

socket.on("join",function(id){
    if(thisID!=undefined&&partner==undefined){
        if(gameStarted === false){
            if(thisID == id.id){
                var data = {id:thisID,yourID:id.serverID}
                socket.emit("successfulPair",data);
            }
        }
    }
});

socket.on('giveID',function(data){
   if(thisID!=undefined&&gameStarted==false){
       if(data.id==thisID){
           serverID = data.yourID;
           partner = data.partnerID;
       }
   } 
});

function generateCode(){
    var code = Math.round(Math.random()*100000);
    console.log(code);
    socket.emit('newGameCode',code);
    repeatedCheck = setInterval(checkCode,100,code);
}

function checkCode(code){
    switch (codeSuccess){
        case -1:
            generateCode();
            clearInterval(repeatedCheck);
            codeSuccess = 0;
            break;
        case 1:
            thisID = code;
            clearInterval(repeatedCheck);
            codeSuccess = 0;
    }
}

socket.on('failedCode',function(){
   codeSuccess = -1; 
});

socket.on("successfulCode",function(){
    codeSuccess = 1;
})

function waitForCondition(condition,checkInterval,callback){
    if(condition()){
        callback();
    }
    setTimeout(waitForCondition,checkInterval,condition,checkInterval,callback);
}