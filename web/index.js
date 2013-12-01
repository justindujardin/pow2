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


demoGame.app.directive('eightBitPanel', function($compile) {
   return {
      restrict: 'A',
      transclude:true,
      template: '<div class="tl"></div><div class="tr"></div><div class="bl"></div><div class="br"></div><div class="content"  ng-transclude></div>',
      link: function (scope, element, attrs) {
         element.addClass('ebp');
         var compiled = $compile('')(scope);
         element.append(compiled);
      }
   };
});