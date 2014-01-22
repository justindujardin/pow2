/// <reference path="../index.ts"/>
module pow2.ui {
   app.directive('eightBitPanel', function() {
      return {
         restrict: 'A',
         transclude:true,
         template: '<div class="tl"></div><div class="tr"></div><div class="bl"></div><div class="br"></div><div class="content"  ng-transclude></div>',
         link: function (scope, element, attrs) {
            element.addClass('ebp');
         }
      };
   });
}