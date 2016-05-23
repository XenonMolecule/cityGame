var gameCode,gameStarted = false,partner,serverID,startPosition,panorama,sv,points;

$(".beginGame").on("click",function(){
    if($(".code").val()!=""){
        gameCode = $(".code").val();
        socket.emit('join',$(".code").val());
    }
});


socket.on('successfulPair',function(id){
    if(gameCode!=undefined&&gameStarted==false){
        if(gameCode == id.id){
            serverID = id.yourID;
            partner = id.serverID;
            var data = {id:gameCode,yourID:partner}
            socket.emit('giveID',data);
            $(".joinGame").fadeOut(500,function(){
                $(".wait").fadeIn(500);
            });
        }
    }
});

socket.on('prepGame',function(who){
    if(who.for==serverID){
        countDown(6,0,1000,function(num){
            $(".wait p").text(num+"..."); 
        },function(){
            if(startPosition==undefined){
                sv = new google.maps.StreetViewService();
                startPosition = {lat: getRandom(who.boundaries.south,who.boundaries.north), lng: getRandom(who.boundaries.west,who.boundaries.east)};
                console.log(startPosition);
                panorama = new google.maps.StreetViewPanorama(document.getElementById('street-view'));
                sv.getPanorama({location: startPosition, radius: 1500}, processSVData);
                $(".wait").hide();
                $("#street-view").show();
                panorama.addListener('position_changed',function(){
                    var data = {};
                    data.position = panorama.getPosition().toJSON();
                    data.for = partner;
                    socket.emit('moved',data);
                });
            }
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

socket.on("win",function(data){
    console.log("WINNER");
    if(data.for==serverID){
        points = ((1800-data.time)*(data.difficulty-15));
        $(".points").text(points + "Points");
        $(".winmessage").fadeIn(1000);
    }
});