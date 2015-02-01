/*
 Copyright (C) 2013-2015 by Justin DuJardin and Contributors

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

/// <reference path="../../types/backbone/backbone.d.ts"/>
/// <reference path="../../types/angularjs/angular.d.ts"/>
/// <reference path="../../lib/pow2.d.ts"/>

module pow2.ui {
   export var app = angular.module('pow2', [
      'ngAnimate',
      'pow2.angular',
      'ngSanitize',
      'ngTouch'
   ]);

// HeroView directive
// ----------------------------------------------------------------------------
   app.directive('heroCard', function () {
      return {
         restrict: 'E',
         scope:true,
         templateUrl: '/games/rpg/directives/heroCard.html',
         link: function ($scope, element, attrs) {
            $scope.hero = attrs.hero;
            $scope.$watch(attrs.hero, function(hero) {
               $scope.hero = hero;
            });
         }
      };
   });

}


//

