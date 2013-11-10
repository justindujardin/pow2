var soundOn = false;
var currentTrack;
var drawHack = false;


$(document).ready(function(){
   _.delay(function(){
      // Arg, why!?
      window.App = {
         gurk: new eburp.Gurk($("#screenID")[0])
      };
   },500);
   $('.sound-toggle').click(function(){
      toggleSound();
   });
});
function toggleSound() {
   soundOn = !soundOn;
   return soundOn && currentTrack ? playTrack(currentTrack) : stopTrack();
}

function phoneClick(event, x, y) {
   App.gurk.phoneClick(event, x, y);
   return false;
}

function playAudio(sound) {
   if (soundOn) {
      var element = document.getElementById(sound);
      element.volume = 0.25;
      element.play();
   }
   return false;
}
function playTrack(track) {
   var trackElem = $("#" + track)[0];
   if (currentTrack == track) {
      if (soundOn) {
         trackElem.play();
      }
      return false;
   }
   if (currentTrack) {
      trackElem.pause();
   }
   currentTrack = track;
   if (soundOn) {
      trackElem.currentTime = 0;
      trackElem.play();
   }
   return false;
}
function stopTrack() {
   if (currentTrack) {
      var trackElem = $("#" + currentTrack)[0];
      trackElem.pause();
   }
   return false;
}

function putData(key, value) {
   localStorage[key] = value;
}
function getData(key) {
   return localStorage[key]
}
function doCustomDraws() {
   return true;
}
