/// <reference path="../../types/underscore/underscore.d.ts"/>
/// <reference path="../../types/backbone/backbone.d.ts"/>
/// <reference path="../../types/angularjs/angular.d.ts"/>

module pow2.ui {
   export var app = angular.module('pow2', []);

// CombatView directive
// ----------------------------------------------------------------------------
   app.directive('combatView', function () {
      return {
         restrict: 'E',
         templateUrl: '/templates/combatView.html'
      };
   });


// DialogBubble directive
// ----------------------------------------------------------------------------
   app.directive('dialogBubble', function () {
      return {
         restrict: 'E',
         replace:true,
         templateUrl: '/templates/dialogBubble.html'
      };
   });
// StoreBubble directive
// ----------------------------------------------------------------------------
   app.directive('storeBubble', function () {
      return {
         restrict: 'E',
         templateUrl: '/templates/storeBubble.html'
      };
   });
// TempleView directive
// ----------------------------------------------------------------------------
   app.directive('templeView', function () {
      return {
         restrict: 'E',
         templateUrl: '/templates/templeView.html'
      };
   });
// PartyView directive
// ----------------------------------------------------------------------------
   app.directive('partyView', function () {
      return {
         restrict: 'E',
         templateUrl: '/templates/partyView.html'
      };
   });
// HeroView directive
// ----------------------------------------------------------------------------
   app.directive('heroView', function ($compile) {
      return {
         restrict: 'E',
         scope:true,
         templateUrl: '/templates/heroView.html',
         link: function ($scope, element, attrs) {
            $scope.hero = attrs.hero;
            $scope.$watch(attrs.hero, function(hero) {
               $scope.hero = hero;
            });
         }
      };
   });

// HeroView directive
// ----------------------------------------------------------------------------
   app.directive('heroStatsView', function ($compile) {
      return {
         restrict: 'E',
         scope:true,
         templateUrl: '/templates/heroStatsView.html',
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

