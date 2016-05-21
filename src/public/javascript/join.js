var gameCode,gameStarted = false,partner,serverID;
$( document ).load(function(){
    $(".beginGame").on("click",function(){
        console.log("submit");
        if($(".code").val()!=""){
            gameCode = $(".code").val();
            socket.emit('join',$(".code").val());
        }
    });
    console.log("loaded");
});


socket.on('successfulPair',function(id){
    if(gameCode!=undefined&&gameStarted==false){
        serverID = id.yourID;
        partner = id.serverID;
        var data = {id:gameCode,yourID:partner}
        socket.emit('giveID',data);
    }
});

console.log("I am attached");