//STREET VIEW DATA SERVICE
var panorama,heading=210,currentPage = "home",afterLogin="home";

var theLocation=window.location.hash.replace("#","");

//Pages that need authentication to reach
var authPages = ["play","shop","account"];

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

//A RECURSIVE FUNCTION TO ROTATE THE PANORAMA VIEW
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
    pageSwitch : {
        //prevent issue on first visit
        if(nextPage==""){
            nextPage = currentPage;
        }
        //figure out the login destination
        nextPage = loginExceptions(nextPage);
        
        //Check if auth page, and switch procedure if necessary
        if(handleAuthPages(nextPage)){
            break pageSwitch;
        } else if(theLocation=="login"&&currentPage=="login"&&nextPage=="login"){
            switchPage(afterLogin);
            break pageSwitch;
        }
        
        //Set the url to the proper look
        document.location = "./#"+nextPage;
        
        //get the true name of the page (helps with errors)
        var className=$("."+nextPage).attr("id");
        
        //Send to error page if not found
        if(className==undefined){
            className = "error";
            nextPage = "error";
        }
        
        //Show the proper page
        className = className.replace("#","");
        $("."+currentPage).hide();
        $("."+className).show();
        $("."+currentPage+"Link").removeClass("active")
        $("."+className+"Link").addClass("active");
        currentPage = nextPage;
    }
}

//ON LOAD SWITCH TO PROPER PAGE
if(theLocation!=""||theLocation!=undefined){
    switchPage(theLocation.trim().toLowerCase());
    $(".login").hide();
}

//SET UP NAVBAR
$("ul.nav.masthead-nav li").each(function(){
    $(this).click(function(){
        switchPage($(this).text().trim().toLowerCase()); 
    });
});

//HANDLE SIGNUP REDIRECT
$("#signup").click(function(){
    switchPage("signup");
});

//HANDLE SIGN UP
$(".signup-btn").click(function(){
    if(firebase.auth().currentUser==null){
        firebase.auth().createUserWithEmailAndPassword($("#signupEmail").val(),$("#signupPassword").val()).catch(function(error){
            $(".errorMessageSignup").text(error.message);
            $(".errorMessageSignup").show();
        }).then(function(user){
            if(firebase.auth().currentUser!=null){
                //TODO ADD ACCOUNT PAGE TO GO TO INSTEAD
                user.sendEmailVerification();
                switchPage("login");
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

//HANDLE LOGIN
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
                switchPage(afterLogin);
            }
        });
    } else {
        $(".errorMessageLogin").text("You are already Logged in");
        $(".errorMessageLogin").show();
    }
});

//Resend verification email
$(".emailNotSent a").click(function(e){
    e.preventDefault();
    firebase.auth().currentUser.sendEmailVerification();
    $(".emailNotSent").text("Email Sent");
});

//HANDLES THE SITUATIONS WHERE THE USER
//NEEDS TO LOGIN, THEN GO TO A PAGE
function loginExceptions(page){
    if(page.slice(0,page.length-1)=="login"){
        switch(page.slice(page.length-1,page.length)){
            case "p":
                afterLogin = "play";
                break;
            case "s":
                afterLogin = "shop";
                break;
            case "a":
                afterLogin = "account";
                break;
            default:
                afterLogin = "home";
        }
        return "login";
    }
    return page;
}

//A FUNCTION TO CHECK IF THE DESIRED PAGE
//REQUIRES AUTHENTICATION, AND HANDLE ACCORDINGLY
function handleAuthPages(page){
    if(firebase.auth().currentUser==null){
        $(".notVerified").hide();
        $(".loginInfo").show();
        return checkIfAuth(page);
    } else if(firebase.auth().currentUser.emailVerified==false){
        console.log("MUST VERIFY");
        $(".notVerified").show();
        $(".loginInfo").hide();
        return checkIfAuth(page);
    }
    return false;
}

//CHECKS IF THE PAGE THE USER IS GOING TO REQUIRES AUTH
function checkIfAuth(page){
    for(var i = 0; i < authPages.length; i++){
        if(page == authPages[i]){
            switchPage("login"+page.slice(0,1));
            return true;
        }
    }
    return false;
}

//WHEN LOGIN OR LOGOUT
firebase.auth().onAuthStateChanged(function(){
     if(checkIfAuth(currentPage)||currentPage=="login"){
         switchPage(currentPage);
     }
});