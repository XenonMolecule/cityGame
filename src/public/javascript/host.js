var panorama,map,boundaries,locationInfo,thisID,gameStarted = false,partner,serverID,repeatedCheck,codeSuccess=0,startPosition,partnerPosition,position,time=0,points,gameOn = true;

//THE DIFFICULTY GOES AS FOLLOWS (16 is EASY, 14 is MEDIUM, 12 is HARD)
var difficulty = 16;

//STREET VIEW DATA SERVICE
var sv;

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
    
    //INIT STREET VIEW DATA SERVICE
    sv = new google.maps.StreetViewService();
    
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
        countDown(3,0,1000,function(num){},function(){
            boundaries = (autocomplete.getBounds()).toJSON();
            locationInfo = autocomplete;
        });
    });
    
    //INIT START BUTTON
    $("#startBtn").click(function(){
        if(boundaries!=undefined){
            $(".selection").hide();
            $("#map").hide();
            map.setZoom(difficulty);
            boundaries = (map.getBounds().toJSON());
            generateCode();
            waitForCondition(function(){
                return thisID!=undefined;
            },100,function(){
                $(".waitScreen h1").text(thisID);
                $(".waitScreen").fadeIn(1000);
            });
        }
    });
}

//ATTEMPT TO LINK WITH A "JOINER" WHEN THEY JOIN
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

//SHARE THE "JOINER"'S ID WITH THEM
socket.on('giveID',function(data){
   if(thisID!=undefined&&gameStarted==false){
       if(data.id==thisID){
           serverID = data.yourID;
           partner = data.partnerID;
           $(".connectMsg").text("A player has connected!");
           $(".startButton").removeClass("disabledBtn");
       }
   } 
});

//ATTEMPT TO GENERATE A UNIQUE GAME CODE
function generateCode(){
    var code = Math.round(Math.random()*100000);
    console.log(code);
    socket.emit('newGameCode',code);
    repeatedCheck = setInterval(checkCode,500,code);
}

//DETERMINE IF THE CODE IS UNIQUE
function checkCode(code){
    if(thisID == undefined){
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
                break;
            default:
                generateCode();
                clearInterval(repeatedCheck);
                codeSuccess = 0;
        }
    }
}

//HANDLE SUCCESSFUL OR REPEATED CODES
socket.on('failedCode',function(){
    if(codeSuccess!=1){
        codeSuccess = -1; 
    }
});

socket.on("successfulCode",function(){
    codeSuccess = 1;
})

//A GENERICK FUNCTION TO TAKE IN A CONDITION, AND WAIT TO CALL THE CALLBACK
//UNTIL THAT CONDITION IS MET
function waitForCondition(condition,checkInterval,callback){
    if(callback == undefined){
        callback = function(){};
    }
    if(condition()){
        callback();
    } else {
        setTimeout(waitForCondition,checkInterval,condition,checkInterval,callback);
    }
}

//HANDLE STARTING THE GAME
$(".beginGame").click(function(){
    if(partner!=undefined){
        console.log("fadeOut");
        $(".waitScreen").fadeOut(500,function(){
           $(".countDown").fadeIn(500);
           socket.emit("prepGame",{for:partner,boundaries:boundaries});
           countDown(6,0,1000,function(num){
               $(".countDown p").text(num+"...");
           },function(){
               if(startPosition==undefined){
                    keepTime();
                    startPosition = {lat: getRandom(boundaries.south,boundaries.north), lng: getRandom(boundaries.west,boundaries.east)};
                    console.log(startPosition);
                    panorama = new google.maps.StreetViewPanorama(document.getElementById('street-view'));
                    sv.getPanorama({location: startPosition, radius: 1500}, processSVData);
                    $(".countDown").hide();
                    $("#street-view").show();
                    panorama.addListener('position_changed',function(){
                       position = panorama.getPosition().toJSON();
                       checkVictory();
                    });
               }
           });
        });
    }
});

//A FUNCTION TO APPLY THE STREET FOUND TO THE PANORAMA
function processSVData(data, status){
    if (status === google.maps.StreetViewStatus.OK) {
        panorama.setPano(data.location.pano);
        panorama.setPov({
          heading: 270,
          pitch: 0
        });
        panorama.setVisible(true);
    } else {
        alert("could not find any photographed streets in the search area");
    }
}

//A FUNCTION TO CHECK IF THE PLAYERS HAVE WON
function checkVictory(){
    if(gameOn==true){
        if(partnerPosition!=undefined&&position!=undefined){
            var partnerOBJ = new google.maps.LatLng(partnerPosition.lat,partnerPosition.lng);
            var myOBJ = new google.maps.LatLng(position.lat,position.lng);
            var distance = google.maps.geometry.spherical.computeDistanceBetween(myOBJ,partnerOBJ);
            console.log("TEST")
            if(Math.abs(distance)<10){
                console.log("WHAT A WINNER");
                points = ((1800-time)*(difficulty-15));
                $(".points").text(points + " Points");
                $(".winmessage").prop("hidden",false);
                gameOn = false;
                socket.emit('win',{for:partner,time:time,difficulty:difficulty});
            }
        }
    }
}

socket.on('moved',function(data){
    if(partner!=undefined){
        if(serverID===data.for){
            partnerPosition = data.position;
            checkVictory();
        }
    }
});

function keepTime(){
    time++;
    if(time<1800){
        setTimeout(keepTime,1000);
    }
}


//TEST
socket.on('test',function(data){
    console.log(data);
})