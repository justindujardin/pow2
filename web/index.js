$(document).ready(function(){
   _.delay(function(){
      // Arg, why!?
      window.App = {
         gurk: new eburp.Gurk($("#screenID")[0])
      };
   },500);
});
function phoneClick(event, x, y) {
   App.gurk.phoneClick(event, x, y);
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


///////////////////////////////
"use strict";
/*globals angular,window*/

/**
 * @class
 * @singleton
 */
var demoGame = window.demoGame = {
   controllers: {},
   directives: {}
};

/**
 * @singleton
 * @class
 * @type {angular.module}
 */
demoGame.app = angular.module('eburpDemo', []);
