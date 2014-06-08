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
// TempleView directive
// ----------------------------------------------------------------------------
   app.directive('templeView', ['game', 'powAlert', function (game:PowGameService,powAlert:PowAlertService) {
      return {
         restrict: 'E',
         templateUrl: '/source/ui/directives/templeView.html',
         controller: function($scope) {
            $scope.heal = () => {
               if(!$scope.temple){
                  return;
               }
               var model:GameStateModel = game.model;
               var money:number = model.get('gold');
               var cost:number = parseInt($scope.temple.cost);
               if(cost > money){
                  powAlert.show("You don't have enough money");
               }
               else {
                  //console.log("You have (" + money + ") monies.  Spending (" + cost + ") on temple");
                  model.set({
                     gold: money - cost
                  });
                  _.each(model.party,(hero:HeroModel) => {
                     hero.set({
                        hp: hero.get('maxHP')
                     });
                  });
                  powAlert.show("Your party has been healed! \nYou now have (" + model.get('gold') + ") monies.",null,2500);

               }
               $scope.temple = null;

            };
            $scope.cancel = () => {
               $scope.temple = null;
            };

         },
         link: function ($scope) {
            game.world.scene.on('temple:entered',function(feature){
               $scope.$apply(function(){
                  $scope.temple = feature;
               });
            });
            game.world.scene.on('temple:exited',function(){
               $scope.$apply(function(){
                  $scope.temple = null;
               });
            });
         }
      };
   }]);
}

