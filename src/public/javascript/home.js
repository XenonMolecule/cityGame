//STREET VIEW DATA SERVICE
var panorama,heading=210,currentPage = "home";

var theLocation=window.location.hash.replace("#","");

//FUNCTION TO BE CALLED WHEN THE GOOGLE API LOADS
function initMap() {
    //INIT STREET VIEW DATA SERVICE
    panorama = new google.maps.StreetViewPanorama(document.getElementById('street-view'),
    {
        position: {lat: 40.7587018, lng: -73.9849776},
        pov:{heading:heading,pitch:0},
        addressControl: false,
        addressControlOptions: false,
        disableDefaultUI: true,
        clickToGo:false
    });
    rotatePano();
}

function rotatePano(){
    heading-=0.0625;
    if(heading<0){
        heading+=360;
    }
    panorama.setPov({heading:heading,pitch:0});
    setTimeout(rotatePano,100);
}

//A function to switch the user to the desired page
function switchPage(nextPage){
    if(nextPage==""){
        nextPage = currentPage;
    }
    document.location = "./#"+nextPage;
    var className=$("."+nextPage).attr("id");
    
    if(className==undefined){
        className = "error";
        nextPage = "error";
    }
    className = className.replace("#","");
    $("."+currentPage).hide();
    $("."+className).show();
    $("."+currentPage+"Link").removeClass("active")
    $("."+className+"Link").addClass("active");
    if(className == "play"){
        addLogin();
    }
    currentPage = nextPage;
}

//ON LOAD SWITCH TO PROPER PAGE
if(theLocation!=""||theLocation!=undefined){
    switchPage(theLocation.trim().toLowerCase());
    $(".login").hide();
}

$("ul.nav.masthead-nav li").each(function(){
    $(this).click(function(){
        switchPage($(this).text().trim().toLowerCase()); 
    });
});

$("#signup").click(function(){
    switchPage("signup");
});

$(".signup-btn").click(function(){
    if(firebase.auth().currentUser==null){
        firebase.auth().createUserWithEmailAndPassword($("#signupEmail").val(),$("#signupPassword").val()).catch(function(error){
            $(".errorMessageSignup").text(error.message);
            $(".errorMessageSignup").show();
        }).then(function(user){
            if(firebase.auth().currentUser!=null){
                //TODO ADD ACCOUNT PAGE TO GO TO INSTEAD
                user.sendEmailVerification();
                switchPage("play");
                $("errorMessageSignup").hide();
                $("#signupEmail").val("");
                $("#signupPassword").val("");
            }
        });
    } else {
        $(".errorMessageSignup").text("You are already Logged in");
        $(".errorMessageSignup").show();
    }
});

$(".login-btn").click(function(){
    if(firebase.auth().currentUser==null){
        firebase.auth().signInWithEmailAndPassword($("#loginEmail").val(),$("#loginPassword").val()).catch(function(error){
            $(".errorMessageLogin").text(error.message);
            $(".errorMessageLogin").show();
        }).then(function(user){
            if(firebase.auth().currentUser!=null){
                $(".login").hide();
                $(".errorMessageLogin").hide();
                $("#loginEmail").val("");
                $("#loginPassword").val("");
                //TODO SHOW LEVEL SELECTION 
            }
        });
    } else {
        $(".errorMessageLogin").text("You are already Logged in");
        $(".errorMessageLogin").show();
    }
});

function addLogin(){
    if(firebase.auth().currentUser==null){
        $(".login").show();
    } else {
        $(".login").hide();
        if(!firebase.auth().currentUser.emailVerified){
            $(".notVerified").show();
        } else {
            $(".notVerified").hide();
        }
    }
}

//WHEN THE USERS LOGIN STATE CHANGES
firebase.auth().onAuthStateChanged(function(){
    addLogin(); 
});

//Resend verification email
$(".emailNotSent a").click(function(e){
    e.preventDefault();
    firebase.auth().currentUser.sendEmailVerification();
    $(".emailNotSent").text("Email Sent");
});