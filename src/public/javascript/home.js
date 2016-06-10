//STREET VIEW DATA SERVICE
var panorama,heading=210,currentPage = "home",afterLogin="home";

var theLocation=window.location.hash.replace("#","");

//Pages that need authentication to reach
var authPages = ["play","shop","account"];

//Pages that link to pages different from their name
var oddPages = [["sign out","home"],["my account","account"],["log in","account"]];

//Account features with/without auth
//IMPORTANT: For both, just don't include in either
var authAccountFeatures = [".signOut",".accountDivider",".myAccount"];
var unAuthedAccountFeatures = [".logIn"];

//PAGES THAT RUN FUNCTIONS WHEN OPENED
var specialPages = [['account',setupAccountPage]]

//INIT FILE READING STUFF
var file = new FileReader();
var fileData;

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
        if(nextPage.split(" ")[0]=="dropdown"){
            break pageSwitch;
        }
        //prevent issue on first visit
        if(nextPage==""){
            nextPage = currentPage;
        }
        //figure out the login destination
        nextPage = loginExceptions(nextPage);
        
        //Check if auth page, and switch procedure if necessary
        if(handleAuthPages(nextPage)){
            break pageSwitch;
        }
        
        //Fix getting stuck on login page glitch
        if((currentPage=="login")&&(nextPage=="login")&&(firebase.auth().currentUser!=null)){
            setTimeout(switchPage,100,afterLogin);
            afterLogin = "home";
            break pageSwitch;
        }
        
        //Run any special functions associated with the current page
        checkSpecialPages(nextPage);
        
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
        if(!($(this).hasClass("dropdown"))){
            if(!handleOutliers($(this).text().trim().toLowerCase())){
                switchPage($(this).text().trim().toLowerCase());
            }
        }
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
     authStateChanged();
});

//REDIRECTS USERS TO PROPER PAGE WHEN USING AN ABNORMAL LINKS
//SUCH AS SIGNOUT LINKING TO HOME
function handleOutliers(page){
    for(var i = 0; i < oddPages.length; i ++){
        if(page == oddPages[i][0]){
            switchPage(oddPages[i][1].trim().toLowerCase());
            return true;
        }
    }
    return false;
}

//SETUP SIGNOUT BUTTON
$(".signOut").on("click",function(){
    firebase.auth().signOut();
    authStateChanged();
});

//CALLED WHEN SIGNING IN OR OUT
function authStateChanged(){
    swapAccountModes();
}

//A FUNCTION THAT RETURNS WHETHER OR NOT THE USER IS LOGGED IN
function loggedIn(){
    return (firebase.auth().currentUser!=null);
}

//ADD PLAY BUTTON
$(".playBtn").on("click",function(){
   switchPage("play"); 
});

//CAPITALIZE THE FIRST LETTER OF A STRING
String.prototype.capitalize = function(){
    var string = this.split("");
    string[0] = string[0].toUpperCase();
    string = string.join("");
    return string;
}

//A FUNCTION TO SWAP THE AVAILABLE FEATURES TO A LOGGED IN OR NOT LOGGED IN PERSON
function swapAccountModes(){
    if(loggedIn()){
        $(".dropdown-toggle").html(playerName()+'<span class="caret"></span>');
        switchAccountFeatures();
    } else {
        $(".dropdown-toggle").html('Account<span class="caret"></span>');
        switchAccountFeatures();
    }
}

//SWITCHES WHAT A USER CAN DO DEPENDING ON IF AUTHED IN ACCOUNT MENU
function switchAccountFeatures(){
    //JUST A DIFFERENT WAY FOR THE JQUERY SHOW AND HIDE FUNCTIONS TO BE CALLED
    function show(className){
        $(className).show();
    }
    function hide(className){
        $(className).hide();
    }
    var showFunc;
    var hideFunc;
    if(loggedIn()){
        showFunc = show;
        hideFunc = hide;
    } else {
        showFunc = hide;
        hideFunc = show;
    }
    for(var i = 0; i < authAccountFeatures.length; i ++){
        showFunc(authAccountFeatures[i]);
    } 
    for(var i = 0; i < unAuthedAccountFeatures.length; i ++){
        hideFunc(unAuthedAccountFeatures[i]);    
    }
}

//FIX ANNOYING INPUT CSS ISSUE, BY REWIRING BUTTON ROUTE
$(".imageChanger").on("click",function(){
    $(".fileUpload").click(); 
});

//WHEN USER UPLOADS NEW IMAGE
$(".fileUpload").on("change", function (){
    var input = document.getElementById('fileUpload');
    if(input.files[0]!=undefined){
        file.readAsDataURL(input.files[0]);
    }
});

//WHEN THE IMAGE HAS LOADED
file.onload = function(event){
    fileData = file.result;
    var img = new Image();
    img.onload = function(){
        var canvas = document.getElementById('resizeImage');
        var context = canvas.getContext('2d');
        context.drawImage(img, 0, 0, img.width, img.height, 0, 0, 400, 400);
        canvas.toBlob(function(blob){
            var dataUrl;
            var fileReader = new FileReader();
            fileReader.onload = function(){
                dataUrl = this.result;
                if(loggedIn()){
                    socket.emit('newProfileImage',{user:firebase.auth().currentUser.uid,image:dataUrl});
                    setTimeout(switchPage,500,"account");
                }
            }
            fileReader.readAsDataURL(blob);
        })
    }
    img.src = fileData;
}

//GETS THE ACCOUNT PAGE INFORMATION PULLED UP FOR A USER
function setupAccountPage(){
    $(".avatar").attr("src","/static/images/players/default.png");
    if(loggedIn()){
        try{
        $.ajax("/static/images/players/"+firebase.auth().currentUser.uid+".txt",{error:function(e){
            $(".avatar").attr("src","/static/images/players/default.png");
        }}).done(function(data){
            $(".avatar").attr('src',data);
        });
        } catch(e){
            console.log(e);
        }
        $(".playerName").text(playerName());
        
    }
}

//CHECKS IF THE CURRENT PAGE HAS A FUNCTION ASSOCIATED WITH IT, AND RUNS IT IF IT DOES
function checkSpecialPages(page){
    for(var i = 0; i < specialPages.length; i++){
        if(specialPages[i][0]==page){
            specialPages[i][1]();
        }
    }
}

//RETURNS THE PLAYER NAME IN WHATEVER WAY I PREFER AT THE MOMENT -- RIGHT NOW EMAIL
function playerName(){
    if(loggedIn()){
        return firebase.auth().currentUser.email.split("@")[0].substring(0,20).capitalize();
    }
    return "";
}

//FIXES GLITCH WITH LOGIN LOADING BEFORE FIREBASE AUTHS
function fixLoginRedirect(){
    if(currentPage=="login"){
        if(loggedIn()){
            switchPage(afterLogin);
        }
    }
    setTimeout(fixLoginRedirect,100);
}

fixLoginRedirect();