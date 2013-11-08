var drawHack = false;
var soundOn = false;
var currentTrack;


$(function(){
   // Arg, why!?
   window.App = {
      gurk: new eburp.Gurk()
   };
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
   if (currentTrack == track) {
      if (soundOn) {
         document.getElementById(currentTrack).play();
      }
      return false;
   }
   if (currentTrack) {
      document.getElementById(currentTrack).pause();
   }
   currentTrack = track;
   if (soundOn) {
      document.getElementById(currentTrack).currentTime = 0;
      document.getElementById(currentTrack).play();
   }
   return false;
}
function stopTrack() {
   if (currentTrack) {
      document.getElementById(currentTrack).pause();
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
