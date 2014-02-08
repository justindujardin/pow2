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

// LevelStatsView directive
// ----------------------------------------------------------------------------
   app.directive('levelStatsView', function (game:PowGameService) {
      return {
         restrict: 'E',
         templateUrl: '/templates/levelStatsView.html',
         controller:function($scope) {
            $scope.calculateStats = function(hero:HeroModel){
               if(!hero){
                  $scope.levelTable = [];
                  return;
               }
               var levelTable = [];
               for(var i = 1; i <= HeroModel.MAX_LEVEL; i++){
                  levelTable.push({
                     level:i,
                     hp:hero.getHPForLevel(i),
                     experience:hero.getXPForLevel(i),
                     strength: hero.getStrengthForLevel(i),
                     agility: hero.getAgilityForLevel(i),
                     intelligence: hero.getIntelligenceForLevel(i),
                     vitality: hero.getVitalityForLevel(i)
                  });
               }
               $scope.levelTable = levelTable;
            };
         },
         link: function ($scope, element, attrs) {
            $scope.calculateStats(game.model.party[0]);
         }
      };
   });

}

