"use strict";
/*globals angular,window*/

window.twoFiftySix = {
   controllers: {},
   directives: {}
};
twoFiftySix.app = angular.module('twoFiftySix', []);


twoFiftySix.app.directive('eightBitPanel', function($compile) {
   return {
      restrict: 'A',
      transclude:true,
      template: '<div class="ebp-frame"><div class="tl"></div><div class="tr"></div><div class="bl"></div><div class="br"></div><div class="content"  ng-transclude></div></div>',
      link: function (scope, element, attrs) {
         element.addClass('ebp');
         var compiled = $compile('')(scope);
         element.append(compiled);
      }
   };
});


twoFiftySix.app.directive('twoFiftySix', function($compile) {
   return {
      restrict: 'A',
      link: function (scope, element, attrs) {
         var self = this;

         var renderCanvas = $compile('<canvas style="position:absolute;left:-9000px;top:-9000px;" width="256" height="256"></canvas>')(scope);
         var context = renderCanvas[0].getContext("2d");
         context.webkitImageSmoothingEnabled = false;
         context.mozImageSmoothingEnabled = false;

         element.append(renderCanvas);


         var loader = new eburp.ResourceLoader();
         loader.loadAll([
            "images/animation.png",
            "images/characters.png",
            "images/creatures.png",
            "images/environment.png",
            "images/equipment.png",
            "images/items.png",
            "images/ui.png"
         ],function(){
            var tileView = new eburp.TileMapView(element[0],loader);
            tileView.imageProcessor = new eburp.ImageProcessor(renderCanvas[0], tileView);
            tileView.tileMap = new eburp.TileMap("town");
            var scene = new eburp.Scene({autoStart: true});
            scene.addView(tileView);

            // Rig the view, and toss a party sprite in there.
            tileView.camera.point.set(8,4);
            var challengeSpriteFeature = {
               type : "sign",
               x : 12,
               y : 8,
               icon : "party.png"
            };
            tileView.tileMap.map.features.push(challengeSpriteFeature);
            console.log("READY TO GO!");
         });

      }
   };
});
