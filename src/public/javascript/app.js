// Initialize Firebase
var config = {
    apiKey: "AIzaSyAxmrA63gUWE-WHn7OF5NKUjDUTFAXU7JM",
    authDomain: "findme-c7429.firebaseapp.com",
    databaseURL: "https://findme-c7429.firebaseio.com",
    storageBucket: "findme-c7429.appspot.com",
};
firebase.initializeApp(config);

/*Bear with me here... I wrote this for reuseability, but this is going to be CRAZY
  (INT, start) is where the timer should start counting down from
  (INT, end) is the number that the countDown should stop at
  (INT,freq) is the amount of milliseconds between each time the timer counts down
  (FUNC, func) is a function that should take in a parameter of the current number,
                   and do whatever it wants with it
  (FUNC, callback) is a function that the timer should call on completion
  (DO NOT USE, currentNum) is for the recursive function to use for it's own purposes
*/
function countDown(start,end,freq,func,callback,currentNum){
    if(currentNum==undefined){
        currentNum = start;
    }
    if(currentNum>end) {
        currentNum--;
        func(currentNum);
        setTimeout(countDown,freq,start,end,freq,func,callback,currentNum);
    }
    if(currentNum==end){
        callback();
    }
}

function getRandom(min, max) {
  return Math.random() * (max - min) + min;
}

