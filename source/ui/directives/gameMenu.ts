/**
 Copyright (C) 2013 by Justin DuJardin

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
/// <reference path="../services/gameService.ts"/>
module pow2.ui {

// Game Menu overlay directive
// ----------------------------------------------------------------------------
   app.directive('gameMenu', [
      'game',
      function (game:PowGameService) {
         return {
            restrict: 'E',
            replace:true,
            templateUrl: '/templates/gameMenu.html',
            controller: function($scope) {
               $scope.showParty = function(){
                  alert("Show party");
               };
               $scope.showInventory = function(){
                  alert("Show inv");
               };
               $scope.showSettings = function(){
                  alert("Show settings");
               };
            },
            link: function($scope) {
            }
         };
      }
   ]);
}

