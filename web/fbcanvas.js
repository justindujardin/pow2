$(document).ready(function () {
   _.delay(function () {
      // Arg, why!?
      window.App = {
         gurk: new eburp.Gurk($("#screenID")[0])
      };
      App.gurk.notResponsive = true;
   }, 500);
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


demoGame.app.directive('eightBitPanel', function ($compile) {
   return {
      restrict: 'A',
      transclude: true,
      template: '<div class="tl"></div><div class="tr"></div><div class="bl"></div><div class="br"></div><div class="content"  ng-transclude></div>',
      controller: function ($scope) {
         $scope.login = function () {
            FB.login();
         };
         $scope.logout = function () {
            FB.logout();
         };

         FB.init({
            appId: window._context.fbAppId,
            cookie: true
         });

         function parseUserStatus(response) {
            if (response.status === 'connected') {
               FB.api('/me', function (response) {
                  $scope.$apply(function(){
                     $scope.user = response;
                     mixpanel.identify(response.id);
                     mixpanel.people.set({
                        "First Name": response.first_name,
                        "Last Name": response.username,
                        "Gender":response.gender
                     });

                  });
               });
            } else if (response.status === 'not_authorized') {
               // User is logged in, but has not authorized the app.
               FB.login();
            } else {
               // Status unknown -- not logged in.
               if(typeof $scope.user !== 'undefined'){
                  $scope.$apply(function(){
                     delete $scope.user;
                  });
               }
            }
         }
         FB.getLoginStatus(parseUserStatus);
         // Listen for login state changes.  Login/Logout/RefreshSession.
         FB.Event.subscribe('auth.authResponseChange', parseUserStatus);
      },
      link: function (scope, element, attrs) {
         element.addClass('ebp');
         var compiled = $compile('')(scope);
         element.append(compiled);
      }
   };
});